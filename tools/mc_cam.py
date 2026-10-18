#!/usr/bin/env python3
"""Live cam of the minecraft task: records the End in real game visuals while a body is there. Harness only; agents
never see it. The official 1.20.4 client, logged in as the offline spectator "cam" on a virtual display, is recorded
by ffmpeg to MC_DIR/records/video/<UTC date>/cam_<date>_<time>.mp4 (1280x720, 30 fps, ~5 Mbps, 10-minute segments,
fragmented so a cut-off file still plays), each with a .json sidecar of the camera timeline.

    mc_cam.py install --vanilla DIR --vgl DIR   copy the client (DIR/client.jar, libraries, assets) and VirtualGL +
                                                ffmpeg (DIR/vgl, DIR/xlibs, DIR/py/imageio_ffmpeg) into MC_CAM_DIR
    mc_cam.py start | stop                      the daemon in the background (mc_arena.py up / down call these)
    mc_cam.py run                               the daemon in the foreground

The daemon joins when a body enters the End (whitelist + spectator through the harness's RCON), records, parks in the
overworld as soon as no body is in the End (so it never keeps the End loaded) and leaves the game after 2 minutes
of that. It exits once the server is down and no supervisor is running. Camera: 2-3 fixed wide shots of the main
island chosen for a clear line of sight (block tests over RCON), cutting to the body nearest the dragon when it is
within 20 blocks or hitting it: first person (/spectate) when that body faces the dragon, otherwise a fixed close shot
framing the body and the dragon. Shots last at least 8 s unless the dragon has left the frame.

Environment: MC_DIR (.work/mc), MC_CAM_DIR (MC_DIR/cam), MC_CAM_DISPLAY (first free display from :90),
MC_CAM_SOFTWARE=1 (render on the CPU instead of the GPU through VirtualGL), MC_CAM=0 (up does not start it).
"""
import argparse
import json
import math
import os
import re
import shutil
import signal
import socket
import struct
import subprocess
import sys
import time
import uuid as uuidlib
import gzip
import hashlib
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mc_arena as A  # noqa: E402

CAM = Path(os.environ.get("MC_CAM_DIR", A.MC / "cam"))
VIDEO = A.RECORDS / "video"
NAME = "cam"
W, H, FPS = 1280, 720, 30
VFOV = 70.0                      # options fov 0.0
TICK = 0.5
MIN_SHOT = 8.0
LOST = 2.0                       # the dragon out of a shot this long cuts it, once the shot is LOST + 3 s old
STEADY = 45.0                    # first person only through a head turning slower than this (degrees per second)
WHIP = 120.0                     # and leaves it when the head turns faster than this for two ticks in a row
FLUNG = 10.0                     # or the body moves faster than this (blocks per second: knocked back, falling)
SLOW = 8.0                       # a fixed close shot only while the dragon flies slower (blocks per second)
LEAVE_AFTER = 120.0
NEAR = 20.0
ISLAND = 150.0                   # fixed shots only while a body is this close to (0, 0): their chunks are loaded anyway
END = "execute in minecraft:the_end run "
END_ADVANCEMENTS = ("minecraft:story/enter_the_end", "minecraft:end/root")   # what a spectator entering the End earns
# During the fight the dragon's boss bar turns on world fog: the client fades everything to the End's near-black fog
# colour between 5% of its render distance and 96 blocks (min(render distance, 192) / 2). So the wide shots stand
# inside the pillar ring above the island (the dragon and pillars mostly within 50 blocks), render distance 32 pushes
# the fog's start out to 25 blocks, and fast graphics drops the vignette.
WIDE_R, WIDE_Y = 30.0, 94.5
OPTIONS = {"gamma": "1.0", "fov": "0.0", "maxFps": "60", "renderDistance": "32", "simulationDistance": "10",
           "chatVisibility": "2", "particles": "0", "graphicsMode": "0", "pauseOnLostFocus": "false",
           "onboardAccessibility": "false",
           "skipMultiplayerWarning": "true", "tutorialStep": "none", "joinedFirstServer": "true", "bobView": "false",
           "entityDistanceScaling": "5.0", "renderClouds": '"false"', "narrator": "0", "soundCategory_master": "0.0",
           "fullscreen": "false", "guiScale": "2", "showSubtitles": "false", "realmsNotifications": "false"}


def log(msg: str) -> None:
    print(f"{A.now()} {msg}", flush=True)


def whitelist_offline() -> None:
    """Whitelist cam under its offline uuid. `whitelist add cam` resolves the name online and stores a real account's
    uuid, which the offline-mode login then fails to match."""
    uid = str(uuidlib.UUID(bytes=_md5(f"OfflinePlayer:{NAME}"), version=3))
    f = A.SRV / "whitelist.json"
    entries = [e for e in json.loads(f.read_text()) if e.get("name") != NAME] + [{"uuid": uid, "name": NAME}]
    f.write_text(json.dumps(entries, indent=2))
    A.rcon("whitelist reload")


