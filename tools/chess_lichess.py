#!/usr/bin/env python3
"""Where the chess task's opponents sit on the Lichess rating scale. Engine games only: every ladder level (Stockfish
at a UCI_Elo, played exactly as the arena plays it) against the eight opponents of arXiv 2610.03695, Table 14, whose
Lichess ratings that paper gives. The anchors' ratings stay fixed; each level's rating is fitted to its results.

    chess_lichess.py play [--games N] [--jobs 4]    play until every level has N games (resumes; Ctrl-C is safe)
    chess_lichess.py play --anchors                 the anchors against each other (4 games a pair), as a check
    chess_lichess.py fit                            the table: each level's Lichess rating and 95% range
    chess_lichess.py convert RATING [...]           a rating measured on our ladder -> the Lichess scale
    chess_lichess.py rerate                         the arena's rating (CHESS_ARENA_DIR, CHESS_RUN) recomputed with
                                                    each opponent at its fitted Lichess rating instead of its UCI_Elo

A game: one of the paper's two openings (1.e4 e5 2.Nf3 Nc6; 1.d4 d5 2.c4 e6), each played with both colours; ended as
the arena ends games (checkmate, stalemate, insufficient material, claimable repetition or 50-move draw) or drawn
after MAX_PLIES. After a first round against all eight anchors a level plays only the three anchors nearest its current
estimate, where a game says most. Engines run on one thread each, the whole tool at nice 19.

Environment: CHESS_ENGINE and CHESS_NODES as the arena's (set CHESS_ENGINE to the run's Stockfish), CHESS_CALIB_DIR
(games.jsonl, scale.json; default tasks/chess/calib), CHESS_LC0 (the lc0 binary) and CHESS_NETS (its weights; defaults
under .work/calib).
"""
import argparse
import json
import logging
import math
import multiprocessing
import os
import random
import sys
import time
from collections import defaultdict
from pathlib import Path

import chess
import chess.engine

import chess_arena as A

OUT = Path(os.environ.get("CHESS_CALIB_DIR", A.ROOT / "tasks" / "chess" / "calib"))
GAMES = OUT / "games.jsonl"
SCALE = OUT / "scale.json"
LC0 = os.environ.get("CHESS_LC0", str(A.ROOT / ".work" / "calib" / "lc0-src" / "build" / "release" / "lc0"))
NETS = Path(os.environ.get("CHESS_NETS", A.ROOT / ".work" / "calib" / "nets"))

# Every level a run can meet: the low ladder, the opus and haiku ladders, the Opus run's second phase (2000-2900),
# the adaptive30 ladder (1320, 1400, 1500 ... 3100, 3190).
LEVELS = sorted({1320, 1400, 1475, 1550, 1625, 1700, 1775, 1850, 1925, 2000, 3190} | set(range(1500, 3200, 100)))
# The paper's Table 14: opponent -> (engine, weights, nodes per move, anchored Lichess Elo).
ANCHORS = {
    "sf-nodes-10":      ("stockfish", None, 10, 1978),
    "maia-2200":        ("lc0", "maia-2200.pb.gz", 1, 2037),
    "sf-nodes-100":     ("stockfish", None, 100, 2085),
    "tinygyal-8":       ("lc0", "tinygyal-8.pb.gz", 10000, 2422),
    "sf-nodes-1000":    ("stockfish", None, 1000, 2597),
    "11258-16x2-se-4":  ("lc0", "11258-16x2-se-4.pb.gz", 10000, 2689),
    "sf-nodes-3000":    ("stockfish", None, 3000, 2838),
    "11258-24x3-se":    ("lc0", "11258-24x3-se.pb.gz", 10000, 2865),
}
ANCHOR_ELO = {k: v[3] for k, v in ANCHORS.items()}
OPENINGS = (("e2e4", "e7e5", "g1f3", "b8c6"), ("d2d4", "d7d5", "c2c4", "e7e6"))
MAX_PLIES = 600
NEAREST = 3
GRID = range(0, 4001, 5)        # flat prior over a level's Lichess rating
logging.getLogger("chess.engine").setLevel(logging.ERROR)     # lc0 prints its banner on stderr


