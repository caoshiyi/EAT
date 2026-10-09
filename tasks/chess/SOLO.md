# Chess, one agent

You are the only agent in this run: there is no team and no supervisor. Where `tasks/chess/program.md` says
"the team", read "you"; where it speaks of iterations, there are none here: it is one continuous run.

**What counts is the score**: `elo` from `python tools/eval_chess.py`, the rating over your last 50 rated games
when the 200th rated game is played. Every rated game is played once and counts. There is no time limit and no
credit for speed: a game played carefully is worth more than three played fast.

How you go about getting better is yours to organise: notes, reviews of your own games, practice games (unrated,
unlimited), a different way of choosing or checking moves, anything within the rules of program.md.
`tasks/chess/team/` is your own notes directory (it starts empty) and, with the arena's records, it is what
survives when your context is compacted.

Environment for every shell command: `cd <this repository> && source .work/venv/bin/activate`.
`python tools/chess_arena.py status` shows where the run stands.
