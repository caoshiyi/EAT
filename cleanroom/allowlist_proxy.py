#!/usr/bin/env python3
"""HTTP(S) proxy on a Unix socket that only lets through Anthropic / Claude API hosts.

The clean EAT run has no network of its own (bwrap --unshare-net); its only way out is this socket,
bridged to 127.0.0.1 inside the sandbox by tcp2unix.py. Every denied request is logged.

    allowlist_proxy.py --socket /path/proxy.sock --log /path/proxy.log
"""
import argparse
import asyncio
import os
import time

ALLOWED_SUFFIXES = ("anthropic.com", "claude.ai", "claude.com")


def allowed(host: str) -> bool:
    host = host.lower().rstrip(".")
    return any(host == s or host.endswith("." + s) for s in ALLOWED_SUFFIXES)


async def pipe(reader, writer):
    try:
        while data := await reader.read(65536):
            writer.write(data)
            await writer.drain()
    except (ConnectionError, asyncio.CancelledError):
        pass
    finally:
        try:
            writer.close()
        except Exception:  # noqa: BLE001
            pass


class Proxy:
    def __init__(self, log_path):
        self.log = open(log_path, "a", buffering=1)

    def note(self, verdict, target):
        self.log.write(f"{time.strftime('%F %T')} {verdict} {target}\n")

    async def handle(self, reader, writer):
        try:
            head = await reader.readuntil(b"\r\n\r\n")
        except Exception:  # noqa: BLE001
            writer.close()
            return
        line = head.split(b"\r\n", 1)[0].decode("latin-1")
        parts = line.split()
        if len(parts) < 3:
            writer.close()
            return
        method, target = parts[0].upper(), parts[1]
        if method == "CONNECT":
            host, _, port = target.rpartition(":")
            port = int(port or 443)
            tail = b""
        else:
            # plain-HTTP absolute URI
            rest = target.split("://", 1)[-1]
            hostport = rest.split("/", 1)[0]
            host, _, port = hostport.partition(":")
            port = int(port or 80)
            tail = head
        if not allowed(host):
            self.note("DENY", f"{method} {host}:{port}")
            writer.write(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
            await writer.drain()
            writer.close()
            return
        try:
            ur, uw = await asyncio.wait_for(asyncio.open_connection(host, port), 30)
        except Exception as e:  # noqa: BLE001
            self.note("FAIL", f"{method} {host}:{port} {type(e).__name__}")
            writer.write(b"HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
            await writer.drain()
            writer.close()
            return
        if method == "CONNECT":
            writer.write(b"HTTP/1.1 200 Connection Established\r\n\r\n")
            await writer.drain()
        else:
            uw.write(tail)
            await uw.drain()
        await asyncio.gather(pipe(reader, uw), pipe(ur, writer))


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--socket", required=True)
    ap.add_argument("--log", required=True)
    args = ap.parse_args()
    if os.path.exists(args.socket):
        os.unlink(args.socket)
    proxy = Proxy(args.log)
    server = await asyncio.start_unix_server(proxy.handle, path=args.socket)
    os.chmod(args.socket, 0o600)
    proxy.note("START", args.socket)
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
