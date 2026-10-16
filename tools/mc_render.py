#!/usr/bin/env python3
"""Delayed, realistic renders of a minecraft run from its saved world (read-only), served by tools/mc_viewer.py.

    python3 tools/mc_render.py map [--every 300] [--once] [--pack]
        re-render the BlueMap web map (incremental) every N s into .work/mc/render/bluemap/web, with the four
        bodies as markers
    python3 tools/mc_render.py shots [--every 300] [--once] [--spp N] [--keep 200] [--cpu] [--pack]
        every N s, a path-traced third-person shot of each body (Chunky, OpenCL on the GPU) into
        .work/mc/render/shots/<player>/<time>.png and latest.png; without --spp the samples per pixel are chosen
        so that a cycle of four shots takes about half the interval
    python3 tools/mc_render.py timelapse --player p1 [--fps 12]
        the player's kept shots as .work/mc/render/shots/<player>/timelapse.mp4

Setup once: bash tools/mc_render/setup.sh [--pixel-perfection]. --pack renders with the Pixel Perfection pack (CC BY-SA)
over the vanilla textures, for images to be published. Body positions come from the bot host's /status when it is up,
else from the world's player data; the world is only read, never written.
"""
import argparse
import gzip
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "mc_render"))
import anvil  # noqa: E402
import mc_arena as A  # noqa: E402

R = A.MC / "render"
JARS = R / "jars"
WORLD = A.SRV / "world"
SHOTS = R / "shots"
BM = R / "bluemap"
CH = R / "chunky"
COLORS = {"p1": "#1aa1b5", "p2": "#8e5bd6", "p3": "#e08a1e", "p4": "#3f9a4e"}
MAPS = {"overworld": "minecraft:overworld", "nether": "minecraft:the_nether", "end": "minecraft:the_end"}
PACK = JARS / "pixel-perfection-legacy-13.21.2.zip"
WIDTH, HEIGHT = 1280, 720
CHUNK_RADIUS = 8           # chunks loaded around a body for its shot (17 x 17)


def log(msg: str) -> None:
    print(f"{datetime.now().strftime('%H:%M:%S')} {msg}", flush=True)


def need(path: Path) -> None:
    if not path.exists():
        sys.exit(f"{path} missing: run bash tools/mc_render/setup.sh first")


# ---- where the bodies are ----

def uuids() -> dict[str, str]:
    """Each player's uuid: the server's user cache, else the offline-mode uuid (md5 of OfflinePlayer:<name>)."""
    out = {}
    try:
        for e in json.loads((A.SRV / "usercache.json").read_text()):
            out[e["name"]] = e["uuid"]
    except (OSError, ValueError):
        pass
    for p in A.PLAYERS:
        if p not in out:
            out[p] = str(uuid.UUID(bytes=hashlib.md5(f"OfflinePlayer:{p}".encode()).digest(), version=3))
    return out


def bodies() -> dict[str, dict]:
    """Each body's position, facing and dimension: live from the bot host when it answers, else as last saved."""
    out = {}
    for p, u in uuids().items():
        if p not in A.PLAYERS:
            continue
        try:
            out[p] = anvil.player(WORLD / "playerdata" / f"{u}.dat") | {"uuid": u, "source": "saved"}
        except (OSError, ValueError, KeyError):
            pass
    try:
        status = A.api("GET", "/status", timeout=3)
    except (OSError, ValueError):
        status = {}
    for p, s in (status or {}).items():
        if p in A.PLAYERS and s.get("connected") and s.get("position"):
            dim = s.get("dimension") or "overworld"
            dim = dim if ":" in dim else "minecraft:" + dim
            # /status has no facing: the saved one is kept
            out[p] = (out.get(p) or {"yaw": 0.0, "pitch": 0.0, "uuid": uuids()[p]}) | s["position"] | {
                "dimension": dim, "source": "live"}
    return out


# ---- map: BlueMap ----

