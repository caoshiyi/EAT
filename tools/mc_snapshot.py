#!/usr/bin/env python3
"""A short factual snapshot of the minecraft world for the supervisor, read from the saved world (the server is down
when the harness runs it): where each body is and what it carries, the key items the team holds, run totals from the
world's statistics with this iteration's change, and this iteration's deaths by cause. Facts only, no advice.

    python3 tools/mc_snapshot.py            (prints markdown; remembers the totals to report the next change)
"""
import gzip
import json
import sys
import zlib
import struct
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mc_arena as A  # noqa: E402
from mc_render import anvil  # noqa: E402

WORLD = A.SRV / "world"
PREV = A.MC / "snapshot_prev.json"
KEY = ["ender_pearl", "blaze_rod", "blaze_powder", "ender_eye", "obsidian", "flint_and_steel", "iron_ingot", "gold_ingot",
       "diamond", "bow", "arrow", "bed"]
STATS = [("picked up", "minecraft:picked_up", ["ender_pearl", "blaze_rod", "iron_ingot", "gold_ingot", "diamond", "obsidian"]),
         ("crafted", "minecraft:crafted", ["ender_eye", "blaze_powder"]),
         ("used", "minecraft:used", ["ender_eye"]),
         ("killed", "minecraft:killed", ["enderman", "blaze", "piglin"])]
RADIUS = 4   # chunks around spawn and each body whose containers are counted


def items(lst) -> Counter:
    c = Counter()
    for it in lst or []:
        c[str(it.get("id", "")).replace("minecraft:", "")] += int(it.get("Count", it.get("count", 1)))
    return c


def key_of(name: str) -> str:
    return "bed" if name.endswith("_bed") else name


def containers(dim: str, centres: list) -> Counter:
    """Items in chests, barrels, shulker boxes, furnaces... in the chunks around the given block positions."""
    reg = WORLD / anvil.DIM_DIRS.get(dim, "") / "region"
    seen, total = set(), Counter()
    for x, z in centres:
        for cx in range((int(x) >> 4) - RADIUS, (int(x) >> 4) + RADIUS + 1):
            for cz in range((int(z) >> 4) - RADIUS, (int(z) >> 4) + RADIUS + 1):
                if (cx, cz) in seen:
                    continue
                seen.add((cx, cz))
                try:
                    with open(reg / f"r.{cx >> 5}.{cz >> 5}.mca", "rb") as f:
                        f.seek(4 * ((cx & 31) + 32 * (cz & 31)))
                        loc = struct.unpack(">I", f.read(4))[0]
                        if not loc >> 8:
                            continue
                        f.seek((loc >> 8) * 4096)
                        n, kind = struct.unpack(">IB", f.read(5))
                        raw = f.read(n - 1)
                    data = zlib.decompress(raw) if kind == 2 else gzip.decompress(raw)
                    for be in anvil.parse(data).get("block_entities", []):
                        total += items(be.get("Items"))
                except (OSError, ValueError, struct.error, zlib.error, KeyError):
                    continue
    return total


def main() -> int:
    uuids = {e["name"]: e["uuid"] for e in json.loads((A.SRV / "usercache.json").read_text())}
    bodies, carried, ender = {}, Counter(), Counter()
    for p in A.PLAYERS:
        try:
            d = anvil.parse(gzip.decompress((WORLD / "playerdata" / f"{uuids[p]}.dat").read_bytes()))
        except (OSError, KeyError, ValueError):
            continue
        inv = items(d.get("Inventory"))
        carried += inv
        ender += items(d.get("EnderItems"))
        x, y, z = d["Pos"]
        bodies[p] = {"dim": d.get("Dimension", "minecraft:overworld").replace("minecraft:", ""), "pos": (x, y, z),
                     "health": d.get("Health"), "food": d.get("foodLevel"), "inv": inv}
    spawn = anvil.parse(gzip.decompress((WORLD / "level.dat").read_bytes())).get("Data", {})
    stored = Counter()
    for dim in {b["dim"] for b in bodies.values()} | {"overworld"}:
        centres = [(b["pos"][0], b["pos"][2]) for b in bodies.values() if b["dim"] == dim]
        if dim == "overworld":
            centres.append((spawn.get("SpawnX", 0), spawn.get("SpawnZ", 0)))
        stored += containers("minecraft:" + dim, centres)

    totals = {}
    for f in (WORLD / "stats").glob("*.json"):
        s = json.loads(f.read_text()).get("stats", {})
        for label, cat, names in STATS:
            for n in names:
                k = f"{label} {n}"
                totals[k] = totals.get(k, 0) + s.get(cat, {}).get("minecraft:" + n, 0)
        totals["deaths"] = totals.get("deaths", 0) + s.get("minecraft:custom", {}).get("minecraft:deaths", 0)
    try:
        prev = json.loads(PREV.read_text())
    except (OSError, ValueError):
        prev = {}
    PREV.write_text(json.dumps(totals))

    events = [json.loads(l) for l in (A.RECORDS / "events.jsonl").read_text().splitlines() if l.strip()]
    ups = [e["time"] for e in events if e.get("type") == "up"]
    since = ups[-1] if ups else ""   # the iteration began when the world last came up
    causes = Counter()
    for e in events:
        if e.get("type") == "death" and e.get("time", "") >= since:
            words = str(e.get("cause", "")).split(" ", 1)[-1]
            causes[words.split(" by ")[-1] if " by " in words else words] += 1

    print("## World snapshot (read from the saved world by the harness; facts, no advice)")
    for p, b in bodies.items():
        x, y, z = b["pos"]
        inv = ", ".join(f"{k} {v}" for k, v in b["inv"].most_common()) or "empty"
        print(f"- {p}: {b['dim']} ({x:.0f}, {y:.0f}, {z:.0f}), health {b['health']:.0f}, food {b['food']} — carries: {inv}")
    held = Counter()
    for src in (carried, ender, stored):
        for k, v in src.items():
            held[key_of(k)] += v
    print("- key items the team holds (bodies, ender chests, containers within %d chunks of spawn and each body): "
          % RADIUS + ", ".join(f"{k} {held.get(k, 0)}" for k in KEY))
    print("- run totals from the world's statistics (change this iteration): " +
          ", ".join(f"{k} {v} ({v - prev.get(k, 0):+d})" if prev else f"{k} {v}" for k, v in totals.items()))
    print("- deaths this iteration by cause: " + (", ".join(f"{k} {v}" for k, v in causes.most_common()) or "none"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
