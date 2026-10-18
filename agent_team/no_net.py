#!/usr/bin/env python3
"""Runs an agent CLI without internet. The agent's process (and everything it starts: its shell, curl, pip, git) lives
in its own network namespace, which has only a loopback. Its one way out is an HTTP CONNECT proxy, run by the caller
outside the namespace, that reaches only the model API's hosts on port 443; any other host gets 403.

    proxy = no_net.Proxy(["chatgpt.com", ".openai.com"])   # in the caller, which keeps the network
    subprocess.Popen(proxy.command(["codex", "exec", ...]))  # the agent CLI, cut off

The command is this file run as a script: it unshares user, network and mount namespaces (no privileges needed), brings
the loopback up, hides the host's local control sockets (each runs commands outside the namespace: docker, systemd and
dbus, tmux, ssh connection masters, ...), starts a relay 127.0.0.1:PORT -> the proxy's unix socket and execs the CLI
with HTTPS_PROXY pointing at the relay, so the CLI's pid is the one the caller started. Unix sockets under the paths
in the working directory and in NO_NET_KEEP (':'-separated) stay reachable, e.g. the game's bot host API
(.work/mc/run/api.sock: tools/mc_arena.py talks to it that way).
"""
import ctypes
import fcntl
import os
import select
import signal
import socket
import struct
import sys
import tempfile
import threading
from pathlib import Path

CLONE_NEWNS, CLONE_NEWUSER, CLONE_NEWNET = 0x00020000, 0x10000000, 0x40000000
MS_REC, MS_PRIVATE, MS_BIND, MS_NOSUID, MS_NODEV = 0x4000, 1 << 18, 0x1000, 0x2, 0x4
SIOCGIFFLAGS, SIOCSIFFLAGS, IFF_UP = 0x8913, 0x8914, 0x1
PR_SET_PDEATHSIG = 1


def _pipe(a: socket.socket, b: socket.socket) -> None:
    """Copies both ways until either side closes."""
    try:
        while True:
            r, _, _ = select.select([a, b], [], [])
            for s in r:
                data = s.recv(65536)
                if not data:
                    return
                (b if s is a else a).sendall(data)
    except OSError:
        pass
    finally:
        a.close()
        b.close()


class Proxy:
    """HTTP CONNECT proxy on a unix socket that tunnels only to `hosts` (".x.com" also allows its subdomains), port 443."""

    def __init__(self, hosts):
        self.hosts = [h.strip().lower() for h in hosts if h.strip()]
        self.dir = tempfile.mkdtemp(prefix="eat-no-net-")
        self.path = os.path.join(self.dir, "proxy.sock")
        self.server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.server.bind(self.path)
        self.server.listen(64)
        threading.Thread(target=self._serve, daemon=True).start()

    def allowed(self, host: str, port: int) -> bool:
        host = host.lower().rstrip(".")
        return port == 443 and any(host == h.lstrip(".") or (h.startswith(".") and host.endswith(h)) for h in self.hosts)

    def _serve(self) -> None:
        while True:
            try:
                conn, _ = self.server.accept()
            except OSError:
                return
            threading.Thread(target=self._handle, args=(conn,), daemon=True).start()

    def _handle(self, conn: socket.socket) -> None:
        try:
            head = b""
            while b"\r\n\r\n" not in head and len(head) < 65536:
                chunk = conn.recv(4096)
                if not chunk:
                    conn.close()
                    return
                head += chunk
            line = head.split(b"\r\n", 1)[0].decode("latin-1").split()
            host, port = None, 0
            if len(line) >= 2 and line[0].upper() == "CONNECT":
                host, _, p = line[1].rpartition(":")
                host, port = host.strip("[]"), int(p) if p.isdigit() else 0
            if not host or not self.allowed(host, port):
                msg = f"no internet for agents: {line[1] if len(line) > 1 else '?'} is not reachable from here\n".encode()
                conn.sendall(b"HTTP/1.1 403 Forbidden\r\nContent-Type: text/plain\r\nConnection: close\r\n"
                             b"Content-Length: " + str(len(msg)).encode() + b"\r\n\r\n" + msg)
                conn.close()
                return
            up = socket.create_connection((host, port), timeout=30)
            up.settimeout(None)
            conn.sendall(b"HTTP/1.1 200 Connection established\r\n\r\n")
            rest = head.split(b"\r\n\r\n", 1)[1]
            if rest:
                up.sendall(rest)
            _pipe(conn, up)
        except (OSError, ValueError):
            conn.close()

    def command(self, cmd: list[str]) -> list[str]:
        return [sys.executable, "-I", os.path.abspath(__file__), self.path, "--", *cmd]

    def close(self) -> None:
        self.server.close()
        try:
            os.unlink(self.path)
            os.rmdir(self.dir)
        except OSError:
            pass


