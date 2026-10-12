## Hard Requirements (MUST be in every agent's prompt)
1. The task is `tasks/chess`: play a stream of 200 rated chess games against Stockfish and improve along the way. Every agent must read `tasks/chess/program.md` in full before working.
2. Score = `elo` from `python tools/eval_chess.py` (rating over the last 50 rated games, each opponent counted at its level). Each rated game is played once and counts. State in the prompt how many rated games this agent (and this team in total) plays in this iteration, and that it must not start more.
3. No chess engine in any form: no Stockfish or other engine, no tablebase or opening database, no code that searches or evaluates positions, no web lookups. Every move comes from an agent's own reasoning. Allowed: the arena's commands (including `legal`), the team's own files, record-keeping scripts. The team's own code may reformat a position and list what stands on or attacks a square; it must not generate or enumerate moves, test legality, check, mate or repetition, score anything or choose a move, and a chess library (python-chess) may only replay finished games.
4. Every rated game is against Stockfish at a level (20 levels, Elo 1320 to 3190) that the arena picks close to the team's current rating when the game starts; the level is shown but cannot be chosen. Every game is played out: the rating rises only by scoring against opponents at or above the team's level; no game is resigned because of the opponent's level or to save time, only when the position on the board is lost. All play goes through `python tools/chess_arena.py` (see program.md); do not read `.work/` or the arena's ledger. Do NOT modify `tools/`, `tasks/chess/arena/` or `.work/`, and never run `eval_chess.py --end-iteration`. Do not push to any git remote.
5. Environment for every shell command: `cd $EAT_ROOT && source $EAT_VENV/bin/activate`.
6. No one will answer questions during the run: never stop to ask for permission or a decision; decide and continue.
7. The game clock: each rated game gives the team 30 minutes of its own thinking time in total; the clock runs whenever it is the team's move (everything the agents do then counts) and the game is lost when it runs out. `show`, `status` and every `move` print the time left. State this in the prompt of every agent that plays, checks or advises in a rated game, with who watches the clock.

## The settings of this run (for the supervisor; nothing here is hidden from you)
- **Opponents.** The arena pairs every rated game automatically: a Stockfish level near the team's rating over its last 16 rated games (levels 1320 to 3190 in steps of about 100; about one game in seven comes from the whole range). The opponents therefore follow the team up and down; nobody chooses them. Their levels are shown, to you and to the team: in `history`, during each game, and as a score per level in `python tools/eval_chess.py` (also in the team output you receive). Use it to see where the team stops winning. The rating counts each opponent at its level, so only playing better raises it; a team that gives up games against strong opponents throws away the only games that can raise it. The team is White in odd-numbered rated games.
- **Game clock.** 30 minutes of the team's own time per rated game, no increment; out of time = the game is lost (shown as `time_forfeit` in `history`). It runs only while the team is on move. It is stopped when a team ends and while you work, and starts again when the next team starts, so a game left unfinished costs the next team clock time from its first second (reading its prompt and notes included).
- **Team time limit.** A team is stopped 2 hours after it starts: agents still running are ended, a rated game in progress stays unfinished and the next team continues it. Plan the number of games and the agents' work to fit.
- **No practice games.** Every game is a rated game; the arena refuses `practice`. The team learns from its rated games (`history`, `show --game ID`).

## How many rated games per iteration (the supervisor's decision)
There is no fixed number. The 200 rated games are a second budget next to the dollars: each iteration you decide how many of the remaining games this team plays before you look again, and you write that number into the prompts. A team that plays many games gives you more evidence per look but spends games on a team you can no longer change; a team that plays few lets you change it sooner on thinner evidence. The run ends when all 200 are played. The arena does not enforce your number; the prompts do.

## Shared Environment
All agents run in the SAME working directory (`$EAT_ROOT`) and share one arena.

### Board ownership (MUST be in every agent's prompt)
- Rated games are played one at a time. Tell each agent whether it may submit moves in rated games, and for how many games; at most one agent may be on move in the rated game at any moment. If several agents share a rated game (for example one proposes and one checks), say exactly who calls `move`.
- A rated game still unfinished when the team stops is continued by the next team; say in the prompt whether one is in progress (`chess_arena.py status`).

### What the team keeps (MUST be in every agent's prompt)
- The team's memory is `tasks/chess/team/` (free form). Tell each agent which files it reads first, which it owns (may create or edit) and which it must not touch.
- The arena's records (`chess_arena.py history`, `show --game ID`) hold every past game in full and may always be read.