MAP_CONF = {
    "overworld": 'sorting: 0\nsky-color: "#7dabff"\nvoid-color: "#000000"\nambient-light: 0.1\nremove-caves-below-y: 55\n'
                 'render-mask: [{}]\n',
    "nether": 'sorting: 100\nsky-color: "#290000"\nvoid-color: "#150000"\nambient-light: 0.6\nremove-caves-below-y: -10000\n'
              'render-mask: [{}, {subtract: true, min-y: 90, max-y: 127}]\n',
    "end": 'sorting: 200\nsky-color: "#080010"\nvoid-color: "#080010"\nambient-light: 0.6\nremove-caves-below-y: -10000\n'
           'render-mask: [{}]\n',
}


def bluemap_config(pack: bool, threads: int, where: dict[str, dict]) -> Path:
    """BlueMap's config, rewritten each cycle so that it always matches this checkout's paths; each map opens where
    the bodies in that dimension are."""
    conf = BM / "config"
    for d in ("maps", "storages", "packs"):
        (conf / d).mkdir(parents=True, exist_ok=True)
    (conf / "core.conf").write_text(f'accept-download: true\ndata: "{BM / "data"}"\nrender-thread-count: {threads}\n'
                                    'scan-for-mod-resources: false\nmetrics: false\n'
                                    f'log: {{ file: "{BM / "data" / "logs" / "debug.log"}", append: false }}\n')
    (conf / "webapp.conf").write_text(f'enabled: true\nwebroot: "{BM / "web"}"\nupdate-settings-file: true\n'
                                      'use-cookies: true\ndefault-to-flat-view: false\nscripts: []\nstyles: []\n')
    (conf / "webserver.conf").write_text('enabled: false\nwebroot: "web"\nport: 8100\n')
    (conf / "storages" / "file.conf").write_text(f'storage-type: file\nroot: "{BM / "web" / "maps"}"\ncompression: gzip\n')
    for name, dim in MAPS.items():
        here = [b for b in where.values() if b["dimension"] == dim] or [{"x": 0, "z": 0}]
        x, z = (round(sum(b[k] for b in here) / len(here)) for k in "xz")
        (conf / "maps" / f"{name}.conf").write_text(
            f'world: "{WORLD}"\ndimension: "{dim}"\nname: "{name.capitalize()}"\nstart-pos: {{ x: {x}, z: {z} }}\n'
            f'sky-light: 1\ncave-detection-ocean-floor: -5\nmin-inhabited-time: 0\nrender-edges: true\n'
            f'edge-light-strength: 8\nenable-perspective-view: true\nenable-flat-view: true\n'
            f'enable-free-flight-view: true\nenable-hires: true\nstorage: "file"\nmarker-sets: {{}}\n' + MAP_CONF[name])
    link = conf / "packs" / PACK.name
    if pack:
        need(PACK)
        if not link.is_symlink():
            link.symlink_to(PACK)
    elif link.is_symlink():
        link.unlink()
    return conf


def write_markers(where: dict[str, dict]) -> None:
    """The bodies as BlueMap html markers (a dot and a label in the body's colour), one marker set per map: the web
    app polls maps/<map>/live/markers.json, so this needs no BlueMap server."""
    for name, dim in MAPS.items():
        live = BM / "web" / "maps" / name / "live"
        if not live.parent.exists():
            continue
        live.mkdir(exist_ok=True)
        markers = {}
        for p, b in sorted(where.items()):
            if b["dimension"] != dim:
                continue
            c = COLORS.get(p, "#444")
            html = (f'<div style="display:flex;align-items:center;gap:4px;transform:translate(-7px,-7px);'
                    f'font:600 13px system-ui,sans-serif;color:#fff;text-shadow:0 0 3px #000,0 0 2px #000;white-space:nowrap">'
                    f'<span style="width:14px;height:14px;border-radius:50%;background:{c};border:2px solid #fff;'
                    f'box-shadow:0 0 4px rgba(0,0,0,.6)"></span>{p}</div>')
            markers[p] = {"type": "html", "label": f"{p} ({b['source']})", "html": html,
                          "position": {"x": b["x"], "y": b["y"] + 1, "z": b["z"]}, "anchor": {"x": 0, "y": 0},
                          "sorting": 0, "listed": True, "minDistance": 0, "maxDistance": 10000000, "classes": []}
        data = {"eat-bodies": {"label": "Bodies", "toggleable": True, "defaultHidden": False, "sorting": 0,
                               "markers": markers}}
        tmp = live / "markers.json.tmp"
        tmp.write_text(json.dumps(data))
        os.replace(tmp, live / "markers.json")


