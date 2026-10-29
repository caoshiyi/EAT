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
OVERVIEW = Path(__file__).with_name("chess_overview.html")
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


def run_conf(root: Path) -> dict | None:
    f = root / ".work" / "chess_run.json"
    return json.loads(f.read_text()) if f.exists() else None


def build(name: str) -> dict:
    root = RUNS[name]
    conf = run_conf(root)
    opp = A.opp_ratings(conf)
    label = ({c: f"Elo {l}" for l, c in A.ladder_codes(conf).items()} if conf else
             {"full-strength": "Full strength", "skill-0": "Skill 0", "elo-1800-setting": "Elo 1800 setting"})
    order = ([A.ladder_codes(conf)[l] for l in A.all_levels(conf)] if conf else ["skill-0", "elo-1800-setting", "full-strength"])
    events = read_events(root)
    key = (len(events), events[-1]["hash"] if events else "")
    with _lock:
        c = _cache.setdefault(name, {"key": None, "data": None})
        if c["key"] == key:
            data = c["data"]
        else:
            gs = A.games(events)
            rated = A.rated(gs)
            finished = [g for g in rated if g["end"]]
            hc = _cache.setdefault(name + "#history", {"n": 0, "history": []})
            if hc["n"] != len(finished):                 # recomputed only when a rated game has finished
                history, seen = [], {}
                for g in finished:                       # the rating after each finished rated game
                    seen[g["id"]] = g
                    history.append(dict(A.rating(seen, opp), game=int(g["id"]), opponent=label.get(g["opponent"], g["opponent"]),
                                        color=g["color"], result=g["end"]["result"], score=g["end"]["score"]))
                hc.update(n=len(finished), history=history)
            history = hc["history"]
            blocks = A.iteration_ends(events)
            rows = []
            for g in gs.values():
                b = A.board_of(g)
                rows.append({"id": g["id"], "kind": g["kind"], "opponent": label.get(g["opponent"], g["opponent"].replace("practice-", "Elo ")), "color": g["color"],
                             "plies": len(g["moves"]), "illegal": g["illegal"], "started": g.get("started"),
                             "end": g["end"], "fen": b.fen(),
                             "last": (sans(g)[-1] if g["moves"] else None)})
            done = [g for g in rated if g["end"]]
            by = {label[o]: {"score": sum(g["end"]["score"] for g in done if g["opponent"] == o),
                             "n": sum(g["opponent"] == o for g in done)} for o in order}
            data = {"total": A.TOTAL, "blocks_closed": blocks, "rating": A.rating(gs, opp), "order": [label[o] for o in order],
                    "history": history, "games": rows, "by_opponent": by,
                    "wdl": [sum(g["end"]["score"] == s for g in done) for s in (1.0, 0.5, 0.0)],
                    "illegal": sum(g["illegal"] for g in rated),
                    "practice": {"games": sum(g["kind"] == "practice" for g in gs.values()),
                                 "plies": sum(len(g["moves"]) for g in gs.values() if g["kind"] == "practice")},
                    "opp_rating": ({} if conf else {"Skill 0": 1320, "Elo 1800 setting": 1800}),
                    "ladder": conf["ladder"] if conf else None, "updated": events[-1]["ts"] if events else None}
            c.update(key=key, data=data)
    t, spent = teams(root)
    return dict(data, teams=t, spent=spent, run=name, runs=list(RUNS))


def overview() -> dict:
    """Every run on one page: its rating after each rated game and where it stands."""
    runs = []
    for name in RUNS:
        d = build(name)
        runs.append({"name": name, "history": [[h["game"], h["estimate"], h["lower"], h["upper"]] for h in d["history"]],
                     "rating": d["rating"], "done": sum(d["wdl"]), "wdl": d["wdl"], "by_opponent": d["by_opponent"],
                     "iteration": len(d["blocks_closed"]) + 1 if d["teams"] else None,
                     "roles": d["teams"][-1]["roles"] if d["teams"] else [], "spent": d["spent"],
                     "updated": d["updated"], "opp_rating": d["opp_rating"]})
    refs = {}
    for r in runs:
        refs.update(r.pop("opp_rating"))
    return {"runs": runs, "total": A.TOTAL, "opp_rating": refs}


def game_detail(name: str, gid: str) -> dict | None:
    conf = run_conf(RUNS[name])
    label = {c: f"Elo {l}" for l, c in A.ladder_codes(conf).items()} if conf else {}
    g = A.games(read_events(RUNS[name])).get(gid)
    if not g:
        return None
    b, fens = chess.Board(), [chess.STARTING_BOARD_FEN]
    for u in g["moves"]:
        b.push_uci(u)
        fens.append(b.board_fen())
    return {"id": gid, "kind": g["kind"], "opponent": label.get(g["opponent"], g["opponent"].replace("practice-", "Elo ")),
            "color": g["color"], "end": g["end"],
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
                if len(RUNS) > 1:
                    return self._send(200, OVERVIEW.read_bytes(), "text/html; charset=utf-8")
                self.send_response(302)
                self.send_header("Location", f"/r/{next(iter(RUNS))}/")
                self.end_headers()
                return
            if path == "/all.json":
                return self._send(200, json.dumps(overview()).encode(), "application/json")
            m = re.fullmatch(r"/r/([A-Za-z0-9_.-]{1,40})(/.*)?", path)
            if m and m.group(1) not in RUNS:      # a renamed run: an old link or an open page finds it by its prefix
                close = [n for n in RUNS if n.startswith(m.group(1))]
                if close:
                    self.send_response(302)
                    self.send_header("Location", f"/r/{close[0]}{m.group(2) or '/'}")
                    self.end_headers()
                    return
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
