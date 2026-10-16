"""Minimal NBT and Anvil region reading (read-only): player data and block names at a position."""
import gzip
import struct
import zlib
from pathlib import Path


def _nbt(buf: bytes, i: int, tag: int):
    if tag == 1:
        return struct.unpack_from(">b", buf, i)[0], i + 1
    if tag == 2:
        return struct.unpack_from(">h", buf, i)[0], i + 2
    if tag == 3:
        return struct.unpack_from(">i", buf, i)[0], i + 4
    if tag == 4:
        return struct.unpack_from(">q", buf, i)[0], i + 8
    if tag == 5:
        return struct.unpack_from(">f", buf, i)[0], i + 4
    if tag == 6:
        return struct.unpack_from(">d", buf, i)[0], i + 8
    if tag == 7:
        n = struct.unpack_from(">i", buf, i)[0]
        return buf[i + 4:i + 4 + n], i + 4 + n
    if tag == 8:
        n = struct.unpack_from(">H", buf, i)[0]
        return buf[i + 2:i + 2 + n].decode("utf-8", "replace"), i + 2 + n
    if tag == 9:
        sub, n = struct.unpack_from(">bi", buf, i)
        i += 5
        out = []
        for _ in range(n):
            v, i = _nbt(buf, i, sub)
            out.append(v)
        return out, i
    if tag == 10:
        out = {}
        while True:
            t = buf[i]
            i += 1
            if t == 0:
                return out, i
            n = struct.unpack_from(">H", buf, i)[0]
            name = buf[i + 2:i + 2 + n].decode("utf-8", "replace")
            out[name], i = _nbt(buf, i + 2 + n, t)
    if tag == 11:
        n = struct.unpack_from(">i", buf, i)[0]
        return list(struct.unpack_from(f">{n}i", buf, i + 4)), i + 4 + 4 * n
    if tag == 12:
        n = struct.unpack_from(">i", buf, i)[0]
        return list(struct.unpack_from(f">{n}q", buf, i + 4)), i + 4 + 8 * n
    raise ValueError(f"bad nbt tag {tag}")


def parse(buf: bytes) -> dict:
    """The root compound of an uncompressed NBT blob."""
    n = struct.unpack_from(">H", buf, 1)[0]
    return _nbt(buf, 3 + n, 10)[0]


def player(path: Path) -> dict:
    """A playerdata file: position, yaw/pitch (Minecraft degrees), dimension."""
    d = parse(gzip.decompress(path.read_bytes()))
    yaw, pitch = d.get("Rotation", [0.0, 0.0])
    x, y, z = d["Pos"]
    return {"x": x, "y": y, "z": z, "yaw": yaw, "pitch": pitch, "dimension": d.get("Dimension", "minecraft:overworld")}


DIM_DIRS = {"minecraft:overworld": "", "minecraft:the_nether": "DIM-1", "minecraft:the_end": "DIM1"}


class Blocks:
    """Block names by position in one dimension of a saved world, chunks decoded on demand."""

    def __init__(self, world: Path, dimension: str = "minecraft:overworld"):
        self.dir = world / DIM_DIRS.get(dimension, "") / "region"
        self.chunks = {}

    def _chunk(self, cx: int, cz: int):
        key = (cx, cz)
        if key not in self.chunks:
            self.chunks[key] = None
            p = self.dir / f"r.{cx >> 5}.{cz >> 5}.mca"
            try:
                with open(p, "rb") as f:
                    f.seek(4 * ((cx & 31) + 32 * (cz & 31)))
                    loc = struct.unpack(">I", f.read(4))[0]
                    if loc >> 8:
                        f.seek((loc >> 8) * 4096)
                        n, comp = struct.unpack(">IB", f.read(5))
                        raw = f.read(n - 1)
                        data = zlib.decompress(raw) if comp == 2 else gzip.decompress(raw) if comp == 1 else raw
                        secs = {}
                        for s in parse(data).get("sections", []):
                            bs = s.get("block_states")
                            if bs:
                                secs[s["Y"]] = ([e["Name"] for e in bs["palette"]], bs.get("data"))
                        self.chunks[key] = secs
            except (OSError, ValueError, zlib.error, struct.error):
                pass
        return self.chunks[key]

    def at(self, x: int, y: int, z: int) -> str | None:
        """The block's name, None where the chunk is not saved."""
        secs = self._chunk(x >> 4, z >> 4)
        if secs is None:
            return None
        sec = secs.get(y >> 4)
        if sec is None:
            return "minecraft:air"
        palette, data = sec
        if not data or len(palette) == 1:
            return palette[0]
        bits = max(4, (len(palette) - 1).bit_length())
        per = 64 // bits
        idx = ((y & 15) << 8) | ((z & 15) << 4) | (x & 15)
        v = (data[idx // per] & 0xFFFFFFFFFFFFFFFF) >> ((idx % per) * bits) & ((1 << bits) - 1)
        return palette[v] if v < len(palette) else None
