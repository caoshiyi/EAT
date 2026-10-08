## Hard Requirements (MUST be in every agent's prompt)
1. The task is `tasks/chess`: play a stream of 200 rated chess games against Stockfish and improve along the way. Every agent must read `tasks/chess/program.md` in full before working.
2. Score = `elo` from `python tools/eval_chess.py` (rating over the last 50 rated games against the two limited opponents). Each rated game is played once and counts; this iteration may play up to 12 more rated games.
3. No chess engine in any form: no Stockfish or other engine, no tablebase or opening database, no code that searches or evaluates positions, no web lookups. Every move comes from an agent's own reasoning. Allowed: the arena's commands (including `legal`), the team's own files, record-keeping scripts.
4. All play goes through `python tools/chess_arena.py` (see program.md). Do NOT modify `tools/`, `tasks/chess/arena/` or `.work/`, and never run `eval_chess.py --close-block`. Do not push to any git remote.
5. Environment for every shell command: `cd $EAT_ROOT && source $EAT_VENV/bin/activate`.

## Shared Environment
All agents run in the SAME working directory (`$EAT_ROOT`) and share one arena.

### Board ownership (MUST be in every agent's prompt)
- Rated games are played one at a time. Tell each agent whether it may submit moves in rated games, and for how many games; at most one agent may be on move in the rated game at any moment. If several agents share a rated game (for example one proposes and one checks), say exactly who calls `move`.
- Practice games are free: an agent that starts one owns its id (`p1`, `p2`, ...) and passes `--game ID` on every command.
- A rated game still unfinished when the team stops is continued by the next team; say in the prompt whether one is in progress (`chess_arena.py status`).

### What the team keeps (MUST be in every agent's prompt)
- The team's memory is `tasks/chess/team/` (free form). Tell each agent which files it reads first, which it owns (may create or edit) and which it must not touch.
- The arena's records (`chess_arena.py history`, `show --game ID`) hold every past game in full and may always be read.