# ---- RCON: one connection, one command in flight (vanilla reads one packet per recv) ----

class Rcon:
    def __init__(self):
        self.sock = None
        self.rid = 0

    def _connect(self):
        props = dict(l.split("=", 1) for l in (A.SRV / "server.properties").read_text().splitlines()
                     if "=" in l and not l.startswith("#"))
        self.sock = socket.create_connection(("127.0.0.1", int(props.get("rcon.port", 25575))), timeout=10)
        self._send(3, (A.MC / "rcon.secret").read_text().strip())
        if self._recv()[0] == -1:
            raise RuntimeError("rcon authentication failed")

    def _send(self, kind: int, body: str):
        self.rid += 1
        p = struct.pack("<ii", self.rid, kind) + body.encode() + b"\0\0"
        self.sock.sendall(struct.pack("<i", len(p)) + p)

    def _recv(self):
        n = struct.unpack("<i", A._read(self.sock, 4))[0]
        d = A._read(self.sock, n)
        return struct.unpack("<i", d[:4])[0], d[8:-2].decode(errors="replace")

    def __call__(self, cmd: str) -> str:
        for attempt in (0, 1):
            try:
                if self.sock is None:
                    self._connect()
                self._send(2, cmd)
                return self._recv()[1]
            except (OSError, ConnectionError, struct.error):
                self.close()
                if attempt:
                    raise
        return ""

    def close(self):
        if self.sock:
            try:
                self.sock.close()
            except OSError:
                pass
        self.sock = None


NUMS = re.compile(r"-?\d+(?:\.\d+)?(?:E-?\d+)?")


def vec(reply: str):
    m = re.search(r"\[([^\]]*)\]", reply)
    if not m or "has the following" not in reply:
        return None
    v = [float(x) for x in NUMS.findall(m[1])]
    return v if len(v) >= 2 else None


def scalar(reply: str):
    if "has the following" not in reply:
        return None
    v = NUMS.findall(reply.split(":")[-1])
    return float(v[0]) if v else None


# ---- geometry (Minecraft yaw/pitch in degrees) ----

def look(c, p):
    dx, dy, dz = p[0] - c[0], p[1] - c[1], p[2] - c[2]
    return math.degrees(math.atan2(-dx, dz)), -math.degrees(math.atan2(dy, math.hypot(dx, dz)))


def in_frame(c, yaw, pitch, p, margin=0.85, vfov=VFOV):
    """p projects inside `margin` of the frame of a camera at c looking (yaw, pitch)."""
    y, q = math.radians(yaw), math.radians(pitch)
    f = (-math.sin(y) * math.cos(q), -math.sin(q), math.cos(y) * math.cos(q))
    r = (-math.cos(y), 0.0, -math.sin(y))
    u = (r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0])
    v = (p[0] - c[0], p[1] - c[1], p[2] - c[2])
    z = sum(a * b for a, b in zip(v, f))
    if z <= 1.0:
        return False
    tv = math.tan(math.radians(vfov) / 2)
    th = tv * W / H
    x = sum(a * b for a, b in zip(v, r)) / z
    yy = sum(a * b for a, b in zip(v, u)) / z
    return abs(x) < th * margin and abs(yy) < tv * margin


def dist(a, b):
    return math.dist(a[:3], b[:3])


def cur_is(shot, mode):
    return bool(shot) and shot["mode"] == mode


# ---- the daemon ----

