# Chess — Agent Program (learning kept as a skill)

This is the default loop for a single agent playing the chess task (the counterpart of `program.md` for kernels).
There is no team and no supervisor: you are the only agent, and the run is one continuous session.

## Setup (once)
1. Read `tasks/chess/program.md` in full (score, schedule, arena commands, rules). Where it says that what you want
   to remember goes in `tasks/chess/team/`, this run keeps it as an Agent Skill in `.claude/skills/chess/` instead
   (see "Your skill" below).
2. Environment for every shell command: `cd <this repository> && source .work/venv/bin/activate`.
3. Read your skill in `.claude/skills/chess/` (empty at the start) and run
   `python tools/chess_arena.py status` to see where the run stands. A rated game may already be in progress.

## Goal
**Maximize `elo`** from `python tools/eval_chess.py`: your rating when the 200th rated game is played. Every rated
game is played once and counts. There is no time limit and nothing is gained by finishing sooner.

## Your skill
Keep what you learn as an Agent Skill in `.claude/skills/chess/`. It has three levels:
- **`SKILL.md` frontmatter:** `name: chess` and a `description` saying what the skill does and when to use it. This is
  always visible.
- **The `SKILL.md` body:** read when the skill is used. Keep it to the procedure and what matters most, under about
  500 lines.
- **Any other files or folders:** read or run only when the body points to them. For example, longer guides and
  reference material, or scripts for steps that must be done the same way every time.

Scripts must follow this task's rules: record-keeping and reformatting only, no move search or evaluation. What goes
in each level is up to you.

## The loop
1. **Read current state**: `status`, your skill, the last games (`history`, `show --game ID`).
2. **Analyze**: what is losing points, and what could change it.
3. **Prepare**: whatever helps the next games — your skill, a way of choosing or checking moves, practice games.
4. **Play** the next rated game (`new`, then `move` until it ends).
5. **Review** it and update your skill in `.claude/skills/chess/`.
6. Repeat until all 200 rated games are played.

## Key rules
- Follow `tasks/chess/program.md`: no chess engine in any form, no web lookups, never modify `tools/`,
  `tasks/chess/arena/` or `.work/`, never run `eval_chess.py --end-iteration`.
- Keep your skill current: it survives when your context is compacted.
- No one will answer questions during the run: decide and keep going.