# ---- inside: the agent's side ----

def _listening_unix_sockets() -> list[str]:
    """Paths of the unix sockets listening in this (the host's) network namespace."""
    out = []
    for line in Path("/proc/net/unix").read_text().splitlines()[1:]:
        f = line.split()
        if len(f) >= 8 and int(f[3], 16) & 0x10000 and f[7].startswith("/"):   # __SO_ACCEPTCON, a path
            out.append(f[7])
    return out


def _mount(libc, src, target, fstype, flags, data=None) -> None:
    if libc.mount(src and src.encode(), target.encode(), fstype and fstype.encode(), flags, data and data.encode()) != 0:
        e = ctypes.get_errno()
        raise OSError(e, f"mount {target}: {os.strerror(e)}")


def _enter(proxy_path: str) -> None:
    uid, gid = os.getuid(), os.getgid()
    home = os.path.expanduser("~")
    keep = [proxy_path, os.getcwd()] + [k for k in os.environ.get("NO_NET_KEEP", "").split(":") if k]
    sockets = _listening_unix_sockets()        # read before leaving the host's network namespace
    libc = ctypes.CDLL(None, use_errno=True)
    os.unshare(CLONE_NEWUSER | CLONE_NEWNET | CLONE_NEWNS)
    Path("/proc/self/setgroups").write_text("deny")
    Path("/proc/self/uid_map").write_text(f"{uid} {uid} 1")
    Path("/proc/self/gid_map").write_text(f"{gid} {gid} 1")

    # Local control sockets would run a command outside the namespace (docker run --network host, systemd-run --user,
    # tmux send-keys, an ssh master): their directories get an empty tmpfs, other listening sockets /dev/null.
    _mount(libc, None, "/", None, MS_REC | MS_PRIVATE)
    hidden = ["/run", f"/tmp/tmux-{uid}", f"/tmp/screen-{uid}", os.path.join(home, ".ssh")]
    hidden = [h for h in hidden if os.path.isdir(h) and not any(k.startswith(h.rstrip("/") + "/") for k in keep)]
    for h in hidden:
        _mount(libc, "tmpfs", h, "tmpfs", MS_NOSUID | MS_NODEV, "mode=755" if h == "/run" else "mode=700")
    if "/run" in hidden:
        os.makedirs(f"/run/user/{uid}", mode=0o700, exist_ok=True)
    for s in sockets:
        if any(s == k or s.startswith(k.rstrip("/") + "/") for k in keep) or any(s.startswith(h + "/") for h in hidden):
            continue
        try:
            _mount(libc, "/dev/null", s, None, MS_BIND)
        except OSError:
            pass                       # gone, or a path this user cannot reach anyway

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:   # loopback up
        flags = struct.unpack("16sH22x", fcntl.ioctl(s, SIOCGIFFLAGS, struct.pack("16sH22x", b"lo", 0)))[1]
        fcntl.ioctl(s, SIOCSIFFLAGS, struct.pack("16sH22x", b"lo", flags | IFF_UP))

    relay = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    relay.bind(("127.0.0.1", 0))
    relay.listen(64)
    port = relay.getsockname()[1]
    parent = os.getpid()
    if os.fork() == 0:                 # the relay: lives as long as the agent CLI (its parent after the exec)
        libc.prctl(PR_SET_PDEATHSIG, signal.SIGKILL)
        if os.getppid() != parent:
            os._exit(0)
        signal.signal(signal.SIGTERM, signal.SIG_DFL)
        devnull = os.open(os.devnull, os.O_RDWR)
        os.dup2(devnull, 0)
        os.dup2(devnull, 1)
        while True:
            conn, _ = relay.accept()
            up = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            try:
                up.connect(proxy_path)
            except OSError:
                conn.close()
                continue
            threading.Thread(target=_pipe, args=(conn, up), daemon=True).start()
    relay.close()
    url = f"http://127.0.0.1:{port}"
    for k in ("HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"):
        os.environ[k] = url
    for k in ("NO_PROXY", "no_proxy"):
        os.environ.pop(k, None)


def main() -> None:
    if len(sys.argv) < 4 or sys.argv[2] != "--":
        sys.exit("usage: no_net.py PROXY_SOCKET -- COMMAND... (see Proxy.command)")
    _enter(sys.argv[1])
    os.execvp(sys.argv[3], sys.argv[3:])


if __name__ == "__main__":
    main()
