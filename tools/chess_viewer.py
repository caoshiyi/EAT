#!/usr/bin/env python3
"""Live, read-only viewer of a chess run: the rating over the rated games, the board of the game in progress,
every finished game, and the team of each iteration.

    python tools/chess_viewer.py [--port 17777] [--host 0.0.0.0] [--run NAME=REPO_DIR ...]

Each run is a checkout of this repository (default: one run, this checkout). For each it reads the arena's ledger
(tasks/chess/arena/) and agent_team/ (team configs, BUDGET.md) on every poll and never writes. A run's page is
/r/NAME/ and polls /r/NAME/data.json every 3 s.
"""
import argparse
import json
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import chess

import chess_arena as A

ROOT = Path(__file__).resolve().parent.parent
PAGE = Path(__file__).with_name("chess_viewer.html")
RUNS: dict[str, Path] = {}
_cache: dict[str, dict] = {}
_lock = threading.Lock()


def read_events(root: Path) -> list[dict]:
    """The ledger as it is now; a half-written last line (the arena is appending) is left for the next poll."""
    out, ledger = [], root / "tasks" / "chess" / "arena" / "ledger.jsonl"
    if ledger.exists():
        for line in ledger.read_text().splitlines():
            try:
                out.append(json.loads(line))
            except ValueError:
                break
    return out


def sans(g: dict) -> list[str]:
    b, out = chess.Board(), []
    for u in g["moves"]:
        m = chess.Move.from_uci(u)
        out.append(b.san(m))
        b.push(m)
    return out


def teams(root: Path) -> tuple[list[dict], float]:
    """Per iteration: role names (from its team_config.md), team cost and score (from BUDGET.md)."""
    out = {}
    for cfg in sorted((root / "agent_team").glob("iter_*/team_config.md"), key=lambda p: int(p.parent.name[5:])):
        n = int(cfg.parent.name[5:])
        out[n] = {"iter": n, "roles": re.findall(r"^### Role:\s*(.+?)\s*$", cfg.read_text(errors="replace"), re.M),
                  "cost": None, "score": None}
    budget = root / "agent_team" / "BUDGET.md"
    total = 0.0
    if budget.exists():
        for line in budget.read_text().splitlines():
            c = [x.strip() for x in line.split("|")]
            if len(c) >= 6 and c[1].isdigit():
                try:
                    total = float(c[4])
                    if c[2] == "team":
                        out.setdefault(int(c[1]), {"iter": int(c[1]), "roles": []}).update(
                            cost=float(c[3]), score=c[5] or None)
                except ValueError:
                    pass
    return [out[k] for k in sorted(out)], total


def build(name: str) -> dict:
    root = RUNS[name]
    events = read_events(root)
    key = (len(events), events[-1]["hash"] if events else "")
    with _lock:
        c = _cache.setdefault(name, {"key": None, "data": None})
        if c["key"] == key:
            data = c["data"]
        else:
            gs = A.games(events)
            rated = A.rated(gs)
            history, seen = [], {}
            for g in rated:                              # the rating after each finished rated game
                if not g["end"]:
                    continue
                seen[g["id"]] = g
                history.append(dict(A.rating(seen), game=int(g["id"]), opponent=g["opponent"], color=g["color"],
                                    result=g["end"]["result"], score=g["end"]["score"]))
            blocks = A.iteration_ends(events)
            rows = []
            for g in gs.values():
                b = A.board_of(g)
                rows.append({"id": g["id"], "kind": g["kind"], "opponent": g["opponent"], "color": g["color"],
                             "plies": len(g["moves"]), "illegal": g["illegal"], "started": g.get("started"),
                             "end": g["end"], "fen": b.fen(),
                             "last": (sans(g)[-1] if g["moves"] else None)})
            done = [g for g in rated if g["end"]]
            by = {o: {"score": sum(g["end"]["score"] for g in done if g["opponent"] == o),
                      "n": sum(g["opponent"] == o for g in done)} for o in A.ORDER}
            data = {"total": A.TOTAL, "blocks_closed": blocks, "rating": A.rating(gs),
                    "history": history, "games": rows, "by_opponent": by,
                    "wdl": [sum(g["end"]["score"] == s for g in done) for s in (1.0, 0.5, 0.0)],
                    "illegal": sum(g["illegal"] for g in rated),
                    "practice": {"games": sum(g["kind"] == "practice" for g in gs.values()),
                                 "plies": sum(len(g["moves"]) for g in gs.values() if g["kind"] == "practice")},
                    "opp_rating": A.OPP_RATING, "updated": events[-1]["ts"] if events else None}
            c.update(key=key, data=data)
    t, spent = teams(root)
    return dict(data, teams=t, spent=spent, run=name, runs=list(RUNS))


def game_detail(name: str, gid: str) -> dict | None:
    g = A.games(read_events(RUNS[name])).get(gid)
    if not g:
        return None
    b, fens = chess.Board(), [chess.STARTING_BOARD_FEN]
    for u in g["moves"]:
        b.push_uci(u)
        fens.append(b.board_fen())
    return {"id": gid, "kind": g["kind"], "opponent": g["opponent"], "color": g["color"], "end": g["end"],
            "sans": sans(g), "ucis": g["moves"], "fens": fens}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):   # noqa: N802
        path = self.path.split("?")[0]
        try:
            if path in ("/", "/index.html"):
                self.send_response(302)
                self.send_header("Location", f"/r/{next(iter(RUNS))}/")
                self.end_headers()
                return
            m = re.fullmatch(r"/r/([A-Za-z0-9_.-]{1,40})(/.*)?", path)
            if not m or m.group(1) not in RUNS:
                return self._send(404, b"not found", "text/plain")
            name, rest = m.group(1), m.group(2)
            if rest is None:
                self.send_response(302)
                self.send_header("Location", f"/r/{name}/")
                self.end_headers()
                return
            if rest == "/":
                return self._send(200, PAGE.read_bytes(), "text/html; charset=utf-8")
            if rest == "/data.json":
                return self._send(200, json.dumps(build(name)).encode(), "application/json")
            g = re.fullmatch(r"/game/(p?\d{1,4})\.json", rest)
            if g and (d := game_detail(name, g.group(1))):
                return self._send(200, json.dumps(d).encode(), "application/json")
            self._send(404, b"not found", "text/plain")
        except Exception as e:      # a poll must never take the server down
            self._send(500, f"error: {type(e).__name__}".encode(), "text/plain")

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=17777)
    p.add_argument("--host", default="0.0.0.0")
    p.add_argument("--run", action="append", default=[], metavar="NAME=REPO_DIR")
    a = p.parse_args()
    for spec in a.run or [f"run={ROOT}"]:
        n, _, d = spec.partition("=")
        RUNS[n] = Path(d).expanduser().resolve()
    print(f"chess viewer on http://{a.host}:{a.port}/  runs: " + ", ".join(f"{n} ({d})" for n, d in RUNS.items()), flush=True)
    ThreadingHTTPServer((a.host, a.port), Handler).serve_forever()
