#!/usr/bin/env python3
"""The minecraft task's only interface to the game. Four players (bodies p1..p4) live in one shared survival world
(vanilla 1.20.4, Easy, no commands); a player acts by running a JavaScript program on its body.

    mc_arena.py run --player p1 [--timeout 60] FILE|-     run a program on p1's body (FILE, or - for stdin)
    mc_arena.py say --player p1 TEXT                      say TEXT in the game's chat (no /commands)
    mc_arena.py status                                    every body: position, health, food, inventory, controller
    mc_arena.py chat [--since N] [--last N]               the game's chat (N: message number)
    mc_arena.py events [--type T] [--last N]              deaths, advancements, joins, restarts
    mc_arena.py programs [--player p1] [--last N] [--full]  programs run so far, with their output

Practice sandbox (a throwaway copy of the world; nothing in it counts or flows back):
    mc_arena.py sandbox reset                             make the sandbox a fresh copy of the world as it is now
                                                          (bodies, inventories, health, the End, the dragon) and
                                                          put the four bodies in it
    mc_arena.py --sandbox run|say|status|chat|events|programs ...   the same commands, in the sandbox
    (mc_arena.py sandbox run|status|... is the same as --sandbox run|status|...)

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
    mc_arena.py down     save the world, stop the bot host and the server (and the sandbox's, saving nothing back),
                         confirm all exited

Records (.work/mc/records/): programs.jsonl, chat.jsonl, events.jsonl (the sandbox's: sandbox_*.jsonl); server
output in .work/mc/logs/. The sandbox (server in .work/mc/sandbox/, its bot host on run/sandbox.sock) is run by the
supervisor; `sandbox reset` asks it through run/control.sock. It never starts on its own and stops with `down`.
Environment: MC_DIR (.work/mc), MC_API_SOCK (.work/mc/run/api.sock), MC_JAVA_MEM (6G), MC_SANDBOX_MEM (3G),
EAT_ROLE, EAT_ITER.
"""
import argparse
import hashlib
import http.client
import json
import os
import re
import shutil
import signal
import socket
import struct
import subprocess
import sys
import threading
import time
import uuid
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
SANDBOX = MC / "sandbox"                    # the practice sandbox's server; its world is SANDBOX/world
SANDBOX_SOCK = RUN / "sandbox.sock"         # the sandbox bot host's API
CONTROL_SOCK = RUN / "control.sock"         # the supervisor's: sandbox reset
SANDBOX_UP_TIMEOUT = 240                    # seconds a reset waits for the sandbox server and its bodies
PREFIX = ""                                 # "sandbox_" under --sandbox: which records the commands read
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
    out, p = [], RECORDS / (PREFIX + name)
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
        self.sock.connect(str(self.path))


def api(method: str, path: str, data: dict | None = None, timeout: float = 10, sock: Path | None = None):
    conn = _UnixHTTP("localhost", timeout=timeout)
    conn.path = sock or API_SOCK
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

def props(srv: Path = SRV) -> dict:
    return dict(l.split("=", 1) for l in (srv / "server.properties").read_text().splitlines() if "=" in l and not l.startswith("#"))


def rcon(command: str, timeout: float = 30, srv: Path = SRV) -> str:
    pw = (MC / "rcon.secret").read_text().strip()
    with socket.create_connection(("127.0.0.1", int(props(srv).get("rcon.port", 25575))), timeout=timeout) as s:
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


def offline_uuid(name: str) -> str:
    """The uuid an offline-mode server gives a name (`whitelist add` would look the name up online instead)."""
    return str(uuid.UUID(bytes=hashlib.md5(f"OfflinePlayer:{name}".encode()).digest(), version=3))


def spawn_server(srv: Path, mem: str, prefix: str, ready: threading.Event) -> subprocess.Popen:
    """A vanilla server in srv; its output goes to logs/<prefix>server.log, chat and advancements to records."""
    ready.clear()
    proc = subprocess.Popen(["java", f"-Xms{mem}", f"-Xmx{mem}", "-jar", "server.jar", "nogui"], cwd=srv,
                            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                            text=True, errors="replace", bufsize=1)
    threading.Thread(target=read_server, args=(proc, prefix, ready), daemon=True).start()
    return proc


