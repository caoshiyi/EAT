#!/usr/bin/env python3
"""The chess task's board. The arena owns every game: it runs the opponent (Stockfish), checks and records each
move in an append-only, hash-chained ledger, and computes the rating. Agents only submit moves.

Rated games are one stream of TOTAL games on a fixed schedule (the benchmark this task mirrors: pairs of
full-strength, skill-0, elo-1800-setting, each as White then Black), played one at a time. Each supervisor
iteration may play BLOCK more of them (tools/eval_chess.py closes a block after the team finishes). Practice
games are unrated, unlimited, and may run in parallel.

    chess_arena.py status                         where the run stands, the active games, the rating
    chess_arena.py new                            start the next rated game
    chess_arena.py practice --opponent ID --color white|black     start an unrated game
    chess_arena.py move MOVE [--game ID]          MOVE in SAN (Nf3) or UCI (g1f3); the opponent replies
    chess_arena.py resign [--game ID]
    chess_arena.py show [--game ID]               board, FEN and moves of a game (active or finished)
    chess_arena.py legal [--game ID]              legal moves in the position (off with CHESS_ALLOW_LEGAL=0)
    chess_arena.py history                        every finished game: opponent, colour, result
    chess_arena.py rating

Environment: CHESS_ARENA_DIR (ledger; default tasks/chess/arena), CHESS_ENGINE (the Stockfish binary),
CHESS_BLOCK (rated games per iteration, 12), CHESS_NODES (opponent search limit per move, 200000).
"""
import argparse
import fcntl
import hashlib
import json
import os
import sys
import time
from pathlib import Path

import chess
import chess.engine

ROOT = Path(__file__).resolve().parent.parent
ARENA = Path(os.environ.get("CHESS_ARENA_DIR", ROOT / "tasks" / "chess" / "arena"))
LEDGER = ARENA / "ledger.jsonl"
ENGINE = os.environ.get("CHESS_ENGINE", str(ROOT / ".work" / "engine" / "usr" / "games" / "stockfish"))
TOTAL = 200
BLOCK = int(os.environ.get("CHESS_BLOCK", "12"))
NODES = int(os.environ.get("CHESS_NODES", "200000"))
ALLOW_LEGAL = os.environ.get("CHESS_ALLOW_LEGAL", "1") != "0"

# The opponents, with the options the mirrored benchmark's data file records for them.
OPPONENTS = {
    "full-strength": {"Hash": 64, "Threads": 1, "Skill Level": 20, "UCI_LimitStrength": False},
    "skill-0": {"Hash": 64, "Threads": 1, "Skill Level": 0, "UCI_LimitStrength": False},
    "elo-1800-setting": {"Hash": 64, "Threads": 1, "UCI_LimitStrength": True, "UCI_Elo": 1800},
}
ORDER = ("full-strength", "skill-0", "elo-1800-setting")
# Rated = the two limited opponents, at Stockfish's own nominal numbers (skill 0 is the bottom of its UCI_Elo
# range, 1320). Full-strength games are played and recorded but carry no rating information.
OPP_RATING = {"skill-0": 1320, "elo-1800-setting": 1800}
WINDOW = 50
GRID = range(-150, 3151, 5)     # flat prior; its 95% range is the benchmark's (-70, 3070) at 1500


class Refused(Exception):
    pass