def map_cycle(a) -> None:
    jar = JARS / "bluemap-5.16-cli.jar"
    need(jar)
    where = bodies()
    conf = bluemap_config(a.pack, a.threads, where)
    # textures changed (--pack on or off): every tile again, else only the regions that changed since the last cycle
    state = BM / "textures"
    textures = PACK.name if a.pack else "vanilla"
    force = state.exists() and state.read_text() != textures
    t0 = time.time()
    r = subprocess.run(["java", f"-Xmx{a.mem}", "-jar", str(jar), "-c", str(conf), "-v", "1.20.4", "-r"]
                       + (["-f"] if force else []), cwd=BM, capture_output=True, text=True)
    if not r.returncode:
        state.write_text(textures)
    out = r.stdout + r.stderr
    if r.returncode:
        log(f"bluemap exited {r.returncode}: {out[-2000:]}")
    else:
        log(f"map rendered in {time.time() - t0:.0f} s")
    write_markers(bodies())   # positions again: a render can take minutes


# ---- shots: Chunky ----

# blocks a camera and its line of sight may pass through
SEE_THROUGH = re.compile(r"(air|^minecraft:(snow|short_grass|grass|tall_grass|fern|large_fern|dead_bush|torch|wall_torch|"
                         r"redstone_torch|vine|glass|glass_pane|.*_glass|.*_glass_pane|dandelion|poppy|.*_tulip|"
                         r"azure_bluet|oxeye_daisy|cornflower|allium|blue_orchid|lily_of_the_valley|sweet_berry_bush|"
                         r"sugar_cane|rail|.*_carpet|.*_button|lever|ladder|.*_sign|.*_wall_sign|seagrass|tall_seagrass|"
                         r"water|bubble_column|cobweb|light)$)")


def clear(blocks: anvil.Blocks, a: tuple, b: tuple) -> bool:
    """The segment from a to b crosses only see-through blocks (and b keeps 0.3 blocks from anything solid)."""
    n = max(2, int(math.dist(a, b) / 0.2))
    pts = [tuple(a[k] + (b[k] - a[k]) * i / n for k in range(3)) for i in range(1, n + 1)]
    pts += [(b[0] + dx, b[1] + dy, b[2] + dz) for dx in (-.3, .3) for dy in (-.3, .3) for dz in (-.3, .3)]
    for x, y, z in pts:
        name = blocks.at(math.floor(x), math.floor(y), math.floor(z))
        if name is None or not SEE_THROUGH.search(name):
            return False
    return True


def camera(blocks: anvil.Blocks, b: dict) -> tuple[tuple, tuple]:
    """A third-person camera: behind and above the body (its saved facing), else the first spot around it with a clear
    view of its head, closer in if need be; returns (camera position, the point it looks at)."""
    eye = (b["x"], b["y"] + 1.5, b["z"])
    for dist, up in ((6, 3.5), (5, 2.5), (4, 1.5), (3, 1.0), (2.2, 0.5)):
        for turn in (0, 35, -35, 70, -70, 110, -110, 145, -145, 180):
            a = math.radians(b["yaw"] + turn)
            cam = (eye[0] + math.sin(a) * dist, eye[1] + up, eye[2] - math.cos(a) * dist)   # Minecraft faces (-sin, cos)
            if clear(blocks, eye, cam):
                return cam, (eye[0], eye[1] - 0.4, eye[2])
    for up in (4, 3, 2):
        cam = (eye[0] + 0.01, eye[1] + up, eye[2])
        if clear(blocks, eye, cam):
            return cam, (eye[0], eye[1] - 0.5, eye[2])
    return (eye[0], eye[1] + 0.3, eye[2]), (eye[0] + math.sin(math.radians(b["yaw"])) * -1, eye[1], eye[2])


