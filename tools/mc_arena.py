#!/usr/bin/env python3
"""The minecraft task's only interface to the game. Four players (bodies p1..p4) live in one shared survival world
(vanilla 1.20.4, Easy, no commands); a player acts by running a JavaScript program on its body.

    mc_arena.py run --player p1 [--timeout 60] FILE|-     run a program on p1's body (FILE, or - for stdin)
    mc_arena.py say --player p1 TEXT                      say TEXT in the game's chat (no /commands)
    mc_arena.py status                                    every body: position, health, food, inventory, controller
    mc_arena.py chat [--since N] [--last N]               the game's chat (N: message number)
    mc_arena.py events [--type T] [--last N]              deaths, advancements, joins, restarts
    mc_arena.py programs [--player p1] [--last N] [--full]  programs run so far, with their output

A program is the body of an async function `(bot, Movements, goals, require, console)`: `bot` is a mineflayer bot with
the pathfinder plugin loaded, `Movements` and `goals` come from mineflayer-pathfinder. It may require Node built-ins and
the installed mineflayer packages, except modules that start processes, open sockets or touch files. Values stored on
`global` persist between programs of the same player. It runs until it returns or the timeout (default 60 s, at most
600 s); on timeout its bot is stopped. The result: what it logged, what it returned, any error, the body's state, and
the chat since that player's previous program. One program per body at a time; the first role (EAT_ROLE) to run a
program on a body owns that body for the iteration, and a role controls one body.

Harness only (agents never run these):
    mc_arena.py up       start the server and the bot host if they are not running, wait until every body is in the
                         game, then clear the body locks (a new iteration); a supervisor restarts either after a crash
    mc_arena.py down     save the world, stop the bot host and the server, confirm both exited

Records (.work/mc/records/): programs.jsonl, chat.jsonl, events.jsonl; server output in .work/mc/logs/.
Environment: MC_DIR (.work/mc), MC_API_SOCK (.work/mc/run/api.sock), MC_JAVA_MEM (6G), EAT_ROLE, EAT_ITER.
"""
import argparse
import http.client
import json
import os
import re
import signal
import socket
import struct
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MC = Path(os.environ.get("MC_DIR", ROOT / ".work" / "mc"))
SRV = MC / "server"
RECORDS = MC / "records"
LOGS = MC / "logs"
RUN = MC / "run"
HOST_DIR = ROOT / "tools" / "mc_arena"
API_SOCK = Path(os.environ.get("MC_API_SOCK", RUN / "api.sock"))   # the bot host's API (a unix socket: see bothost.js)
PLAYERS = ("p1", "p2", "p3", "p4")
UP_TIMEOUT = 300           # seconds `up` waits for every body to be in the game
UNRESPONSIVE = 60          # seconds without an API answer before the supervisor restarts the bot host


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def append(name: str, rec: dict) -> None:
    RECORDS.mkdir(parents=True, exist_ok=True)
    with open(RECORDS / name, "a") as f:
        f.write(json.dumps(rec) + "\n")


def read_jsonl(name: str) -> list[dict]:
    out, p = [], RECORDS / name
    if p.exists():
        for line in p.read_text(errors="replace").splitlines():
            try:
                out.append(json.loads(line))
            except ValueError:
                pass
    return out


class _UnixHTTP(http.client.HTTPConnection):
    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.settimeout(self.timeout)
        self.sock.connect(str(API_SOCK))


def api(method: str, path: str, data: dict | None = None, timeout: float = 10):
    conn = _UnixHTTP("localhost", timeout=timeout)
    try:
        conn.request(method, path, body=None if data is None else json.dumps(data).encode(),
                     headers={"content-type": "application/json"})
        r = conn.getresponse()
        body = r.read()
    except http.client.HTTPException as e:
        raise OSError(f"bot host API: {e!r}") from e
    finally:
        conn.close()
    if r.status != 200:
        raise OSError(f"bot host API answered {r.status}: {body[:500]!r}")
    return json.loads(body)


# ---- RCON (harness only: save-all, stop, list) ----

