## Hard Requirements (MUST be in every agent's prompt)
1. The task is `tasks/minecraft`: defeat the Ender Dragon in a shared Minecraft survival world. Every agent must read `tasks/minecraft/program.md` in full before working.
2. Score = `python tools/eval_minecraft.py`, read from the world: `dragon` (0/1) and `milestones` (of 12 steps). Agents' reports are not the score.
3. The world has exactly four players, `p1` to `p4`; no more can be added. Each agent that plays controls one player, named in its prompt, and only that one (the arena enforces it: the first program an agent runs on a player claims it for the iteration). Agents that do not play must not run programs.
4. Survival rules only: no server commands, no access to the server, its console, its files or `.work/`. All play goes through `python tools/mc_arena.py`. Do NOT modify `tools/` or the server. Do not push to any git remote.
5. Environment for every shell command: `cd $EAT_ROOT`.
6. No one will answer questions during the run: never stop to ask for permission or a decision; decide and continue.

## The settings of this run (for the supervisor; nothing here is hidden from you)
- **Bodies persist, agents do not.** The four players and everything they carry or built stay in the world across iterations; the agents of each team are new and know only their prompt, `tasks/minecraft/team/`, the world and the arena's records.
- **Between iterations the world is stopped** (saved, server off) and continues from the same state when the next team starts.
- **Team time limit.** A team is stopped when its time limit is reached: agents still running are ended, programs running are stopped, and the players stay where they are.

## Shared Environment
All agents run in the SAME working directory (`$EAT_ROOT`) and share one world.

### Player ownership (MUST be in every agent's prompt)
- Name the player each playing agent controls; at most one agent per player. Say which players, if any, are not played this iteration.

### What the team keeps (MUST be in every agent's prompt)
- The team's memory is `tasks/minecraft/team/` (free form). Tell each agent which files it reads first, which it owns (may create or edit) and which it must not touch.
- The arena's records (`mc_arena.py programs`, `chat`, `events`) hold everything that happened and may always be read.
