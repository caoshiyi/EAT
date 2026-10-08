# Chess, one agent

You are the only agent in this run: there is no team and no supervisor. Where `tasks/chess/program.md` says
"the team", read "you"; where it speaks of iterations, there are none here: it is one continuous run.

The task is yours to organise: play the 200 rated games of `tasks/chess/program.md` against Stockfish and be
playing as well as you can by the end. How you go about learning is up to you: notes, reviews, practice games,
anything within the rules of program.md. `tasks/chess/team/` is your own notes directory (it starts empty) and
it is the one thing, besides the arena's records, that survives when your context is compacted.

Environment for every shell command: `cd <this repository> && source .work/venv/bin/activate`.
`python tools/chess_arena.py status` shows where the run stands; `python tools/eval_chess.py` shows the rating.