def sky_open(blocks: anvil.Blocks, b: dict) -> float:
    """The share of the sky light reaching the body's head: 48 cosine-weighted rays into the upper half sphere, a ray
    counted when it gets 48 blocks out (or into unsaved chunks). Deep in a ravine or a cave a shot gets a longer
    exposure, as an eye would adapt."""
    eye, hits = (b["x"], b["y"] + 1.5, b["z"]), 0
    for i in range(48):
        z = math.sqrt((i + 0.5) / 48)
        r, phi = math.sqrt(1 - z * z), i * 2.39996   # golden-angle spiral
        d = (r * math.cos(phi), z, r * math.sin(phi))
        for t in range(2, 240):
            name = blocks.at(*(math.floor(eye[k] + t * 0.2 * d[k]) for k in range(3)))
            if name is None:
                hits += 1
                break
            if not SEE_THROUGH.search(name) and not name.endswith("_leaves"):
                break
        else:
            hits += 1
    return hits / 48


def orientation(cam: tuple, at: tuple) -> dict:
    """Chunky's camera angles for looking from cam at `at` (its view direction is
    (sin p cos y, -cos p, -sin p sin y), so pitch -pi/2 is level)."""
    dx, dy, dz = (at[k] - cam[k] for k in range(3))
    return {"roll": 0.0, "yaw": math.atan2(dz, -dx), "pitch": math.atan2(-math.hypot(dx, dz), -dy)}


def armor(path: Path) -> dict:
    """The body's worn armour, for its model in the shot."""
    try:
        inv = anvil.parse(gzip.decompress(path.read_bytes())).get("Inventory", [])
    except (OSError, ValueError):
        return {}
    slots = {100: "feet", 101: "legs", 102: "chest", 103: "head"}
    return {slots[i["Slot"]]: {"id": i["id"]} for i in inv if i.get("Slot") in slots}


SKINS = {"p1": "steve", "p2": "alex", "p3": "kai", "p4": "zuri"}


def skin(p: str) -> str:
    """A default skin from the client jar per body (offline players have none; Chunky would draw a placeholder)."""
    name = SKINS.get(p, "steve")
    out = CH / "home" / "skins" / f"{name}.png"
    if not out.exists():
        out.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(CH / "home" / "resources" / "minecraft.jar") as z:
            out.write_bytes(z.read(f"assets/minecraft/textures/entity/player/wide/{name}.png"))
    return str(out)


def scene(p: str, b: dict, everyone: dict, spp: int, gpu: bool) -> dict:
    blocks = anvil.Blocks(WORLD, b["dimension"])
    cam, at = camera(blocks, b)
    cx, cz = math.floor(b["x"]) >> 4, math.floor(b["z"]) >> 4
    actors = []
    for q, o in everyone.items():
        if o["dimension"] != b["dimension"]:
            continue
        actors.append({"kind": "player", "uuid": o["uuid"].replace("-", ""), "model": "STEVE", "skin": skin(q),
                       "position": {"x": o["x"], "y": o["y"], "z": o["z"]},
                       "pose": {"all": [0, math.radians(180 - o["yaw"]), 0], "head": [-math.radians(o["pitch"]), 0, 0],
                                "leftArm": [0.4, 0, 0], "rightArm": [-0.4, 0, 0], "leftLeg": [0.4, 0, 0],
                                "rightLeg": [-0.4, 0, 0]},
                       "gear": armor(WORLD / "playerdata" / f"{o['uuid']}.dat"), "scale": 1.0, "headScale": 1.0})
    nether, end = b["dimension"].endswith("nether"), b["dimension"].endswith("end")
    s = {"sdfVersion": 10, "name": p, "width": WIDTH, "height": HEIGHT, "spp": 0, "renderTime": 0, "sppTarget": spp,
         "exposure": round(1 + 2 * (1 - sky_open(blocks, b)) ** 3, 2), "outputMode": "PNG", "pathTrace": True, "rayDepth": 6,
         "saveSnapshots": False, "dumpFrequency": 0, "emittersEnabled": True, "emitterIntensity": 13,
         "biomeColorsEnabled": True, "transparentSky": False,
         "world": {"path": str(WORLD), "dimension": b["dimension"]},
         "chunkList": [[x, z] for x in range(cx - CHUNK_RADIUS, cx + CHUNK_RADIUS + 1)
                       for z in range(cz - CHUNK_RADIUS, cz + CHUNK_RADIUS + 1)],
         "camera": {"name": "camera 1", "position": dict(zip("xyz", cam)), "orientation": orientation(cam, at),
                    "projectionMode": "PINHOLE", "fov": 70, "infDof": True},
         "sun": {"altitude": 0.75, "azimuth": 2.2, "intensity": 1.25, "drawTexture": True},
         "sky": {"mode": "SIMULATED", "simulatedSky": "Preetham", "horizonOffset": 0.1, "cloudsEnabled": False},
         "actors": actors, "entities": [],
         "renderer": "ChunkyClRenderer" if gpu else "PathTracingRenderer", "previewRenderer": "PreviewRenderer"}
    if nether or end:
        s["sky"] = {"mode": "BLACK"}
        s["sun"] = {"altitude": 1.2, "azimuth": 2.2, "intensity": 0.0, "drawTexture": False}
        s["exposure"] = 1.6
    return s