def level_id(lvl: int) -> str:
    return f"sf-elo-{lvl}"


class Player:
    """One side of a game. A level asks the arena for each move (a fresh Stockfish per move, the arena's options and
    node limit); an anchor is one engine process for the game, searching its fixed number of nodes."""

    def __init__(self, name: str):
        self.name, self.eng = name, None
        if name in ANCHORS:
            kind, net, self.nodes, _ = ANCHORS[name]
            if kind == "stockfish":
                self.eng = chess.engine.SimpleEngine.popen_uci(A.ENGINE)
                self.eng.configure({"Hash": 64, "Threads": 1})
            else:
                self.eng = chess.engine.SimpleEngine.popen_uci([LC0, f"--weights={NETS / net}", "--threads=1"])

    def move(self, b: chess.Board) -> chess.Move:
        if self.eng is None:
            return A.engine_reply(b, "practice-" + self.name[7:])
        return self.eng.play(b, chess.engine.Limit(nodes=self.nodes), game=self).move

    def close(self) -> None:
        if self.eng is not None:
            self.eng.quit()


def play_game(job: tuple[str, str, int]) -> dict:
    white, black, opening = job
    t0, b = time.time(), chess.Board()
    for u in OPENINGS[opening]:
        b.push_uci(u)
    players = []
    try:
        players = [Player(black), Player(white)]        # indexed by chess.BLACK, chess.WHITE
        out = None
        while out is None and len(b.move_stack) < MAX_PLIES:
            b.push(players[b.turn].move(b))
            out = b.outcome(claim_draw=True)
    except chess.engine.EngineError as e:               # an engine died: no result; the game is scheduled again
        return {"white": white, "black": black, "opening": opening, "error": repr(e)}
    finally:
        for p in players:
            p.close()
    return {"white": white, "black": black, "opening": opening, "result": out.result() if out else "1/2-1/2",
            "reason": out.termination.name.lower() if out else "max_plies", "plies": len(b.move_stack),
            "secs": round(time.time() - t0, 1), "ts": int(time.time()), "moves": " ".join(m.uci() for m in b.move_stack)}


def read_games() -> list[dict]:
    return [json.loads(l) for l in GAMES.read_text().splitlines() if l.strip()] if GAMES.exists() else []


def scores(games: list[dict]) -> dict:
    """player -> opponent -> [points, games], both directions of every game."""
    out = defaultdict(lambda: defaultdict(lambda: [0.0, 0]))
    for g in games:
        s = {"1-0": 1.0, "0-1": 0.0, "1/2-1/2": 0.5}[g["result"]]
        for me, opp, pts in ((g["white"], g["black"], s), (g["black"], g["white"], 1 - s)):
            out[me][opp][0] += pts
            out[me][opp][1] += 1
    return out


def expect(r: float, opp: float) -> float:
    return 1.0 / (1.0 + 10 ** ((opp - r) / 400.0))


def posterior(vs: dict) -> dict | None:
    """A player's rating from its results against the anchors (the arena's model: Elo expectation, a draw is half a
    win and half a loss, flat prior): median and central 95% range. None before its first game against an anchor."""
    vs = {o: sn for o, sn in vs.items() if o in ANCHOR_ELO}
    if not vs:
        return None
    logp = [sum(s * math.log(expect(r, ANCHOR_ELO[o])) + (n - s) * math.log(1 - expect(r, ANCHOR_ELO[o]))
                for o, (s, n) in vs.items()) for r in GRID]
    m = max(logp)
    w = [math.exp(x - m) for x in logp]
    tot, acc, q = sum(w), 0.0, {}
    for r, x in zip(GRID, w):
        acc += x / tot
        for name, level in (("lower", 0.025), ("estimate", 0.5), ("upper", 0.975)):
            if name not in q and acc >= level:
                q[name] = r
    pts, n = (sum(x[i] for x in vs.values()) for i in (0, 1))
    # all wins or all losses: the data bound the rating on one side only
    return dict(q, games=n, points=pts, bounded=0 < pts < n)


