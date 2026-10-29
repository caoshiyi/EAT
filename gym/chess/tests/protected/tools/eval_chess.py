#!/usr/bin/env python3
"""Official score of the chess task: the rating over the last 50 rated games in the arena's ledger (prints `elo = N`).

    python tools/eval_chess.py                  report only
    python tools/eval_chess.py --end-iteration  the launcher, after a team finishes: report, then record that the
                                                iteration ended here (agents never pass this flag)
    python tools/eval_chess.py --done           exit 0 when all rated games are played (the launcher's STOP_CMD)
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
        if "--done" in sys.argv[1:]:
            return 0 if len(done) >= A.TOTAL else 1
        ends = A.iteration_ends(events)
        first = (ends[-1] if ends else 0) + 1
        block = [g for g in done if int(g["id"]) >= first]
        print(f"rated games finished: {len(done)} of {A.TOTAL}, {A.TOTAL - len(done)} remain   "
              f"(iteration {len(ends) + 1}: {len(block)} finished" + (f", games {first}-{len(done)})" if block else ")"))
        for g in block:
            print(f"  game {g['id']:>3} vs {A.shown(g['opponent']):<24} as {g['color']:<5} {g['end']['result']:<7} "
                  f"{g['end']['reason']:<22} plies={len(g['moves'])} illegal={g['illegal']}")
        live = [g for g in rated if not g["end"]]
        if live:
            print(f"  game {live[0]['id']} is unfinished ({len(live[0]['moves'])} plies): the next team continues it")
        by = defaultdict(lambda: [0.0, 0])
        for g in done:
            by[g["opponent"]][0] += g["end"]["score"]
            by[g["opponent"]][1] += 1
        if A.RUN and not A.SHOW_LEVELS:   # the ladder's levels stay hidden from the agents and the supervisor
            print(f"score (all rated games so far; win 1, draw 0.5): {sum(v[0] for v in by.values()):g}/{len(done)}")
        else:
            print("score by opponent (all games so far; win 1, draw 0.5): " +
                  ", ".join(f"{A.shown(o)} {by[o][0]:g}/{by[o][1]}" for o in A.ORDER if by[o][1]))
        practice = [g for g in gs.values() if g["kind"] == "practice"]
        print(f"practice games: {len(practice)} started, {sum(len(g['moves']) for g in practice)} plies; "
              f"illegal moves in rated games: {sum(g['illegal'] for g in rated)}")
        r = A.rating(gs)
        print(f"rating over the last {r['window']} rated-opponent games: {r['estimate']} "
              f"(95% range {r['lower']} to {r['upper']})" + ("" if A.RUN else "; full-strength games are not rated"))
        print("a few games move this number by chance alone: read the range, not the point")
        print(f"elo = {r['estimate']}")
        if "--end-iteration" in sys.argv[1:]:
            A.append(events, ev="iter_end", n=len(ends) + 1, rated_finished=len(done))
    return 0


if __name__ == "__main__":
    sys.exit(main())
