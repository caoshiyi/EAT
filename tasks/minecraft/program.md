# Minecraft: defeat the Ender Dragon

The objective is to defeat the Ender Dragon, starting from the spawn of the shared Minecraft survival world. This is
the only criterion. Any means of meeting it within the rules of survival mode is permitted, and the team decides how
to share the work.

## Score
`python tools/eval_minecraft.py` reads the world itself (advancements and statistics), never anyone's report:
`dragon = 1` when the Ender Dragon is defeated, and `milestones` = how many of the 12 steps from bare hands to the
dragon any player has reached, with when and by whom.

## The world
- Minecraft Java Edition 1.20.4, survival, Easy difficulty, a random world. No cheats and no operators.
- Four players, `p1` to `p4`, the team's bodies. They are fixed: there are always exactly four, no more can join.
  Each keeps its position, health, inventory and equipment from one iteration to the next. A player who dies
  respawns; what it carried stays where it died for a few minutes.
- The world is saved and the server stopped when a team ends, and it continues from exactly that state when the
  next team starts. Nothing happens in the world in between.

## Playing
A player acts only through programs: you write a short JavaScript program, the player's Mineflayer bot runs it in
the world, and you read the text that comes back. No pixels, keyboard or mouse.
```
python tools/mc_arena.py status                              every player: position, health, inventory, who controls it
python tools/mc_arena.py run --player p1 [--timeout 60] FILE  run a program as p1 (FILE, or - for stdin)
python tools/mc_arena.py chat [--since N] [--last N]         the game's chat
python tools/mc_arena.py say --player p1 TEXT                say something in the chat as p1
python tools/mc_arena.py events [--type T] [--last N]        deaths, advancements, joins, restarts
python tools/mc_arena.py programs [--player p1] [--last N] [--full]   every program run so far, with its output
```
A program is the body of an async function that receives `bot` (with the pathfinder plugin loaded; `Movements` and
`goals` are available). It may load Node's built-in modules and the installed Mineflayer packages, but cannot start
processes, open network connections or touch files; values it stores on `global` persist between programs. It runs
until it returns or its timeout (60 s unless you choose another), and prints what it logged and returned, the
player's state, and the chat since that player's last program. Mineflayer's documentation is in
`tools/mc_arena/node_modules/mineflayer/docs/`.

## Rules
- One agent controls one player: the first program an agent runs on a player makes it that agent's player for the
  rest of the iteration, and the arena refuses anyone else. Agents that do not play may read everything.
- Survival rules only: no server commands (a chat message starting with `/` is refused), no access to the server,
  its files, its console or `.work/`.
- Never modify `tools/` or the server.
- Whatever the team wants to keep besides the world itself (coordinates, lessons, tools, plans) goes in
  `tasks/minecraft/team/`, in any form the team chooses. It is committed after every iteration and is, with the
  world and the arena's records, all the next team inherits.