def read_server(proc: subprocess.Popen, prefix: str, ready: threading.Event) -> None:
    mark = {"sandbox": True} if prefix else {}
    with open(LOGS / f"{prefix}server.log", "a") as out:
        for line in proc.stdout:
            out.write(line)
            out.flush()
            m = LOG_LINE.match(line.rstrip("\n"))
            if not m or not m[1].startswith("Server thread/"):
                continue
            msg = m[2]
            if msg.startswith("Done ("):
                ready.set()
            elif c := CHAT.match(msg):
                append(f"{prefix}chat.jsonl", {"time": now(), "player": c[1], "text": c[2], **mark})
            elif a := ADV.match(msg):
                append(f"{prefix}events.jsonl", {"time": now(), "type": "advancement", "player": a[1], "title": a[3],
                                                 "kind": a[2], **mark})
            elif (j := JOIN.match(msg)) and j[1] in PLAYERS:     # not the live cam (tools/mc_cam.py)
                append(f"{prefix}events.jsonl", {"time": now(), "type": j[2] == "joined" and "join" or "leave",
                                                 "player": j[1], **mark})


def spawn_host(srv: Path, prefix: str, env: dict) -> subprocess.Popen:
    """A bot host whose bodies join the server in srv."""
    env = dict(os.environ, MC_DIR=str(MC), MC_PORT=props(srv).get("server-port", "25565"), **env)
    out = open(LOGS / f"{prefix}bothost.log", "a")
    proc = subprocess.Popen(["node", "bothost.js"], cwd=HOST_DIR, env=env, stdin=subprocess.DEVNULL,
                            stdout=out, stderr=subprocess.STDOUT)
    out.close()
    return proc


def stop_proc(proc: subprocess.Popen | None, wait: float) -> None:
    if proc and proc.poll() is None:
        proc.send_signal(signal.SIGTERM)
        try:
            proc.wait(wait)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()


class Supervisor:
    """Runs the server and the bot host; restarts either after a crash (the server from its latest save). Also runs
    the practice sandbox (Sandbox) on request through run/control.sock."""

    def __init__(self):
        self.stopping = False
        self.server: subprocess.Popen | None = None
        self.host: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.crashes: dict[str, list[float]] = {"server": [], "bothost": []}
        self.sandbox = Sandbox(self)
        self.control: socket.socket | None = None

    def log(self, msg: str) -> None:
        print(f"{now()} {msg}", flush=True)

    def start_server(self) -> None:
        self.server = spawn_server(SRV, os.environ.get("MC_JAVA_MEM", "6G"), "", self.ready)
        (RUN / "server.pid").write_text(str(self.server.pid))
        append("events.jsonl", {"time": now(), "type": "server_start", "pid": self.server.pid})
        self.log(f"server started (pid {self.server.pid})")

    def start_host(self) -> None:
        self.host = spawn_host(SRV, "", {})
        (RUN / "bothost.pid").write_text(str(self.host.pid))
        append("events.jsonl", {"time": now(), "type": "bothost_start", "pid": self.host.pid})
        self.log(f"bot host started (pid {self.host.pid})")

    def wait_server(self) -> bool:
        while not self.ready.wait(1):
            if self.server.poll() is not None or self.stopping:
                return False
        return True

    def stop_host(self) -> None:
        stop_proc(self.host, 30)
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

    # ---- the control socket: requests from the CLI (agents included: it is under the working directory) ----

    def serve_control(self) -> None:
        CONTROL_SOCK.unlink(missing_ok=True)
        srv = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        srv.bind(str(CONTROL_SOCK))
        os.chmod(CONTROL_SOCK, 0o600)
        srv.listen(16)
        self.control = srv
        threading.Thread(target=self._accept, args=(srv,), daemon=True).start()

    def _accept(self, srv: socket.socket) -> None:
        while True:
            try:
                conn, _ = srv.accept()
            except OSError:
                return
            threading.Thread(target=self._handle, args=(conn,), daemon=True).start()

    def _handle(self, conn: socket.socket) -> None:
        def send(obj: dict) -> None:
            try:
                conn.sendall((json.dumps(obj) + "\n").encode())
            except OSError:
                pass       # the caller left; the reset goes on
        try:
            peer = struct.unpack("3i", conn.getsockopt(socket.SOL_SOCKET, socket.SO_PEERCRED, 12))[0]
            req = json.loads(conn.makefile("r").readline() or "{}")
            if req.get("op") != "sandbox_reset":
                send({"error": f"unknown request {req.get('op')!r}"})
                return
            start = time.time()
            rec = {"time": now(), "type": "sandbox_reset", "role": req.get("role"), "iteration": req.get("iter"),
                   "peer_pid": peer, "sandbox": True}
            try:
                self.sandbox.reset(lambda line: send({"log": line}))
                rec.update(ok=True, took_s=round(time.time() - start, 1))
                send({"ok": True, "took_s": rec["took_s"]})
            except Exception as e:  # noqa: BLE001
                rec.update(ok=False, error=str(e), took_s=round(time.time() - start, 1))
                self.log(f"sandbox reset failed: {e!r}")
                send({"error": str(e)})
            append("sandbox_events.jsonl", rec)
        except (OSError, ValueError) as e:
            send({"error": f"bad request: {e}"})
        finally:
            conn.close()

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
        self.serve_control()
        silent_since = None
        checked = 0.0
        while not self.stopping:
            self.sleep(2)
            if self.stopping:
                break
            self.sandbox.check()
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
        if self.control:
            self.control.close()
        CONTROL_SOCK.unlink(missing_ok=True)
        with self.sandbox.lock:            # a reset in progress sees `stopping` and gives up
            self.sandbox.stop()
        self.stop_host()
        self.stop_server()
        for name in ("bothost", "server", "supervisor"):
            (RUN / f"{name}.pid").unlink(missing_ok=True)
        self.log("stopped")
        return 0