def rcon(command: str, timeout: float = 30) -> str:
    props = dict(l.split("=", 1) for l in (SRV / "server.properties").read_text().splitlines() if "=" in l and not l.startswith("#"))
    pw = (MC / "rcon.secret").read_text().strip()
    with socket.create_connection(("127.0.0.1", int(props.get("rcon.port", 25575))), timeout=timeout) as s:
        def send(rid: int, kind: int, body: str):
            payload = struct.pack("<ii", rid, kind) + body.encode() + b"\0\0"
            s.sendall(struct.pack("<i", len(payload)) + payload)

        def recv() -> tuple[int, str]:
            n = struct.unpack("<i", _read(s, 4))[0]
            data = _read(s, n)
            return struct.unpack("<i", data[:4])[0], data[8:-2].decode(errors="replace")

        send(1, 3, pw)
        if recv()[0] == -1:
            raise RuntimeError("rcon authentication failed")
        send(2, 2, command)
        return recv()[1]


def _read(s: socket.socket, n: int) -> bytes:
    buf = b""
    while len(buf) < n:
        chunk = s.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("rcon connection closed")
        buf += chunk
    return buf


# ---- processes ----

def pid_of(name: str, marker: str) -> int | None:
    """The pid in run/<name>.pid if that process is alive and its command line contains marker."""
    try:
        pid = int((RUN / f"{name}.pid").read_text())
        if marker.encode() in Path(f"/proc/{pid}/cmdline").read_bytes():
            return pid
    except (OSError, ValueError):
        pass
    return None


def alive(pid: int) -> bool:
    """The process exists and is not a zombie."""
    try:
        return Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()[0] != "Z"
    except OSError:
        return False


LOG_LINE = re.compile(r"^\[[\d:]+\] \[([^\]]+)\]: (.*)$")
CHAT = re.compile(r"^(?:\[Not Secure\] )?<([A-Za-z0-9_]+)> (.*)$")
ADV = re.compile(r"^([A-Za-z0-9_]+) has (made the advancement|completed the challenge|reached the goal) \[(.+)\]$")
JOIN = re.compile(r"^([A-Za-z0-9_]+) (joined|left) the game$")