class Daemon:
    def __init__(self):
        self.rcon = Rcon()
        self.stopping = False
        self.xvfb = self.client = self.ffmpeg = None
        self.display = None
        self.joined = False          # the client is in the game as a spectator
        self.in_end = False
        self.last_body_in_end = 0.0
        self.shot = None             # {"mode", "since", "body", "pos", "yaw", "pitch", "lost_since"}
        self.wides = []              # [(pos, score)]
        self.hp = []                 # [(time, dragon health)]
        self.prev_dragon = None
        self.heads = {}              # body -> (time, yaw, pitch)
        self.timeline = []
        self.rec = None              # {"t0", "dir", "list", "done": set(), "day"}
        self.down_since = None

    # -- processes --

    def free_display(self) -> int:
        if os.environ.get("MC_CAM_DISPLAY"):
            return int(os.environ["MC_CAM_DISPLAY"].lstrip(":"))
        for n in range(90, 200):
            if not Path(f"/tmp/.X11-unix/X{n}").exists() and not Path(f"/tmp/.X{n}-lock").exists():
                return n
        raise RuntimeError("no free X display")

    def start_xvfb(self):
        if self.xvfb and self.xvfb.poll() is None:
            return
        self.display = self.free_display()
        out = open(A.LOGS / "cam_xvfb.log", "a")
        self.xvfb = subprocess.Popen(["Xvfb", f":{self.display}", "-screen", "0", f"{W}x{H}x24", "-nolisten", "tcp"],
                                     stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT)
        out.close()
        for _ in range(50):
            if Path(f"/tmp/.X11-unix/X{self.display}").exists():
                break
            time.sleep(0.1)
        log(f"Xvfb :{self.display} (pid {self.xvfb.pid})")

    def write_options(self):
        game = CAM / "game"
        game.mkdir(parents=True, exist_ok=True)
        f = game / "options.txt"
        lines = f.read_text().splitlines() if f.exists() else ["version:3700"]
        seen = set()
        out = []
        for line in lines:
            k = line.split(":", 1)[0]
            if k in OPTIONS:
                line = f"{k}:{OPTIONS[k]}"
                seen.add(k)
            out.append(line)
        out += [f"{k}:{v}" for k, v in OPTIONS.items() if k not in seen]
        f.write_text("\n".join(out) + "\n")

    def start_client(self):
        props = dict(l.split("=", 1) for l in (A.SRV / "server.properties").read_text().splitlines()
                     if "=" in l and not l.startswith("#"))
        port = props.get("server-port", "25565")
        V = CAM / "vanilla"
        cp = ":".join([str(V / "libraries" / l) for l in (V / "classpath.txt").read_text().split()] + [str(V / "client.jar")])
        self.write_options()
        uid = uuidlib.UUID(bytes=_md5(f"OfflinePlayer:{NAME}"), version=3).hex
        env = dict(os.environ, DISPLAY=f":{self.display}")
        if os.environ.get("MC_CAM_SOFTWARE") == "1":
            env.update(LIBGL_ALWAYS_SOFTWARE="1", GALLIUM_DRIVER="llvmpipe")
        else:
            env.update(VGL_DISPLAY="egl0", LD_LIBRARY_PATH=f"{CAM}/vgl/usr/lib:{CAM}/xlibs/usr/lib/x86_64-linux-gnu",
                       LD_PRELOAD=f"{CAM}/vgl/usr/lib/libdlfaker.so:{CAM}/vgl/usr/lib/libvglfaker.so")
        out = open(A.LOGS / "cam_client.log", "a")
        self.client = subprocess.Popen(
            ["java", "-Xmx2G", "-Xms1G", "-XX:+UseG1GC", f"-XX:ErrorFile={A.LOGS}/cam_hs_err_%p.log", "-cp", cp,
             "net.minecraft.client.main.Main", "--username", NAME, "--version", "1.20.4", "--gameDir", str(CAM / "game"),
             "--assetsDir", str(V / "assets"), "--assetIndex", "12", "--uuid", uid, "--accessToken", "0",
             "--clientId", "", "--xuid", "", "--userType", "legacy", "--versionType", "release",
             "--width", str(W), "--height", str(H), "--quickPlayMultiplayer", f"127.0.0.1:{port}"],
            cwd=CAM / "game", env=env, stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT)
        out.close()
        log(f"client started (pid {self.client.pid}) for 127.0.0.1:{port} on :{self.display}")

    def online(self) -> bool:
        r = self.rcon("list")
        names = r.split(":", 1)[1] if ":" in r else ""
        return NAME in [n.strip() for n in names.split(",")]

    def join(self) -> bool:
        """Start the client and make it a spectator the moment it is in (force-gamemode puts a joining player in
        survival); park it in the overworld until it is wanted in the End."""
        whitelist_offline()
        self.start_xvfb()
        self.start_client()
        deadline = time.time() + 180
        while time.time() < deadline and not self.stopping:
            if self.client.poll() is not None:
                log(f"client exited ({self.client.returncode}) before joining")
                return False
            r = self.rcon(f"gamemode spectator {NAME}")
            if "game mode" in r:
                log(f"joined; {r.strip()}")
                break
            if "No player" not in r and self.online():   # already a spectator (no change, no message)
                break
            time.sleep(0.05)
        else:
            return False
        gm = scalar(self.rcon(f"data get entity {NAME} playerGameType"))
        if gm != 3:
            log(f"cam is not a spectator after joining (playerGameType {gm}); leaving")
            self.leave()
            return False
        self.joined = True
        self.park()
        self.quiet_advancements()
        time.sleep(10)                 # the client settles: first chunks, the join toasts fade
        return True

    def quiet_advancements(self):
        """Grant cam the advancements that entering the End gives, with announcements off for those two commands,
        so the bodies never read "cam has made the advancement [The End?]" in their chat."""
        f = A.SRV / "world" / "advancements" / f"{uuidlib.UUID(bytes=_md5(f'OfflinePlayer:{NAME}'), version=3)}.json"
        try:
            have = json.loads(f.read_text())
        except (OSError, ValueError):
            have = {}
        missing = [a for a in END_ADVANCEMENTS if not (have.get(a) or {}).get("done")]
        if not missing:
            return
        was = "true" in self.rcon("gamerule announceAdvancements").rsplit(":", 1)[-1]
        if was:
            self.rcon("gamerule announceAdvancements false")
        try:
            for a in missing:
                self.rcon(f"advancement grant {NAME} only {a}")
        finally:
            if was:
                self.rcon("gamerule announceAdvancements true")
        log(f"granted {NAME} {', '.join(missing)} unannounced")

    def park(self):
        """Out of the End, onto the overworld spawn's surface: where it waits and where it next joins."""
        self.rcon(f"execute as {NAME} run spectate")
        spawn = level_spawn()
        self.rcon(f"execute in minecraft:overworld positioned {spawn[0]} 0 {spawn[2]} positioned over world_surface "
                  f"run tp {NAME} ~0.5 ~ ~0.5")
        self.in_end = False

    def leave(self):
        self.stop_recording()
        try:
            if self.online():
                self.park()
                time.sleep(1)
        except (OSError, RuntimeError, ConnectionError):
            pass
        for p in (self.client,):
            if p and p.poll() is None:
                p.terminate()
                try:
                    p.wait(20)
                except subprocess.TimeoutExpired:
                    p.kill()
                    p.wait()
        self.client = None
        self.joined = False
        self.in_end = False
        log("left the game")

    # -- recording --

    def start_recording(self):
        day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        d = VIDEO / day
        d.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%H%M%S")
        lst = d / f"segments_{stamp}.csv"
        ff = str(CAM / "ffmpeg")
        out = open(A.LOGS / "cam_ffmpeg.log", "a")
        self.ffmpeg = subprocess.Popen(
            [ff, "-loglevel", "warning", "-y", "-f", "x11grab", "-draw_mouse", "0",
             "-framerate", str(FPS), "-video_size", f"{W}x{H}", "-i", f":{self.display}",
             "-c:v", "libx264", "-preset", "veryfast", "-tune", "film", "-b:v", "5M", "-maxrate", "6M", "-bufsize", "10M",
             "-pix_fmt", "yuv420p", "-g", str(FPS * 2), "-f", "segment", "-segment_time", "600", "-reset_timestamps", "1",
             "-segment_format_options", "movflags=+frag_keyframe+empty_moov+default_base_moof",
             "-segment_list", str(lst), "-segment_list_type", "csv", "-strftime", "1",
             str(d / "cam_%Y%m%d_%H%M%S.mp4")],
            env=dict({k: v for k, v in os.environ.items() if k not in ("LD_PRELOAD", "LD_LIBRARY_PATH")},
                     DISPLAY=f":{self.display}", TZ="UTC"),
            stdin=subprocess.PIPE, stdout=out, stderr=subprocess.STDOUT)
        out.close()
        self.rec = {"t0": time.time() + 0.2, "list": lst, "done": set(), "day": day}
        self.timeline = [dict(self.timeline[-1], t=time.time())] if self.timeline else []
        log(f"recording (ffmpeg pid {self.ffmpeg.pid}) to {d}")

    def stop_recording(self):
        if self.ffmpeg and self.ffmpeg.poll() is None:
            try:
                self.ffmpeg.stdin.write(b"q")
                self.ffmpeg.stdin.flush()
            except OSError:
                pass
            try:
                self.ffmpeg.wait(20)
            except subprocess.TimeoutExpired:
                self.ffmpeg.send_signal(signal.SIGINT)
                try:
                    self.ffmpeg.wait(10)
                except subprocess.TimeoutExpired:
                    self.ffmpeg.kill()
                    self.ffmpeg.wait()
            log("recording stopped")
        if self.rec:
            self.sidecars(final=True)
        self.ffmpeg = None
        self.rec = None

    def sidecars(self, final=False):
        """A .json beside each finished segment: the camera timeline over it (offsets in seconds)."""
        r = self.rec
        if not r or not r["list"].exists():
            return
        rows = [l.split(",") for l in r["list"].read_text().splitlines() if l.strip()]
        for name, s0, s1 in [x[:3] for x in rows if len(x) >= 3]:
            if name in r["done"]:
                continue
            r["done"].add(name)
            a, b = r["t0"] + float(s0), r["t0"] + float(s1)
            ev = [e for e in self.timeline if a <= e["t"] < b]
            before = [e for e in self.timeline if e["t"] < a]
            if before:
                ev = [dict(before[-1], t=a)] + ev
            side = {"segment": name, "start": iso(a), "end": iso(b), "duration_s": round(b - a, 2),
                    "timeline": [dict(e, offset_s=round(e["t"] - a, 2), time=iso(e["t"])) for e in ev]}
            for e in side["timeline"]:
                e.pop("t", None)
            (r["list"].parent / (Path(name).stem + ".json")).write_text(json.dumps(side, indent=1))

    # -- the director --

    def los(self, c, p, skip=0.0) -> bool:
        """No block on the segment c -> p, except within `skip` of p (the target's own volume); unloaded counts clear."""
        d = dist(c, p)
        n = int((d - skip) / 1.0)
        for i in range(1, n):
            t = i / d
            x, y, z = (c[k] + (p[k] - c[k]) * t for k in range(3))
            if "Test failed" in self.rcon(f"execute in minecraft:the_end if block {math.floor(x)} {math.floor(y)} "
                                          f"{math.floor(z)} minecraft:air"):
                return False
        return True

    def air(self, c) -> bool:
        return "Test failed" not in self.rcon(f"execute in minecraft:the_end if block {math.floor(c[0])} "
                                              f"{math.floor(c[1])} {math.floor(c[2])} minecraft:air")

    def choose_wides(self):
        """Up to four well-separated fixed positions round the island with the clearest view of it."""
        targets = [(0.0, 66.0, 0.0)]
        targets += [(25 * math.cos(a), 80.0, 25 * math.sin(a)) for a in [i * math.pi / 3 for i in range(6)]]
        targets += [(48 * math.cos(a), 88.0, 48 * math.sin(a)) for a in [i * math.pi / 3 + 0.5 for i in range(6)]]
        cands = []
        for i in range(12):
            a = i * math.pi / 6
            c = (round(WIDE_R * math.cos(a), 1) + 0.5, WIDE_Y, round(WIDE_R * math.sin(a), 1) + 0.5)
            if not self.air(c):
                continue
            score = sum(self.los(c, t, skip=2.0) for t in targets) / len(targets)
            cands.append((score, i, c))
        cands.sort(reverse=True)
        picked = []
        for score, i, c in cands:
            if all(min((i - j) % 12, (j - i) % 12) >= 3 for _, j, _ in picked):
                picked.append((score, i, c))
            if len(picked) == 4:
                break
        self.wides = [(c, s) for s, _, c in picked] or [((0.5, 110.5, -70.5), 0.0)]
        log("wide shots: " + "; ".join(f"({c[0]:.0f},{c[1]:.0f},{c[2]:.0f}) clear {s:.2f}" for c, s in self.wides))

    def wide_shot(self, dragon):
        """The fixed wide position and aim that best frame the island and the dragon."""
        center = (0.0, 68.0, 0.0)
        best = None
        for c, s in self.wides:
            for w in ((0.0, 0.3, 0.5) if dragon else (0.0,)):
                aim = center if not dragon else tuple(center[k] * (1 - w) + dragon[k] * w for k in range(3))
                yaw, pitch = look(c, aim)
                pitch = max(-50.0, min(30.0, pitch))
                ok = not dragon or (in_frame(c, yaw, pitch, dragon, 0.8) and self.los(c, dragon, skip=6.0))
                isl = in_frame(c, yaw, pitch, center, 0.9)
                score = (2 if ok else 0) + (1 if isl else 0) + s - (dist(c, dragon) / 400 if dragon else 0) - w * 0.2
                if best is None or score > best[0]:
                    best = (score, c, yaw, pitch, ok)
        _, c, yaw, pitch, ok = best
        return {"mode": "wide", "pos": [round(x, 2) for x in c], "yaw": round(yaw, 2), "pitch": round(pitch, 2),
                "dragon_in_frame": ok}

    def close_shot(self, body, dragon):
        """A fixed camera behind and beside the body, framing the body and the dragon."""
        b = body["pos"]
        eye = (b[0], b[1] + 1.6, b[2])
        ux, uz = dragon[0] - b[0], dragon[2] - b[2]
        n = math.hypot(ux, uz) or 1.0
        ux, uz = ux / n, uz / n
        for back, side, up in ((10, 6, 4), (10, -6, 4), (14, 7, 7), (14, -7, 7), (7, 4, 3), (7, -4, 3)):
            c = (b[0] - ux * back - uz * side, b[1] + up, b[2] - uz * back + ux * side)
            aim = tuple(eye[k] + (dragon[k] - eye[k]) * 0.45 for k in range(3))
            yaw, pitch = look(c, aim)
            pitch = max(-60.0, min(45.0, pitch))
            if not (in_frame(c, yaw, pitch, eye, 0.9) and in_frame(c, yaw, pitch, dragon, 0.85)):
                continue
            if self.air(c) and self.los(c, eye, skip=0.5) and self.los(c, dragon, skip=6.0):
                return {"mode": "close", "body": body["name"], "pos": [round(x, 2) for x in c], "yaw": round(yaw, 2),
                        "pitch": round(pitch, 2)}
        return None

    def apply(self, shot, reason):
        if shot["mode"] == "pov":
            self.rcon(f"spectate {shot['body']} {NAME}")
        else:
            self.rcon(f"execute as {NAME} run spectate")
            p = shot["pos"]
            self.rcon(END + f"tp {NAME} {p[0]} {p[1]} {p[2]} {shot['yaw']} {shot['pitch']}")
        shot = dict(shot, since=time.time(), lost_since=None)
        self.shot = shot
        ev = {"t": time.time(), "reason": reason, **{k: v for k, v in shot.items() if k not in ("since", "lost_since")}}
        self.timeline.append(ev)
        log(f"cut: {shot['mode']}" + (f" {shot.get('body')}" if shot.get("body") else "") + f" ({reason})")

    def bodies(self):
        """Bodies in the End with their state, from the bot host; None if it cannot be asked."""
        try:
            st = A.api("GET", "/status", timeout=5)
        except (OSError, ValueError):
            return None
        out = []
        for name, s in st.items():
            if s.get("connected") and s.get("dimension") == "the_end":
                p = s["position"]
                out.append({"name": name, "pos": (p["x"], p["y"], p["z"]), "alive": s.get("alive"),
                            # mineflayer's yaw/pitch (radians) to Minecraft degrees
                            "yaw": 180 - math.degrees(s.get("yaw", 0)), "pitch": -math.degrees(s.get("pitch", 0))})
        return out

    def dragon(self):
        p = vec(self.rcon(END + "data get entity @e[type=minecraft:ender_dragon,limit=1] Pos"))
        if not p:
            return None, None
        hp = scalar(self.rcon(END + "data get entity @e[type=minecraft:ender_dragon,limit=1] Health"))
        return (p[0], p[1] + 2.0, p[2]), hp     # +2: its body, not its feet

    def direct(self, bodies, dragon, hp):
        t = time.time()
        if hp is not None:
            self.hp = [(a, b) for a, b in self.hp if t - a < 6] + [(t, hp)]
        hit = len(self.hp) > 1 and min(b for a, b in self.hp if t - a < 4) < max(b for a, b in self.hp if t - a < 4)
        speed = 0.0                    # the dragon's, blocks per second
        if dragon and self.prev_dragon and 0 < t - self.prev_dragon[0] < 2:
            speed = dist(dragon, self.prev_dragon[1]) / (t - self.prev_dragon[0])
        self.prev_dragon = (t, dragon) if dragon else None
        for b in bodies:               # how fast each head turns (degrees per second) and the body moves (blocks)
            q = self.heads.get(b["name"])
            ok = q and 0 < t - q[0] < 2
            turn = abs((b["yaw"] - q[1] + 540) % 360 - 180) + abs(b["pitch"] - q[2]) if ok else 0.0
            b["turn"] = turn / (t - q[0]) if ok else 0.0
            b["move"] = dist(b["pos"], q[3]) / (t - q[0]) if ok else 0.0
            self.heads[b["name"]] = (t, b["yaw"], b["pitch"], b["pos"])
        live = [b for b in bodies if b["alive"]]
        engaged = None
        if dragon and live:
            nb = min(live, key=lambda b: dist(b["pos"], dragon))
            d = dist(nb["pos"], dragon)
            if d <= NEAR or (hit and d <= NEAR * 1.75):
                engaged = nb

        # is the dragon in the current shot, and is a first-person shot steady?
        sh = self.shot
        if sh and dragon:
            if sh["mode"] == "pov":
                b = next((x for x in live if x["name"] == sh["body"]), None)
                seen = bool(b) and in_frame((b["pos"][0], b["pos"][1] + 1.62, b["pos"][2]), b["yaw"], b["pitch"], dragon, 0.95)
            else:
                seen = in_frame(sh["pos"], sh["yaw"], sh["pitch"], dragon, 0.95) and self.los_cached(sh, dragon)
            sh["lost_since"] = None if seen else (sh["lost_since"] or t)
        if sh and sh["mode"] == "pov":
            b = next((x for x in live if x["name"] == sh["body"]), None)
            sh["whip"] = (sh.get("whip", 0) + 1) if b and (b["turn"] > WHIP or b["move"] > FLUNG) else 0
        age = t - sh["since"] if sh else 1e9
        lost = bool(sh and sh.get("lost_since") and t - sh["lost_since"] >= LOST and age >= LOST + 3)
        gone = bool(sh and sh["mode"] in ("pov", "close") and not any(b["name"] == sh["body"] for b in live))
        whip = bool(sh and sh.get("whip", 0) >= 2 and age >= 3)

        # first person only through a head that is steady and looking at the dragon; a fixed close shot only while
        # the dragon is slow enough to stay in it; otherwise the wide shots. With every body far from the main island
        # the camera rides with one, so that it loads no chunk the bodies do not.
        want = "wide"
        if live and not any(math.hypot(b["pos"][0], b["pos"][2]) < ISLAND for b in live):
            if sh and cur_is(sh, "pov") and any(b["name"] == sh["body"] for b in live):
                return
            self.apply({"mode": "pov", "body": live[0]["name"]}, "far from the island")
            return
        if engaged:
            b = engaged
            eye = (b["pos"][0], b["pos"][1] + 1.62, b["pos"][2])
            if in_frame(eye, b["yaw"], b["pitch"], dragon, 0.7) and b["turn"] < STEADY and b["move"] < FLUNG / 2:
                want = "pov"
            elif speed < SLOW:
                want = "close"
        cur = sh["mode"] if sh else None
        if sh and not lost and not gone and not whip:
            if age < MIN_SHOT:
                return
            same = want == cur and (want == "wide" or sh.get("body") == engaged["name"])
            if same and not sh.get("lost_since"):
                return
            if cur == "pov" and engaged and sh.get("body") == engaged["name"] and not sh.get("lost_since"):
                return             # still seeing it through the body's eyes
        reason = ("dragon left the shot" if lost else "body gone" if gone else "head turning fast" if whip
                  else "engaged" if engaged else "overview")
        if want == "pov" and not whip:
            self.apply({"mode": "pov", "body": engaged["name"]}, reason)
            return
        if want in ("pov", "close"):
            shot = self.close_shot(engaged, dragon)
            if shot:
                self.apply(shot, reason)
                return
        shot = self.wide_shot(dragon)
        if sh and cur == "wide" and shot["pos"] == sh["pos"] and abs(shot["yaw"] - sh["yaw"]) < 1 and not lost:
            sh["since"] = t
            return
        self.apply(shot, reason)

    def los_cached(self, sh, dragon) -> bool:
        """Line of sight from a fixed shot to the dragon, tested at most once a second."""
        if time.time() - sh.get("los_t", 0) >= 1.0:
            sh["los_t"], sh["los"] = time.time(), self.los(sh["pos"], dragon, skip=6.0)
        return sh["los"]

    # -- main loop --

    def enter_end(self):
        if not self.wides:
            self.choose_wides()
        self.shot = None
        self.apply(self.wide_shot(self.dragon()[0]), "entering the End")
        self.in_end = True
        time.sleep(3)                  # the client loads the End (its loading screen is not recorded)
        self.start_recording()

    def step(self):
        bodies = self.bodies()
        if bodies is None:            # the bot host is restarting: ask the server who is in the End
            r = self.rcon(END + f"execute if entity @a[name=!{NAME},gamemode=!spectator,x=0,y=0,z=0,distance=0..]")
            bodies = [] if "failed" in r else None
        t = time.time()
        if bodies is None or bodies:
            self.last_body_in_end = t
        if bodies:
            if not self.joined and not self.join():
                return
            if not self.in_end:
                self.enter_end()
            if self.ffmpeg and self.ffmpeg.poll() is not None:
                log(f"ffmpeg exited ({self.ffmpeg.returncode}); restarting it")
                self.rec = None
                self.start_recording()
            elif self.rec and self.rec["day"] != datetime.now(timezone.utc).strftime("%Y-%m-%d"):
                self.stop_recording()
                self.start_recording()
            dragon, hp = self.dragon()
            self.direct(bodies, dragon, hp)
            self.sidecars()
        elif bodies is not None:
            if self.in_end:
                log("no body in the End: parking in the overworld")
                self.stop_recording()
                self.park()
            if self.joined and t - self.last_body_in_end > LEAVE_AFTER:
                self.leave()
        if self.client and self.client.poll() is not None:
            log(f"client exited ({self.client.returncode}); it rejoins when needed")
            self.stop_recording()
            self.client = None
            self.joined = self.in_end = False

    def run(self) -> int:
        A.LOGS.mkdir(parents=True, exist_ok=True)
        A.RUN.mkdir(parents=True, exist_ok=True)
        (A.RUN / "cam.pid").write_text(str(os.getpid()))
        signal.signal(signal.SIGTERM, lambda *_: setattr(self, "stopping", True))
        signal.signal(signal.SIGINT, lambda *_: setattr(self, "stopping", True))
        if not (CAM / "vanilla" / "client.jar").exists():
            log(f"no client in {CAM}: run mc_cam.py install")
            return 1
        log(f"cam daemon (pid {os.getpid()}), client in {CAM}, video to {VIDEO}")
        try:
            while not self.stopping:
                t = time.time()
                try:
                    self.step()
                    self.down_since = None
                except (OSError, ConnectionError, RuntimeError, struct.error) as e:
                    self.down_since = self.down_since or t
                    if A.pid_of("supervisor", "_supervise") is None and t - self.down_since > 10:
                        log(f"server down and no supervisor ({e}); exiting")
                        break
                    if t - self.down_since < 1:
                        log(f"server unreachable ({e}); waiting")
                    if self.ffmpeg:
                        self.stop_recording()
                time.sleep(max(0.05, TICK - (time.time() - t)))
        finally:
            self.shutdown()
        return 0

    def shutdown(self):
        try:
            self.leave() if self.joined or self.client else self.stop_recording()
        except Exception as e:  # noqa: BLE001  the processes below still have to go
            log(f"leaving failed: {e}")
        for p in (self.client, self.xvfb):
            if p and p.poll() is None:
                p.terminate()
                try:
                    p.wait(10)
                except subprocess.TimeoutExpired:
                    p.kill()
        self.rcon.close()
        (A.RUN / "cam.pid").unlink(missing_ok=True)
        log("cam daemon stopped")


