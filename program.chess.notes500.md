# Chess — Agent Program

This is the default loop for a single agent playing the chess task (the counterpart of `program.md` for kernels).
There is no team and no supervisor: you are the only agent, and the run is one continuous session.

## Setup (once)
1. Read `tasks/chess/program.md` in full (score, schedule, arena commands, rules).
2. Environment for every shell command: `cd <this repository> && source .work/venv/bin/activate`.
3. Read `tasks/chess/team/notes.md` (your notes; empty at the start) and the files it points to, and run
   `python tools/chess_arena.py status` to see where the run stands. A rated game may already be in progress.

## Goal
**Maximize `elo`** from `python tools/eval_chess.py`: your rating when the 200th rated game is played. Every rated
game is played once and counts. There is no time limit and nothing is gained by finishing sooner.

## The loop
1. **Read current state**: `status`, your notes, the last games (`history`, `show --game ID`).
2. **Analyze**: what is losing points, and what could change it.
3. **Prepare**: whatever helps the next games — notes, a way of choosing or checking moves, practice games.
4. **Play** the next rated game (`new`, then `move` until it ends).
5. **Review** it and update your notes in `tasks/chess/team/`.
6. Repeat until all 200 rated games are played.

## Key rules
- Follow `tasks/chess/program.md`: no chess engine in any form, no web lookups, never modify `tools/`,
  `tasks/chess/arena/` or `.work/`, never run `eval_chess.py --end-iteration`.
- Keep your notes current: they survive when your context is compacted.
- The only rule for your notes: `tasks/chess/team/notes.md` stays under 500 lines. Put anything longer in other files
  in `tasks/chess/team/` and link to them from `notes.md`, so it does not become one very long file.
- No one will answer questions during the run: decide and keep going.