def fit(games: list[dict]) -> dict[int, dict]:
    sc = scores(games)
    return {lvl: p for lvl in LEVELS if (p := posterior(sc.get(level_id(lvl), {})))}


def monotone(est: dict[int, dict], key: str) -> list[tuple[int, float]]:
    """(level, rating) with the ratings made non-decreasing in the level (adjacent violators pooled, weighted by
    games): a higher UCI_Elo is never the weaker opponent, so an inversion is noise."""
    blocks = [[[lvl], est[lvl][key], est[lvl]["games"]] for lvl in sorted(est)]
    i = 0
    while i < len(blocks) - 1:
        if blocks[i][1] > blocks[i + 1][1]:
            (la, ra, wa), (lb, rb, wb) = blocks[i], blocks[i + 1]
            blocks[i:i + 2] = [[la + lb, (ra * wa + rb * wb) / (wa + wb), wa + wb]]
            i = max(i - 1, 0)
        else:
            i += 1
    return [(lvl, r) for lvls, r, _ in blocks for lvl in lvls]


def convert(rating: float, curve: list[tuple[int, float]]) -> float:
    """A rating on the ladder's own scale -> Lichess: linear between the levels, the end segments extended outside."""
    k = max(1, min(len(curve) - 1, next((i for i, (lvl, _) in enumerate(curve) if lvl >= rating), len(curve) - 1)))
    (x0, y0), (x1, y1) = curve[k - 1], curve[k]
    return y0 + (rating - x0) * (y1 - y0) / (x1 - x0)


def round_jobs(games: list[dict], target: int) -> list[tuple[str, str, int]]:
    """The next games: for each level still short of the target, both colours of both openings against all the
    anchors (its first round) or against the NEAREST anchors to its current estimate."""
    sc, est, jobs = scores(games), fit(games), []
    for lvl in LEVELS:
        me = level_id(lvl)
        if sum(n for _, n in sc.get(me, {}).values()) >= target:
            continue
        opps = list(ANCHORS)
        if all(sc.get(me, {}).get(o, [0, 0])[1] >= 4 for o in ANCHORS):
            opps = sorted(ANCHORS, key=lambda o: abs(ANCHOR_ELO[o] - est[lvl]["estimate"]))[:NEAREST]
        jobs += [pair + (o,) for opp in opps for o in range(len(OPENINGS)) for pair in ((me, opp), (opp, me))]
    return jobs


def anchor_jobs(games: list[dict]) -> list[tuple[str, str, int]]:
    done = {(g["white"], g["black"], g["opening"]) for g in games}
    return [j for a in ANCHORS for b in ANCHORS if a != b for o in range(len(OPENINGS)) if (j := (a, b, o)) not in done]


def cmd_play(a) -> None:
    os.nice(19)
    OUT.mkdir(parents=True, exist_ok=True)
    rng = random.Random()
    with multiprocessing.Pool(a.jobs) as pool:
        while True:
            games = read_games()
            jobs = anchor_jobs(games) if a.anchors else round_jobs(games, a.games)
            if not jobs:
                break
            rng.shuffle(jobs)
            print(f"[{time.strftime('%H:%M:%S')}] {len(games)} games on file; this round {len(jobs)}", flush=True)
            played = 0
            for g in pool.imap_unordered(play_game, jobs[:a.limit] if a.limit else jobs):
                if "error" in g:
                    print(f"  {g['white']:>16} - {g['black']:<16} FAILED {g['error']}", flush=True)
                    continue
                played += 1
                with open(GAMES, "a") as f:
                    f.write(json.dumps(g) + "\n")
                print(f"  {g['white']:>16} - {g['black']:<16} {g['result']:<7} {g['reason']:<22} plies={g['plies']:<3} "
                      f"{g['secs']:.0f}s", flush=True)
            if a.limit or a.anchors or not played:
                break
    cmd_fit(a)