def _md5(text: str) -> bytes:
    return hashlib.md5(text.encode()).digest()


def iso(t: float) -> str:
    return datetime.fromtimestamp(t, timezone.utc).isoformat(timespec="milliseconds")


def level_spawn():
    """The overworld spawn (SpawnX/Y/Z of level.dat)."""
    try:
        d = gzip.decompress((A.SRV / "world" / "level.dat").read_bytes())
        out = []
        for k in (b"SpawnX", b"SpawnY", b"SpawnZ"):
            i = d.find(b"\x03" + struct.pack(">H", len(k)) + k)
            out.append(struct.unpack(">i", d[i + 3 + len(k): i + 7 + len(k)])[0])
        return out
    except (OSError, ValueError, struct.error):
        return [0, 64, 0]


# ---- commands ----

def cmd_install(args) -> int:
    src = Path(args.vanilla)
    vgl = Path(args.vgl)
    V = CAM / "vanilla"
    V.mkdir(parents=True, exist_ok=True)
    for name in ("client.jar", "1.20.4.json"):
        shutil.copy2(src / name, V / name)
    for name in ("libraries", "assets"):
        shutil.copytree(src / name, V / name, dirs_exist_ok=True)
    # the classpath relative to vanilla/libraries, so the install can live anywhere
    libs = [p.split("/libraries/", 1)[1] for p in (src / "classpath.txt").read_text().strip().split(":") if "/libraries/" in p]
    (V / "classpath.txt").write_text("\n".join(libs) + "\n")
    if (src / "game" / "options.txt").exists():
        (CAM / "game").mkdir(parents=True, exist_ok=True)
        shutil.copy2(src / "game" / "options.txt", CAM / "game" / "options.txt")
    for name in ("vgl", "xlibs"):
        shutil.copytree(vgl / name, CAM / name, dirs_exist_ok=True, symlinks=True)
    ff = next((vgl / "py" / "imageio_ffmpeg" / "binaries").glob("ffmpeg-linux-*"))
    shutil.copy2(ff, CAM / "ffmpeg")
    os.chmod(CAM / "ffmpeg", 0o755)
    print(f"installed the client, VirtualGL and ffmpeg in {CAM}")
    return 0


