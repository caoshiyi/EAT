# Environment of `minecraft`

any machine with Java 17+, Node.js 20+ and Python 3.11+ (CPU); `setup.sh` installs the rest. The harness hooks this task uses (EAT `agent_team/launch_team.sh`):
`TEAM_WALL_MIN` in `eat/env.sh` (a team's wall-clock limit), `eat/done.sh`
(the run ends when it exits 0), `eat/pre_team.sh` (starts the world) and `eat/snapshot.sh` (the world snapshot after each team).
The agents have no web access (`CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch`).
