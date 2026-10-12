# Chess: learn to play better over 200 rated games

The team plays one stream of **200 rated games** against Stockfish and tries to be playing as well as it can by
the end. Agents choose every move themselves. This mirrors a public continuous-learning benchmark in which a
single agent, left to itself over the same 200 games, did not improve.

## Score
`elo` from `python tools/eval_chess.py`: the rating over the **last 50 rated games** (Elo model, each opponent counted
at its Stockfish Elo setting). Every rated game counts once and cannot be replayed.

## Opponents
Every rated game is against Stockfish set to one of 20 strength levels between Elo 1320 and 3190. **The arena picks
the level when the game starts: a level close to your current rating** (the rating over your last 16 rated games;
about one game in seven is against a level drawn from the whole range instead). So the opponents get stronger as you
do, and weaker when you lose. You cannot choose or avoid an opponent in a rated game, and **the level of a game is not
shown**, before or after it (the arena shows "stockfish (level hidden)"). The rating counts every opponent at its
level, so a win against a stronger opponent raises it more and a loss to a weaker one lowers it more. You are White
in odd-numbered games and Black in even ones. Rated games are played one at a time. How many of them a team plays
before the supervisor looks again is the supervisor's choice, stated in each agent's prompt; a rated game left
unfinished is continued by the next team.

## The game clock
Each rated game gives your side **30 minutes of thinking time in total**, with nothing added per move.
- The clock runs whenever it is your move: from the moment the opponent's reply is recorded until your next `move` is
  recorded. Everything the team does in that time counts (reasoning, discussion between agents, checks, scripts).
  The opponent replies at once and uses none of it.
- **When the 30 minutes are used up, the game is lost** (`time_forfeit`). A game of 60 of your own moves leaves 30
  seconds a move on average; how to spend the time is yours to decide.
- `new`, `move`, `show` and `status` print the time left.
- The clock is stopped while no team is running (after a team ends or is stopped, while the supervisor works, during
  a pause of the run) and starts again the moment the next team starts, also in a game left unfinished.
- Time between rated games is free: reviews, notes and practice games cost no clock time. Practice games have no clock.

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
python tools/chess_arena.py practice --opponent 1700 --color white        an unrated game (ids p1, p2, ...)
```
Practice games are unlimited, unrated, against Stockfish at any Elo level you name (1320 to 3190, e.g.
`--opponent 1700`), and several may run at once (pass `--game ID`). An illegal move is refused and recorded; the game
continues.

## Rules
- **No chess engine, in any form.** No Stockfish or other engine, no tablebase or opening database, and no code
  that searches or evaluates chess positions, whether installed or written here. Every move comes from an agent's
  own reasoning. The arena's own commands (including `legal`) are allowed, and so are scripts that only keep
  records or reformat them.
- **Where the line is for your own code.** Allowed: showing a position in another form, listing what stands on a
  square, line or diagonal, listing which pieces attack or defend a square, bookkeeping (clock, checklists, logs).
  Not allowed: code that generates or enumerates moves or replies, tests a move for legality, check, mate or
  repetition, counts or scores material or positions, or chooses between moves. The arena's `legal` is the only
  source of legal moves. A chess library (python-chess or another) may be used only to replay **finished** games
  for review, never on a game in progress.
- No web access for chess content.
- Never modify `tools/`, `tasks/chess/arena/`, or the engine under `.work/`; never run `eval_chess.py --end-iteration`.
  Do not read `.work/` or the arena's ledger to work out the hidden levels.
- No one will answer questions during the run: never stop to ask for permission or a decision; decide and continue.
- Whatever the team wants to remember (notes, opening choices, reviews of lost games, checklists) goes in
  `tasks/chess/team/`, in any form the team chooses. It is committed after every iteration and is the only thing,
  besides the arena's records, that the next team inherits.