class Supervisor:
    """Runs the server and the bot host; restarts either after a crash (the server from its latest save)."""

    def __init__(self):
        self.stopping = False
        self.server: subprocess.Popen | None = None
        self.host: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.crashes: dict[str, list[float]] = {"server": [], "bothost": []}

    def log(self, msg: str) -> None:
        print(f"{now()} {msg}", flush=True)

    def start_server(self) -> None:
        mem = os.environ.get("MC_JAVA_MEM", "6G")
        self.ready.clear()
        self.server = subprocess.Popen(["java", f"-Xms{mem}", f"-Xmx{mem}", "-jar", "server.jar", "nogui"], cwd=SRV,
                                       stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                       text=True, errors="replace", bufsize=1)
        (RUN / "server.pid").write_text(str(self.server.pid))
        append("events.jsonl", {"time": now(), "type": "server_start", "pid": self.server.pid})
        threading.Thread(target=self.read_server, args=(self.server,), daemon=True).start()
        self.log(f"server started (pid {self.server.pid})")

    def read_server(self, proc: subprocess.Popen) -> None:
        with open(LOGS / "server.log", "a") as out:
            for line in proc.stdout:
                out.write(line)
                out.flush()
                m = LOG_LINE.match(line.rstrip("\n"))
                if not m or not m[1].startswith("Server thread/"):
                    continue
                msg = m[2]
                if msg.startswith("Done ("):
                    self.ready.set()
                elif c := CHAT.match(msg):
                    append("chat.jsonl", {"time": now(), "player": c[1], "text": c[2]})
                elif a := ADV.match(msg):
                    append("events.jsonl", {"time": now(), "type": "advancement", "player": a[1], "title": a[3],
                                            "kind": a[2]})
                elif j := JOIN.match(msg):
                    append("events.jsonl", {"time": now(), "type": j[2] == "joined" and "join" or "leave", "player": j[1]})

    def start_host(self) -> None:
        env = dict(os.environ, MC_DIR=str(MC))
        out = open(LOGS / "bothost.log", "a")
        self.host = subprocess.Popen(["node", "bothost.js"], cwd=HOST_DIR, env=env, stdin=subprocess.DEVNULL,
                                     stdout=out, stderr=subprocess.STDOUT)
        out.close()
        (RUN / "bothost.pid").write_text(str(self.host.pid))
        append("events.jsonl", {"time": now(), "type": "bothost_start", "pid": self.host.pid})
        self.log(f"bot host started (pid {self.host.pid})")

    def wait_server(self) -> bool:
        while not self.ready.wait(1):
            if self.server.poll() is not None or self.stopping:
                return False
        return True

    def stop_host(self) -> None:
        if self.host and self.host.poll() is None:
            self.host.send_signal(signal.SIGTERM)
            try:
                self.host.wait(30)
            except subprocess.TimeoutExpired:
                self.host.kill()
                self.host.wait()
        if self.host:
            append("events.jsonl", {"time": now(), "type": "bothost_stop", "pid": self.host.pid})

    def stop_server(self) -> None:
        if not self.server or self.server.poll() is not None:
            return
        try:
            rcon("save-all flush", timeout=120)
            rcon("stop")
        except (OSError, RuntimeError) as e:
            self.log(f"rcon failed ({e}); stopping through the console")
            try:
                self.server.stdin.write("stop\n")
                self.server.stdin.flush()
            except OSError:
                pass
        try:
            self.server.wait(180)
        except subprocess.TimeoutExpired:
            self.log("server did not stop in 180 s; killing it")
            self.server.kill()
            self.server.wait()
        append("events.jsonl", {"time": now(), "type": "server_stop", "pid": self.server.pid,
                                "exit": self.server.returncode})

    def backoff(self, what: str) -> None:
        """A process that keeps crashing is restarted more slowly: once a minute after 3 crashes in 10 minutes."""
        t = time.time()
        self.crashes[what] = [c for c in self.crashes[what] if t - c < 600] + [t]
        if len(self.crashes[what]) > 3:
            self.log(f"{what} keeps crashing; next restart in 60 s")
            self.sleep(60)

    def sleep(self, s: float) -> None:
        end = time.time() + s
        while not self.stopping and time.time() < end:
            time.sleep(0.5)

    def run(self) -> int:
        RUN.mkdir(parents=True, exist_ok=True)
        LOGS.mkdir(parents=True, exist_ok=True)
        (RUN / "supervisor.pid").write_text(str(os.getpid()))
        signal.signal(signal.SIGTERM, lambda *_: setattr(self, "stopping", True))
        signal.signal(signal.SIGINT, lambda *_: setattr(self, "stopping", True))
        self.start_server()
        if not self.wait_server():
            self.log("server did not come up")
            self.stop_server()
            return 1
        self.start_host()
        silent_since = None
        checked = 0.0
        while not self.stopping:
            self.sleep(2)
            if self.stopping:
                break
            if time.time() - checked > 60:     # first sighting of stat milestones (stats carry no time)
                checked = time.time()
                try:
                    import eval_minecraft
                    eval_minecraft.milestones(record=True)
                except Exception as e:
                    self.log(f"milestone check failed: {e}")
            if self.server.poll() is not None:
                code = self.server.returncode
                self.log(f"server exited ({code}); restarting from the latest save")
                append("events.jsonl", {"time": now(), "type": "restart", "what": "server", "exit": code})
                self.backoff("server")
                if self.stopping:
                    break
                self.start_server()
                if not self.wait_server():
                    continue
            if self.host.poll() is not None:
                code = self.host.returncode
                self.log(f"bot host exited ({code}); restarting it")
                append("events.jsonl", {"time": now(), "type": "restart", "what": "bothost", "exit": code})
                self.backoff("bothost")
                if self.stopping:
                    break
                self.start_host()
                silent_since = None
                continue
            try:
                api("GET", "/health", timeout=5)
                silent_since = None
            except (OSError, ValueError):
                silent_since = silent_since or time.time()
                if time.time() - silent_since > UNRESPONSIVE + 30:   # first start: node needs a moment to listen
                    self.log("bot host unresponsive; restarting it")
                    append("events.jsonl", {"time": now(), "type": "restart", "what": "bothost", "exit": "unresponsive"})
                    self.host.kill()
                    self.host.wait()
                    self.start_host()
                    silent_since = None
        self.log("stopping")
        self.stop_host()
        self.stop_server()
        for name in ("bothost", "server", "supervisor"):
            (RUN / f"{name}.pid").unlink(missing_ok=True)
        self.log("stopped")
        return 0