def chunky_cmd(target: int, a) -> list[str]:
    cp = ":".join(str(j) for j in sorted((JARS / "chunky").glob("*.jar")))
    return (["java", f"-Xmx{a.mem}", f"-Dchunky.home={CH / 'home'}", "-cp", cp, "se.llbit.chunky.main.Chunky",
             "-scene-dir", str(CH / "scenes"), "-target", str(target), "-f", "-reload-chunks"]
            + (["-texture", str(PACK)] if a.pack else []))   # the pack over the vanilla textures


def shot(p: str, b: dict, everyone: dict, spp: int, gpu: bool, a) -> dict | None:
    scenes = CH / "scenes"
    (scenes / "snapshots").mkdir(parents=True, exist_ok=True)
    for ext in (".dump", ".octree2", ".json.backup"):   # a fresh render each time, not a continuation
        (scenes / (p + ext)).unlink(missing_ok=True)
    # the OpenCL renderer (0.3.0) copies its samples back only every 1024 passes and stops before copying a last,
    # partial block: GPU shots are whole multiples of 1024 spp, asked for as one pass more
    spp = max(1024, round(spp / 1024) * 1024) if gpu else spp
    target = spp + 1 if gpu else spp
    s = scene(p, b, everyone, target, gpu)
    (scenes / f"{p}.json").write_text(json.dumps(s, indent=1))
    t0 = time.time()
    r = subprocess.run(chunky_cmd(target, a) + (["-threads", str(a.threads)] if not gpu else []) + ["-render", p],
                       capture_output=True, text=True, timeout=max(600, 4 * a.every))
    secs = time.time() - t0
    out = (r.stdout + r.stderr).replace("\r", "\n")
    png = scenes / "snapshots" / f"{p}-{target}.png"
    if r.returncode or not png.exists():
        log(f"{p}: chunky failed ({r.returncode}): " + "\n".join(l for l in out.splitlines() if "%" not in l)[-1500:])
        return None
    m = re.search(r"Total rendering time: (\d+) hours, (\d+) minutes, (\d+) seconds", out)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    d = SHOTS / p
    d.mkdir(parents=True, exist_ok=True)
    os.replace(png, d / f"{stamp}.png")
    shutil.copyfile(d / f"{stamp}.png", d / "latest.png.tmp")
    os.replace(d / "latest.png.tmp", d / "latest.png")
    meta = {"player": p, "time": datetime.now(timezone.utc).isoformat(timespec="seconds"), "file": f"{stamp}.png",
            "position": {k: round(b[k], 1) for k in "xyz"}, "dimension": b["dimension"], "source": b["source"],
            "camera": s["camera"]["position"], "spp": spp, "seconds": round(secs, 1),
            "render_seconds": int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) if m else None,
            "renderer": s["renderer"], "gpu_failed": "Failed to load ChunkyCL" in out}
    (d / "latest.json.tmp").write_text(json.dumps(meta))
    os.replace(d / "latest.json.tmp", d / "latest.json")
    kept = sorted(f for f in d.glob("2*.png"))
    for f in kept[:-a.keep] if a.keep > 0 else []:
        f.unlink()
    log(f"{p}: {spp} spp in {secs:.1f} s ({meta['render_seconds']} s tracing, {s['renderer']}) at {meta['position']} "
        f"{b['dimension']} ({b['source']})")
    return meta