def running():
    return A.pid_of("cam", "mc_cam.py")


def start() -> str:
    """Start the daemon unless it is running, disabled (MC_CAM=0) or not installed. For mc_arena.py up."""
    if os.environ.get("MC_CAM", "1") == "0":
        return "live cam disabled (MC_CAM=0)"
    if not (CAM / "vanilla" / "client.jar").exists():
        return f"live cam not installed ({CAM}): python3 tools/mc_cam.py install"
    pid = running()
    if pid:
        return f"live cam running (pid {pid})"
    A.LOGS.mkdir(parents=True, exist_ok=True)
    with open(A.LOGS / "cam.log", "a") as out:
        pid = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run"], cwd=A.ROOT,
                               stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                               start_new_session=True).pid
    return f"live cam started (pid {pid})"


def stop(timeout: float = 60) -> str:
    """Stop the daemon: it parks the camera in the overworld and leaves the game first. For mc_arena.py down."""
    pid = running()
    if not pid:
        return "live cam not running"
    os.kill(pid, signal.SIGTERM)
    deadline = time.time() + timeout
    while time.time() < deadline and A.alive(pid):
        time.sleep(0.5)
    if A.alive(pid):
        os.kill(pid, signal.SIGKILL)
        return f"live cam did not stop in {timeout:.0f} s; killed (pid {pid})"
    return "live cam stopped"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("install")
    i.add_argument("--vanilla", required=True)
    i.add_argument("--vgl", required=True)
    sub.add_parser("run")
    sub.add_parser("start")
    sub.add_parser("stop")
    a = ap.parse_args()
    if a.cmd == "install":
        return cmd_install(a)
    if a.cmd == "run":
        return Daemon().run()
    print(start() if a.cmd == "start" else stop())
    return 0


if __name__ == "__main__":
    sys.exit(main())
