# Environment of `chess`

any machine with Python 3.11+ and Stockfish 17 (CPU); `setup.sh` installs the rest. The harness hooks this task uses (EAT `agent_team/launch_team.sh`):
`TEAM_WALL_MIN` in `eat/env.sh` (a team's wall-clock limit), `eat/done.sh`
(the run ends when it exits 0).
The agents have no web access (`CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch`).