def gpu_ok(a) -> bool:
    """The OpenCL plugin is used when the plugin jar is there, an OpenCL driver is installed and --cpu is not given."""
    plugin = CH / "home" / "plugins" / "chunky-opencl-0.3.0.jar"
    ok = not a.cpu and plugin.exists() and any(Path("/etc/OpenCL/vendors").glob("*.icd"))
    (CH / "home" / "chunky.json").write_text(json.dumps({"plugins": [plugin.name] if ok else []}))
    return ok


def shots_cycle(a, state: dict) -> None:
    need(CH / "home" / "resources" / "minecraft.jar")
    if a.pack:
        need(PACK)
    where = bodies()
    gpu = state.setdefault("gpu", gpu_ok(a))
    t0 = time.time()
    for p in A.PLAYERS:
        if p not in where:
            log(f"{p}: no position yet")
            continue
        spp = a.spp or state.get("spp", 64 if gpu else 16)
        meta = shot(p, where[p], where, spp, gpu, a)
        if meta and meta["gpu_failed"] and gpu:
            log("OpenCL renderer failed; falling back to the CPU renderer")
            state["gpu"] = gpu = False
            gpu_ok(argparse.Namespace(**{**vars(a), "cpu": True}))
        if meta and not a.spp and meta["render_seconds"] is not None:
            # samples per pixel for the next shot: about half the interval for the cycle's four tracings
            budget = a.every * 0.5 / len(A.PLAYERS) - (meta["seconds"] - meta["render_seconds"])
            rate = meta["spp"] / max(meta["render_seconds"], 1)
            state["spp"] = int(min(4096, max(16, rate * max(budget, 1))))
    log(f"shots cycle took {time.time() - t0:.0f} s")


def loop(fn, a, *args) -> None:
    while True:
        t0 = time.time()
        try:
            fn(a, *args)
        except Exception as e:   # one bad cycle (a half-written region file, say) must not stop the loop
            log(f"cycle failed: {type(e).__name__}: {e}")
        if a.once:
            return
        time.sleep(max(5, a.every - (time.time() - t0)))


def timelapse(a) -> int:
    d = SHOTS / a.player
    frames = sorted(d.glob("2*.png"))
    if not frames:
        sys.exit(f"no shots in {d}")
    sys.path.insert(0, str(R / "py"))
    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        sys.exit("no ffmpeg: run bash tools/mc_render/setup.sh (installs imageio-ffmpeg) or install ffmpeg")
    lst = d / "frames.txt"
    lst.write_text("".join(f"file '{f.name}'\nduration {1 / a.fps}\n" for f in frames) + f"file '{frames[-1].name}'\n")
    out = d / "timelapse.mp4"
    subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-vf",
                    "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(a.fps),
                    str(out)], check=True)
    lst.unlink()
    print(f"{out} ({len(frames)} frames)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("map", "shots"):
        s = sub.add_parser(name)
        s.add_argument("--every", type=int, default=300, help="seconds between cycles")
        s.add_argument("--once", action="store_true", help="one cycle, then exit")
        s.add_argument("--pack", action="store_true", help="Pixel Perfection textures over the vanilla ones")
        s.add_argument("--mem", default="6g", help="Java heap")
        s.add_argument("--threads", type=int, default=4, help="CPU threads (BlueMap; Chunky without the GPU)")
        if name == "shots":
            s.add_argument("--spp", type=int, default=0, help="samples per pixel (default: fit the interval)")
            s.add_argument("--keep", type=int, default=200, help="shots kept per player (0: all)")
            s.add_argument("--cpu", action="store_true", help="Chunky's CPU path tracer instead of OpenCL")
    t = sub.add_parser("timelapse")
    t.add_argument("--player", required=True, choices=A.PLAYERS)
    t.add_argument("--fps", type=int, default=12)
    a = ap.parse_args()
    if a.cmd == "timelapse":
        return timelapse(a)
    if a.cmd == "map":
        loop(map_cycle, a)
    else:
        loop(shots_cycle, a, {})
    return 0


if __name__ == "__main__":
    sys.exit(main())