def schedule(n: int) -> tuple[str, str]:
    """Opponent and the agent's colour in rated game n (1-based)."""
    return ORDER[((n - 1) // 2) % len(ORDER)], "white" if n % 2 else "black"


def read_ledger() -> list[dict]:
    if not LEDGER.exists():
        return []
    events, prev = [], ""
    for line in LEDGER.read_text().splitlines():
        e = json.loads(line)
        body = {k: v for k, v in e.items() if k != "hash"}
        if e["prev"] != prev or e["hash"] != _digest(body):
            raise Refused(f"ledger broken at seq {e.get('seq')}: the chain does not verify")
        prev = e["hash"]
        events.append(e)
    return events


def _digest(body: dict) -> str:
    return hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()


def append(events: list[dict], **fields) -> dict:
    body = {"seq": len(events) + 1, "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "prev": events[-1]["hash"] if events else "", **fields}
    e = dict(body, hash=_digest(body))
    with LEDGER.open("a") as f:
        f.write(json.dumps(e) + "\n")
    events.append(e)
    return e


def games(events: list[dict]) -> dict[str, dict]:
    """Every game rebuilt from the ledger: id -> {kind, opponent, color, moves, illegal, end}."""
    out: dict[str, dict] = {}
    for e in events:
        if e["ev"] == "start":
            out[e["game"]] = {"id": e["game"], "kind": e["kind"], "opponent": e["opponent"], "color": e["color"],
                              "moves": [], "illegal": 0, "end": None, "started": e["ts"]}
        elif e["ev"] == "move":
            out[e["game"]]["moves"].append(e["uci"])
        elif e["ev"] == "illegal":
            out[e["game"]]["illegal"] += 1
        elif e["ev"] == "end":
            out[e["game"]]["end"] = {k: e[k] for k in ("result", "reason", "score", "ts")}
    return out


def board_of(g: dict) -> chess.Board:
    b = chess.Board()
    for u in g["moves"]:
        b.push_uci(u)
    return b


def rated(gs: dict) -> list[dict]:
    return sorted((g for g in gs.values() if g["kind"] == "rated"), key=lambda g: int(g["id"]))


def blocks_closed(events: list[dict]) -> int:
    return sum(e["ev"] == "block_close" for e in events)


def rating(gs: dict) -> dict:
    """Posterior over the agent's rating from its last WINDOW rated-opponent games (Elo model, flat prior):
    the median and the central 95% range, rounded to 10."""
    done = [g for g in rated(gs) if g["end"] and g["opponent"] in OPP_RATING]
    window = done[-WINDOW:]
    logp = []
    import math
    for r in GRID:
        lp = 0.0
        for g in window:
            e = 1.0 / (1.0 + 10 ** ((OPP_RATING[g["opponent"]] - r) / 400.0))
            s = g["end"]["score"]
            lp += s * math.log(e) + (1 - s) * math.log(1 - e)
        logp.append(lp)
    m = max(logp)
    w = [math.exp(x - m) for x in logp]
    tot, acc, q = sum(w), 0.0, {}
    for r, x in zip(GRID, w):
        acc += x / tot
        for name, level in (("lower", 0.025), ("estimate", 0.5), ("upper", 0.975)):
            if name not in q and acc >= level:
                q[name] = int(round(r / 10.0) * 10)
    return dict(q, window=len(window), rated_games_total=len(done))


def engine_reply(b: chess.Board, opponent: str) -> chess.Move:
    eng = chess.engine.SimpleEngine.popen_uci(ENGINE)
    try:
        eng.configure(OPPONENTS[opponent])
        return eng.play(b, chess.engine.Limit(nodes=NODES)).move
    finally:
        eng.quit()


def finish_if_over(events, g, b) -> bool:
    out = b.outcome(claim_draw=True)
    if out is None:
        return False
    agent_white = g["color"] == "white"
    score = 0.5 if out.winner is None else float(out.winner == agent_white)
    append(events, ev="end", game=g["id"], result=out.result(), reason=out.termination.name.lower(), score=score)
    return True


def engine_turn(events, g, b) -> None:
    mv = engine_reply(b, g["opponent"])
    san = b.san(mv)
    b.push(mv)
    append(events, ev="move", game=g["id"], ply=len(b.move_stack), by="engine", uci=mv.uci(), san=san)
    g["moves"].append(mv.uci())
    finish_if_over(events, g, b)


def pick(gs: dict, gid: str | None, active_only: bool = True) -> dict:
    if gid:
        if gid not in gs:
            raise Refused(f"no game {gid!r}")
        g = gs[gid]
        if active_only and g["end"]:
            raise Refused(f"game {gid} is over ({g['end']['result']}, {g['end']['reason']})")
        return g
    live = [g for g in gs.values() if not g["end"]]
    if len(live) != 1:
        raise Refused("no active game; start one with `new` or `practice`" if not live else
                      "several games are active (" + ", ".join(g["id"] for g in live) + "): pass --game ID")
    return live[0]


def render(g: dict) -> str:
    b = board_of(g)
    sans, t = [], chess.Board()
    for u in g["moves"]:
        m = chess.Move.from_uci(u)
        sans.append(t.san(m))
        t.push(m)
    pgn = " ".join((f"{i // 2 + 1}. " if i % 2 == 0 else "") + s for i, s in enumerate(sans))
    lines = [f"game {g['id']} ({g['kind']}) vs {g['opponent']} -- you are {g['color']}",
             str(b if g["color"] == "white" else b.transform(chess.flip_vertical).transform(chess.flip_horizontal)),
             f"(board shown from your side; lowercase = black)   FEN: {b.fen()}",
             f"moves: {pgn or '(none)'}"]
    if g["end"]:
        lines.append(f"over: {g['end']['result']} by {g['end']['reason']} -- your score {g['end']['score']}")
    else:
        lines.append(f"to move: {'white' if b.turn else 'black'}" + (" (you)" if (b.turn == chess.WHITE) == (g["color"] == "white") else ""))
    return "\n".join(lines)


def cmd_new(events, gs, a):
    r = rated(gs)
    if any(not g["end"] for g in r):
        raise Refused(f"rated game {[g['id'] for g in r if not g['end']][0]} is still in progress; finish it first")
    n = len(r) + 1
    allowed = min(TOTAL, BLOCK * (blocks_closed(events) + 1))
    if n > TOTAL:
        raise Refused(f"all {TOTAL} rated games are played")
    if n > allowed:
        raise Refused(f"this iteration's rated games are used up ({allowed} of {TOTAL} played); practice games stay open")
    opp, color = schedule(n)
    append(events, ev="start", game=str(n), kind="rated", opponent=opp, color=color)
    g = {"id": str(n), "kind": "rated", "opponent": opp, "color": color, "moves": [], "illegal": 0, "end": None}
    if color == "black":
        engine_turn(events, g, chess.Board())
    print(render(g))


def cmd_practice(events, gs, a):
    if a.opponent not in OPPONENTS:
        raise Refused(f"opponent must be one of {', '.join(OPPONENTS)}")
    gid = "p" + str(sum(g["kind"] == "practice" for g in gs.values()) + 1)
    append(events, ev="start", game=gid, kind="practice", opponent=a.opponent, color=a.color)
    g = {"id": gid, "kind": "practice", "opponent": a.opponent, "color": a.color, "moves": [], "illegal": 0, "end": None}
    if a.color == "black":
        engine_turn(events, g, chess.Board())
    print(render(g))


def cmd_move(events, gs, a):
    g = pick(gs, a.game)
    b = board_of(g)
    if (b.turn == chess.WHITE) != (g["color"] == "white"):
        engine_turn(events, g, b)            # a reply lost to an interrupted call: play it, then ask again
        print(render(g))
        raise Refused("the opponent's reply was pending and has now been played; send your move again")
    try:
        try:
            mv = b.parse_san(a.move)
        except ValueError:
            mv = b.parse_uci(a.move.lower())
    except ValueError:
        append(events, ev="illegal", game=g["id"], text=a.move[:20], fen=b.fen())
        raise Refused(f"illegal or unreadable move {a.move!r} in this position (recorded); the game continues")
    san = b.san(mv)
    b.push(mv)
    append(events, ev="move", game=g["id"], ply=len(b.move_stack), by="agent", uci=mv.uci(), san=san)
    g["moves"].append(mv.uci())
    if not finish_if_over(events, g, b):
        engine_turn(events, g, b)
    print(render(games(events)[g["id"]]))


def cmd_resign(events, gs, a):
    g = pick(gs, a.game)
    append(events, ev="end", game=g["id"], result="0-1" if g["color"] == "white" else "1-0", reason="resignation", score=0.0)
    print(render(games(events)[g["id"]]))


def cmd_show(events, gs, a):
    print(render(pick(gs, a.game, active_only=False)))


def cmd_legal(events, gs, a):
    if not ALLOW_LEGAL:
        raise Refused("the legal-move list is off in this run")
    b = board_of(pick(gs, a.game))
    print(" ".join(sorted(b.san(m) for m in b.legal_moves)))


def cmd_history(events, gs, a):
    for g in gs.values():
        if g["end"]:
            print(f"{g['id']:>4}  {g['kind']:<8} {g['opponent']:<17} {g['color']:<5} {g['end']['result']:<7} "
                  f"{g['end']['reason']:<22} plies={len(g['moves'])} illegal={g['illegal']}")


def cmd_rating(events, gs, a):
    print(json.dumps(rating(gs)))


def cmd_status(events, gs, a):
    r = rated(gs)
    done = [g for g in r if g["end"]]
    allowed = min(TOTAL, BLOCK * (blocks_closed(events) + 1))
    print(f"rated games: {len(done)} finished of {TOTAL}; this iteration may play up to game {allowed}")
    if len(r) < TOTAL:
        opp, color = schedule(len(r) + 1) if len(done) == len(r) else (r[-1]["opponent"], r[-1]["color"])
        print(("next" if len(done) == len(r) else "in progress") + f": game {len(done) + 1} vs {opp} as {color}")
    live = [g for g in gs.values() if not g["end"]]
    print("active: " + (", ".join(f"{g['id']} ({g['kind']}, {g['opponent']})" for g in live) or "none"))
    print("rating: " + json.dumps(rating(gs)))


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("status", "new", "history", "rating"):
        sub.add_parser(name)
    sp = sub.add_parser("practice")
    sp.add_argument("--opponent", required=True)
    sp.add_argument("--color", choices=("white", "black"), required=True)
    sp = sub.add_parser("move")
    sp.add_argument("move")
    sp.add_argument("--game")
    for name in ("resign", "show", "legal"):
        sub.add_parser(name).add_argument("--game")
    a = p.parse_args()
    ARENA.mkdir(parents=True, exist_ok=True)
    with open(ARENA / ".lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            events = read_ledger()
            globals()["cmd_" + a.cmd](events, games(events), a)
        except Refused as e:
            print(f"REFUSED: {e}", file=sys.stderr)
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
