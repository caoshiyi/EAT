#!/usr/bin/env python3
"""Official score of the chess task: the rating over the last 50 rated games in the arena's ledger (prints `elo = N`).

    python tools/eval_chess.py                  report only
    python tools/eval_chess.py --close-block    the harness, after a team finishes: report, then allow the next
                                                CHESS_BLOCK rated games (agents never pass this flag)
"""
import fcntl
import sys
from collections import defaultdict

import chess_arena as A


def main() -> int:
    A.ARENA.mkdir(parents=True, exist_ok=True)
    with open(A.ARENA / ".lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        events = A.read_ledger()
        gs = A.games(events)
        rated = A.rated(gs)
        done = [g for g in rated if g["end"]]
        closed = A.blocks_closed(events)
        first = A.BLOCK * closed + 1
        block = [g for g in done if int(g["id"]) >= first]
        print(f"rated games finished: {len(done)} of {A.TOTAL}   (iteration block {closed + 1}: games {first}-"
              f"{min(A.TOTAL, first + A.BLOCK - 1)}, {len(block)} finished)")
        for g in block:
            print(f"  game {g['id']:>3} vs {g['opponent']:<17} as {g['color']:<5} {g['end']['result']:<7} "
                  f"{g['end']['reason']:<22} plies={len(g['moves'])} illegal={g['illegal']}")
        live = [g for g in rated if not g["end"]]
        if live:
            print(f"  game {live[0]['id']} is unfinished ({len(live[0]['moves'])} plies): the next team continues it")
        by = defaultdict(lambda: [0.0, 0])
        for g in done:
            by[g["opponent"]][0] += g["end"]["score"]
            by[g["opponent"]][1] += 1
        print("score by opponent (all games so far; win 1, draw 0.5): " +
              ", ".join(f"{o} {by[o][0]:g}/{by[o][1]}" for o in A.ORDER if by[o][1]))
        practice = [g for g in gs.values() if g["kind"] == "practice"]
        print(f"practice games: {len(practice)} started, {sum(len(g['moves']) for g in practice)} plies; "
              f"illegal moves in rated games: {sum(g['illegal'] for g in rated)}")
        r = A.rating(gs)
        print(f"rating over the last {r['window']} rated-opponent games: {r['estimate']} "
              f"(95% range {r['lower']} to {r['upper']}); full-strength games are not rated")
        print("a 12-game block moves this number by chance alone: read the range, not the point")
        print(f"elo = {r['estimate']}")
        if "--close-block" in sys.argv[1:]:
            A.append(events, ev="block_close", n=closed + 1, rated_finished=len(done))
    return 0


if __name__ == "__main__":
    sys.exit(main())