class Sandbox:
    """The practice sandbox: a second server (SANDBOX, same jar and properties but its own ports, MC_SANDBOX_MEM) on a
    copy of the world, and a second bot host for the same four bodies (run/sandbox.sock; same sight checks, same body
    locks; records sandbox_*.jsonl; no views, no flight recorder). It starts only on a reset, stops on `down`, and a
    crash stops it until the next reset. Nothing is ever copied back to the world."""

    def __init__(self, sup: Supervisor):
        self.sup = sup
        self.server: subprocess.Popen | None = None
        self.host: subprocess.Popen | None = None
        self.ready = threading.Event()
        self.lock = threading.Lock()
        self.on = False

    def log(self, msg: str) -> None:
        self.sup.log(f"sandbox: {msg}")

    def prepare(self) -> None:
        """The sandbox server's files: the main server's properties with its own ports, the four bodies whitelisted."""
        SANDBOX.mkdir(exist_ok=True)
        for name in ("server.jar", "libraries", "versions"):
            if not (SANDBOX / name).is_symlink():
                (SANDBOX / name).symlink_to(SRV / name)
        main = props()
        port = int(os.environ.get("MC_SANDBOX_PORT", int(main.get("server-port", 25565)) + 1))
        rport = int(os.environ.get("MC_SANDBOX_RCON_PORT", int(main.get("rcon.port", 25575)) + 1))
        lines = []
        for line in (SRV / "server.properties").read_text().splitlines():
            key = line.split("=", 1)[0]
            line = {"server-port": f"server-port={port}", "query.port": f"query.port={port}",
                    "rcon.port": f"rcon.port={rport}", "level-name": "level-name=world",
                    "motd": "motd=EAT minecraft arena (practice sandbox)"}.get(key, line)
            lines.append(line)
        (SANDBOX / "server.properties").write_text("\n".join(lines) + "\n")
        (SANDBOX / "eula.txt").write_text((SRV / "eula.txt").read_text())
        (SANDBOX / "whitelist.json").write_text(json.dumps([{"uuid": offline_uuid(p), "name": p} for p in PLAYERS], indent=2))
        (SANDBOX / "ops.json").write_text("[]")

    def copy_world(self) -> None:
        """SANDBOX/world := the main world as saved right now. Autosave is off during the copy so that no region file
        is half written in the copy; a chunk the server unloads meanwhile may still be written (sandbox only)."""
        new = SANDBOX / "world.new"
        _remove_sandbox_dir(new)
        rcon("save-off")
        try:
            rcon("save-all flush", timeout=120)
            shutil.copytree(SRV / "world", new, ignore=shutil.ignore_patterns("session.lock"), symlinks=True)
        finally:
            for attempt in range(5):        # the world must not stay with autosave off
                try:
                    rcon("save-on")
                    break
                except (OSError, RuntimeError) as e:
                    self.log(f"save-on failed ({e}); retrying")
                    time.sleep(2)
            else:
                self.log("SAVE-ON FAILED: the main world is not autosaving until the server restarts or saves on down")
        _remove_sandbox_dir(SANDBOX / "world")
        new.rename(SANDBOX / "world")

    def reset(self, out) -> None:
        with self.lock:
            if self.sup.stopping or not self.sup.ready.is_set() or not self.sup.server or self.sup.server.poll() is not None:
                raise RuntimeError("the main world is not up (or restarting); try again in a minute")
            if self.on or self.server or self.host:
                out("stopping the sandbox")
                self.stop()
            self.prepare()
            out("copying the world as it is now (saved first)")
            t = time.time()
            self.copy_world()
            out(f"copied in {time.time() - t:.1f} s; starting the sandbox server")
            self.server = spawn_server(SANDBOX, os.environ.get("MC_SANDBOX_MEM", "3G"), "sandbox_", self.ready)
            (RUN / "sandbox_server.pid").write_text(str(self.server.pid))
            deadline = time.time() + SANDBOX_UP_TIMEOUT
            while not self.ready.wait(1):
                if self.server.poll() is not None or self.sup.stopping or time.time() > deadline:
                    self.stop()
                    raise RuntimeError("the sandbox server did not come up (see .work/mc/logs/sandbox_server.log)")
            out("sandbox server up; the bodies are joining")
            self.host = spawn_host(SANDBOX, "sandbox_", {"MC_SANDBOX": "1", "MC_API_SOCK": str(SANDBOX_SOCK),
                                                         "MC_VIEW_PORT": "0"})
            (RUN / "sandbox_bothost.pid").write_text(str(self.host.pid))
            while True:
                try:
                    if api("GET", "/health", timeout=5, sock=SANDBOX_SOCK)["ready"]:
                        break
                except (OSError, ValueError):
                    pass
                if self.host.poll() is not None or self.server.poll() is not None or self.sup.stopping \
                        or time.time() > deadline:
                    self.stop()
                    raise RuntimeError("the sandbox bodies did not join (see .work/mc/logs/sandbox_bothost.log)")
                time.sleep(1)
            self.on = True
            self.log(f"up (server pid {self.server.pid}, bot host pid {self.host.pid})")

    def check(self) -> None:
        """A crashed sandbox server or bot host stops the sandbox until the next reset."""
        if not self.on or not self.lock.acquire(blocking=False):
            return
        try:
            dead = [n for n, p in (("server", self.server), ("bot host", self.host)) if p is None or p.poll() is not None]
            if self.on and dead:
                self.log(f"{' and '.join(dead)} exited; the sandbox is stopped until the next reset")
                append("sandbox_events.jsonl", {"time": now(), "type": "sandbox_crash", "what": dead, "sandbox": True})
                self.stop()
        finally:
            self.lock.release()

    def stop(self) -> None:
        """Stop the sandbox's bot host and server (its world is thrown away at the next reset; nothing is saved back)."""
        self.on = False
        stop_proc(self.host, 30)
        if self.server and self.server.poll() is None:
            try:
                rcon("stop", timeout=10, srv=SANDBOX)
            except (OSError, RuntimeError):
                try:
                    self.server.stdin.write("stop\n")
                    self.server.stdin.flush()
                except OSError:
                    pass
            try:
                self.server.wait(120)
            except subprocess.TimeoutExpired:
                self.server.kill()
                self.server.wait()
        if self.server or self.host:
            self.log("stopped")
        self.server = self.host = None
        for name in ("sandbox_bothost", "sandbox_server"):
            (RUN / f"{name}.pid").unlink(missing_ok=True)