def cmd_fit(a) -> None:
    games = read_games()
    sc, est = scores(games), fit(games)
    if not est:
        print(f"no level has played an anchor yet ({len(games)} games in {GAMES})")
        return
    curve = {k: monotone(est, k) for k in ("lower", "estimate", "upper")}
    smooth = {k: dict(v) for k, v in curve.items()}
    lo, hi = min(ANCHOR_ELO.values()), max(ANCHOR_ELO.values())
    print(f"{len(games)} games. Lichess rating of each level (anchors fixed at the paper's ratings, {lo}-{hi}):")
    print(f"{'level':>6} {'games':>5} {'score':>6}   {'lichess':>7} {'95% range':>12} {'+-':>4}   "
          f"{'monotone':>8}   score vs each anchor it met (points/games, expected at the estimate)")
    for lvl, p in est.items():
        vs = sc[level_id(lvl)]
        detail = "  ".join(f"{o}:{vs[o][0]:g}/{vs[o][1]}({expect(p['estimate'], ANCHOR_ELO[o]) * vs[o][1]:.1f})"
                           for o in ANCHORS if o in vs)
        note = "" if p["bounded"] else "  ONE-SIDED (all wins or all losses)"
        note += "" if lo <= p["estimate"] <= hi else "  outside the anchors' range"
        print(f"{lvl:>6} {p['games']:>5} {p['points'] / p['games']:>6.1%}   {p['estimate']:>7} "
              f"{p['lower']:>5} - {p['upper']:<5} {(p['upper'] - p['lower']) / 2:>4.0f}   "
              f"{smooth['estimate'][lvl]:>8.0f}   {detail}{note}")
    pairs = [(x, y) for i, x in enumerate(ANCHORS) for y in list(ANCHORS)[i + 1:] if y in sc.get(x, {})]
    if pairs:
        print("anchors against each other (points/games of the first, expected from the paper's ratings):")
        for x, y in pairs:
            s, n = sc[x][y]
            print(f"  {x:>16} vs {y:<16} {s:g}/{n}  expected {expect(ANCHOR_ELO[x], ANCHOR_ELO[y]) * n:.1f}")
    SCALE.write_text(json.dumps({"games": len(games), "anchors": ANCHOR_ELO, "levels": {
        str(lvl): {"lichess": p["estimate"], "lower": p["lower"], "upper": p["upper"], "games": p["games"],
                   "monotone": round(smooth["estimate"][lvl]), "monotone_lower": round(smooth["lower"][lvl]),
                   "monotone_upper": round(smooth["upper"][lvl])} for lvl, p in est.items()}}, indent=1) + "\n")
    print(f"written: {SCALE}")


def load_scale() -> dict[str, list[tuple[int, float]]]:
    lv = json.loads(SCALE.read_text())["levels"]
    return {k: [(int(l), v[f]) for l, v in sorted(lv.items(), key=lambda x: int(x[0]))]
            for k, f in (("lower", "monotone_lower"), ("estimate", "monotone"), ("upper", "monotone_upper"))}


def cmd_convert(a) -> None:
    c = load_scale()
    first, last = c["estimate"][0][0], c["estimate"][-1][0]
    for r in a.rating:
        print(f"ladder {r:g} -> lichess {convert(r, c['estimate']):.0f}  (95% range of the scale "
              f"{convert(r, c['lower']):.0f} - {convert(r, c['upper']):.0f})"
              + ("" if first <= r <= last else "  extrapolated beyond the fitted levels"))


def cmd_rerate(a) -> None:
    lichess = dict(load_scale()["estimate"])
    gs = A.games(A.read_ledger())
    print("on the ladder's own scale:", A.rating(gs))
    print("opponents at Lichess ratings:", A.rating(gs, {c: lichess[lvl] for c, lvl in A.OPP_RATING.items()}))


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sp = sub.add_parser("play")
    sp.add_argument("--games", type=int, default=200, help="games per level")
    sp.add_argument("--jobs", type=int, default=4, help="games in parallel")
    sp.add_argument("--limit", type=int, help="play only this many games, then stop (a smoke test)")
    sp.add_argument("--anchors", action="store_true")
    sub.add_parser("fit")
    sub.add_parser("convert").add_argument("rating", type=float, nargs="+")
    sub.add_parser("rerate")
    a = p.parse_args()
    globals()["cmd_" + a.cmd](a)
    return 0


if __name__ == "__main__":
    sys.exit(main())