def cmd_supervise(_args) -> int:
    return Supervisor().run()


def cmd_up(args) -> int:
    if not (SRV / "server.jar").exists():
        print("the server is not set up: run bash tasks/minecraft/setup.sh", file=sys.stderr)
        return 1
    LOGS.mkdir(parents=True, exist_ok=True)
    sup = pid_of("supervisor", "_supervise")
    if sup is None:
        with open(LOGS / "supervisor.log", "a") as out:
            sup = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "_supervise"], cwd=ROOT,
                                   stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                                   start_new_session=True).pid
        print(f"starting the server and the bot host (supervisor pid {sup})", flush=True)
    deadline = time.time() + UP_TIMEOUT
    state = None
    while time.time() < deadline:
        if not alive(sup):
            print("the supervisor exited; see .work/mc/logs/supervisor.log and server.log", file=sys.stderr)
            return 1
        try:
            state = api("GET", "/health", timeout=5)
            if state["ready"]:
                break
        except (OSError, ValueError):
            pass
        time.sleep(1)
    else:
        print(f"not every body is in the game after {UP_TIMEOUT}s: {state}", file=sys.stderr)
        return 1
    api("POST", "/locks/clear", {})
    append("events.jsonl", {"time": now(), "type": "up", "iteration": os.environ.get("EAT_ITER")})
    print("up: every body is in the game; body locks cleared")
    return cmd_status(args)


def cmd_down(_args) -> int:
    sup = pid_of("supervisor", "_supervise")
    pids = {n: pid_of(n, m) for n, m in (("server", "server.jar"), ("bothost", "bothost.js"))}
    if sup is None:
        stray = {n: p for n, p in pids.items() if p}
        print("down: not running" + (f" (but found {stray}: stop them by hand)" if stray else ""))
        return 1 if stray else 0
    try:
        print(rcon("save-all flush", timeout=120).strip() or "saved")
    except (OSError, RuntimeError) as e:
        print(f"save-all failed: {e} (the supervisor saves again while stopping)")
    os.kill(sup, signal.SIGTERM)
    deadline = time.time() + 300
    while time.time() < deadline and (alive(sup) or any(p and alive(p) for p in pids.values())):
        time.sleep(1)
    left = {n: p for n, p in dict(pids, supervisor=sup).items() if p and alive(p)}
    if left:
        print(f"down: still running: {left}", file=sys.stderr)
        return 1
    append("events.jsonl", {"time": now(), "type": "down"})
    print("down: bot host and server stopped, world saved")
    return 0


# ---- the players' commands ----

def unreachable() -> int:
    print("the game is not reachable right now (the bot host is down or restarting; it restarts by itself). "
          "Try again in a minute.", file=sys.stderr)
    return 3


def fmt_state(s: dict) -> str:
    if not s or not s.get("connected"):
        return "not in the game (reconnecting)"
    p = s["position"]
    return (f"({p['x']}, {p['y']}, {p['z']}) in {s.get('dimension')}, health {s.get('health')}/20, "
            f"food {s.get('food')}/20, {'alive' if s.get('alive') else 'DEAD (respawning)'}")


def cmd_run(args) -> int:
    code = sys.stdin.read() if args.file == "-" else Path(args.file).read_text()
    req = {"player": args.player, "code": code, "timeout": args.timeout,
           "role": os.environ.get("EAT_ROLE") or "manual", "iter": os.environ.get("EAT_ITER")}
    try:
        res = api("POST", "/run", req, timeout=min(args.timeout, 600) + 60)
    except (OSError, ValueError):
        return unreachable()
    if res.get("refused"):
        print(f"refused: {res['refused']}")
        return 2
    print(f"program #{res['n']} on {res['player']}: {res['duration_s']} s" + (" (TIMED OUT)" if res["timed_out"] else ""))
    if res.get("background"):
        print("--- background output since the previous program (timers, listeners) ---")
        print(res["background"])
    print("--- output ---")
    print(res["output"] if res["output"] else "(nothing logged)")
    if res.get("error"):
        print("--- error ---")
        print(res["error"])
    else:
        print("--- returned ---")
        print(json.dumps(res["return"], indent=1) if res["return"] is not None else "(nothing)")
    print("--- chat since this player's previous program ---")
    print("\n".join(res["chat"]) if res["chat"] else "(none)")
    print(f"--- {res['player']} now: {fmt_state(res['state'])}")
    return 1 if res.get("error") else 0


