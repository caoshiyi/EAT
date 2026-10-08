# Chess: learn to play better over 200 rated games

The team plays one stream of **200 rated games** against Stockfish and tries to be playing as well as it can by
the end. Agents choose every move themselves. This mirrors a public continuous-learning benchmark in which a
single agent, left to itself over the same 200 games, did not improve.

## Score
`elo` from `python tools/eval_chess.py`: the rating over the **last 50 rated games** against the two limited
opponents (Elo model; skill-0 counts as 1320, the 1800 setting as 1800). Games against full-strength Stockfish
are part of the schedule and recorded, but carry no rating. Every rated game counts once and cannot be replayed.

## Schedule
Fixed, in pairs, the first of each pair as White and the second as Black:
`full-strength, full-strength, skill-0, skill-0, elo-1800-setting, elo-1800-setting`, repeated. Rated games are
played one at a time. How many of them a team plays before the supervisor looks again is the supervisor's
choice, stated in each agent's prompt; a rated game left unfinished is continued by the next team.

## The arena
All play goes through `tools/chess_arena.py` (it runs the opponent, checks and records every move):
```
python tools/chess_arena.py status                 where the run stands, active games, rating
python tools/chess_arena.py new                    start the next rated game
python tools/chess_arena.py move Nf3               your move (SAN, or UCI like g1f3); prints the reply and board
python tools/chess_arena.py show [--game ID]       board, FEN and moves of any game, finished or not
python tools/chess_arena.py legal [--game ID]      legal moves in the position
python tools/chess_arena.py resign [--game ID]
python tools/chess_arena.py history                every finished game
python tools/chess_arena.py practice --opponent skill-0 --color white     an unrated game (ids p1, p2, ...)
```
Practice games are unlimited, unrated, against any of the three opponents, and several may run at once (pass
`--game ID`). An illegal move is refused and recorded; the game continues.

## Rules
- **No chess engine, in any form.** No Stockfish or other engine, no tablebase or opening database, and no code
  that searches or evaluates chess positions, whether installed or written here. Every move comes from an agent's
  own reasoning. The arena's own commands (including `legal`) are allowed, and so are scripts that only keep
  records or reformat them.
- No web access for chess content.
- Never modify `tools/`, `tasks/chess/arena/`, or the engine under `.work/`; never run `eval_chess.py --end-iteration`.
- Whatever the team wants to remember (notes, opening choices, reviews of lost games, checklists) goes in
  `tasks/chess/team/`, in any form the team chooses. It is committed after every iteration and is the only thing,
  besides the arena's records, that the next team inherits.
