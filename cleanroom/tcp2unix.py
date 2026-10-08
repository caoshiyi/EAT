#!/usr/bin/env python3
"""Inside the sandbox: forward 127.0.0.1:PORT to the allowlist proxy's Unix socket."""
import asyncio
import sys


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


async def main(port, sock):
    async def handle(reader, writer):
        try:
            ur, uw = await asyncio.open_unix_connection(sock)
        except OSError:
            writer.close()
            return
        await asyncio.gather(pipe(reader, uw), pipe(ur, writer))

    server = await asyncio.start_server(handle, "127.0.0.1", port)
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main(int(sys.argv[1]), sys.argv[2]))