def cmd_say(args) -> int:
    args.file, args.timeout = "-", 10
    sys.stdin = __import__("io").StringIO(f"bot.chat({json.dumps(' '.join(args.text))})")
    return cmd_run(args)


def cmd_status(_args) -> int:
    try:
        st = api("GET", "/status")
    except (OSError, ValueError):
        return unreachable()
    for name, s in st.items():
        ctrl = s.get("controller")
        who = f"controlled by {ctrl['role']}" + (f" (iteration {ctrl['iter']})" if ctrl.get("iter") else "") if ctrl else "free"
        run = f", running program #{s['running']['n']} for {s['running']['for_s']} s" if s.get("running") else ""
        print(f"{name}: {fmt_state(s)}; {who}{run}")
        if s.get("connected"):
            inv = s["inventory"]
            items = ", ".join(f"{k} x{v}" for k, v in sorted(inv["items"].items())) or "empty"
            eq = ", ".join(f"{k}: {v}" for k, v in inv["equipped"].items())
            print(f"    held: {s.get('held') or 'nothing'}; inventory: {items}" + (f"; worn: {eq}" if eq else ""))
    return 0


def cmd_chat(args) -> int:
    msgs = read_jsonl("chat.jsonl")
    first = args.since if args.since else max(1, len(msgs) - args.last + 1)
    for i, m in enumerate(msgs[first - 1:], start=first):
        print(f"#{i} {m['time'][:19]} {m['player']}: {m['text']}")
    if not msgs:
        print("(no chat yet)")
    return 0


def cmd_events(args) -> int:
    evs = [e for e in read_jsonl("events.jsonl") if not args.type or e["type"] == args.type]
    for e in evs[-args.last:]:
        rest = {k: v for k, v in e.items() if k not in ("time", "type")}
        print(f"{e['time'][:19]} {e['type']:<14} " + " ".join(f"{k}={v}" for k, v in rest.items()))
    return 0


def cmd_programs(args) -> int:
    progs = [p for p in read_jsonl("programs.jsonl") if not args.player or p.get("player") == args.player]
    cut = (lambda s: s) if args.full else (lambda s: s if len(s) <= 1500 else s[:1500] + f"\n... ({len(s)} chars; --full)")
    for p in progs[-args.last:]:
        head = f"== #{p.get('n')} {p['time'][:19]} {p['player']} role={p.get('role')} iter={p.get('iteration')}"
        if p.get("refused"):
            print(f"{head} REFUSED: {p['refused']}")
            continue
        print(f"{head} {p.get('duration_s')} s" + (" TIMED OUT" if p.get("timed_out") else ""))
        print(cut(p["code"].rstrip()))
        if p.get("output"):
            print("-- output --\n" + cut(p["output"]))
        if p.get("error"):
            print("-- error --\n" + cut(p["error"]))
        elif p.get("return") is not None:
            print("-- returned --\n" + cut(json.dumps(p["return"])))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--player", required=True, choices=PLAYERS)
    r.add_argument("--timeout", type=float, default=60)
    r.add_argument("file")
    s = sub.add_parser("say")
    s.add_argument("--player", required=True, choices=PLAYERS)
    s.add_argument("text", nargs="+")
    sub.add_parser("status")
    c = sub.add_parser("chat")
    c.add_argument("--since", type=int, default=0)
    c.add_argument("--last", type=int, default=30)
    e = sub.add_parser("events")
    e.add_argument("--type")
    e.add_argument("--last", type=int, default=50)
    p = sub.add_parser("programs")
    p.add_argument("--player", choices=PLAYERS)
    p.add_argument("--last", type=int, default=5)
    p.add_argument("--full", action="store_true")
    sub.add_parser("up")
    sub.add_parser("down")
    sub.add_parser("_supervise")
    args = ap.parse_args()
    return {"run": cmd_run, "say": cmd_say, "status": cmd_status, "chat": cmd_chat, "events": cmd_events,
            "programs": cmd_programs, "up": cmd_up, "down": cmd_down, "_supervise": cmd_supervise}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