def _remove_sandbox_dir(d: Path) -> None:
    """Delete one of the sandbox's own world directories (never anything else)."""
    if d.parent.resolve() != SANDBOX.resolve() or d.name not in ("world", "world.new"):
        raise ValueError(f"refusing to delete {d}")
    if d.is_symlink():
        d.unlink()
    elif d.exists():
        shutil.rmtree(d)


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
    print(_cam("start"))
    return cmd_status(args)


def cmd_down(_args) -> int:
    sup = pid_of("supervisor", "_supervise")
    pids = {n: pid_of(n, m) for n, m in (("server", "server.jar"), ("bothost", "bothost.js"),
                                         ("sandbox_server", "server.jar"), ("sandbox_bothost", "bothost.js"))}
    if sup is None:
        stray = {n: p for n, p in pids.items() if p}
        print("down: not running" + (f" (but found {stray}: stop them by hand)" if stray else ""))
        return 1 if stray else 0
    print(_cam("stop"))      # the cam leaves the game before the world is saved and stopped
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
    print("down: bot host and server stopped, world saved (the sandbox, if it ran, stopped too; nothing saved back)")
    return 0


def _cam(what: str) -> str:
    """Start or stop the live cam (tools/mc_cam.py); never fails up or down."""
    try:
        import mc_cam
        return mc_cam.start() if what == "start" else mc_cam.stop()
    except Exception as e:  # noqa: BLE001
        return f"live cam {what} failed: {e!r}"


# ---- the players' commands ----

def unreachable() -> int:
    if PREFIX:
        print("the sandbox is not running (it starts, or comes back to the world's current state, with "
              "`python3 tools/mc_arena.py sandbox reset`; it also stops whenever the world is down).", file=sys.stderr)
        return 3
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
    print(("[sandbox] " if PREFIX else "") + f"program #{res['n']} on {res['player']}: {res['duration_s']} s" + (" (TIMED OUT)" if res["timed_out"] else ""))
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
    if PREFIX:
        print("SANDBOX (a practice copy of the world; nothing done here counts or is kept)")
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


def cmd_sandbox_reset(_args) -> int:
    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.settimeout(SANDBOX_UP_TIMEOUT + 300)
    try:
        s.connect(str(CONTROL_SOCK))
    except OSError:
        print("the game is not up right now (the sandbox runs only while the world is up)", file=sys.stderr)
        return 3
    with s:
        s.sendall((json.dumps({"op": "sandbox_reset", "role": os.environ.get("EAT_ROLE") or "manual",
                               "iter": os.environ.get("EAT_ITER")}) + "\n").encode())
        res = {"error": "the supervisor closed the connection"}
        try:
            for line in s.makefile("r"):
                msg = json.loads(line)
                if "log" in msg:
                    print(f"sandbox reset: {msg['log']}", flush=True)
                else:
                    res = msg
                    break
        except (OSError, ValueError) as e:
            res = {"error": f"lost the supervisor: {e}"}
    if res.get("error"):
        print(f"sandbox reset failed: {res['error']}", file=sys.stderr)
        return 1
    print(f"sandbox reset: done in {res['took_s']} s; the sandbox is a copy of the world as it was just now")
    global API_SOCK, PREFIX
    API_SOCK, PREFIX = SANDBOX_SOCK, "sandbox_"
    return cmd_status(_args)


def main() -> int:
    argv = sys.argv[1:]
    if argv[:1] == ["sandbox"]:          # `sandbox reset`, or `sandbox CMD ...` = `--sandbox CMD ...`
        if argv[1:2] == ["reset"]:
            return cmd_sandbox_reset(None)
        argv = ["--sandbox"] + argv[1:]
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sandbox", action="store_true", help="act in the practice sandbox (see `sandbox reset`)")
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
    args = ap.parse_args(argv)
    if args.sandbox:
        if args.cmd in ("up", "down", "_supervise"):
            ap.error(f"{args.cmd} is not a sandbox command (the sandbox starts with `sandbox reset`, stops with down)")
        global API_SOCK, PREFIX
        API_SOCK, PREFIX = SANDBOX_SOCK, "sandbox_"
    return {"run": cmd_run, "say": cmd_say, "status": cmd_status, "chat": cmd_chat, "events": cmd_events,
            "programs": cmd_programs, "up": cmd_up, "down": cmd_down, "_supervise": cmd_supervise}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
