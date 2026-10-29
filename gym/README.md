# New EAT Gym tasks

Four tasks in the EAT Gym's Harbor layout, to be copied into the Hugging Face dataset `eva98/eat-gym` (one directory
each, next to `amd_kda_mi350x`); they are kept here only until then.

| task | what is optimized | hardware | reward | EAT result |
|---|---|---|---|---|
| [`ftm_m5_iq4`](ftm_m5_iq4) | serving Qwen3.8-Flash-Next from Unsloth's UD-IQ4_XS GGUF (94 GB), experts streamed from the SSD, lossless vs llama.cpp | Apple M5 Pro 48 GB (bare metal) | sqrt(decode × prefill) speedup over the starting engine | 1.61× |
| [`ftm_m5_iq3s`](ftm_m5_iq3s) | the same from ISTA-DASLab's GSQ-RCO IQ3_S GGUF (84 GB, 13 GGML types; the start cannot load it) | Apple M5 Pro 48 GB (bare metal) | speedup over the UD-IQ4_XS engine | 1.07× (1.75× over the starting engine) |
| [`minecraft`](minecraft) | defeat the Ender Dragon in a shared survival world, four Mineflayer players | CPU, Java 17+, Node 20+ | milestones reached (0-12) | dragon at 85.6 h |
| [`chess`](chess) | improve over 200 rated games against Stockfish at hidden levels (1500-2400, then 2000-2900 from game 62), no engine help | CPU, Stockfish 17 | Elo over the last 50 games | 2460 after 75 games (single agent: 2090 after 200) |

- The FreeToken-metal tasks fetch the engine at their start commit in `environment/setup.sh`
  (`github.com/caoshiyi/FreeToken-metal`, private until released) and download the GGUF from Hugging Face.
- `minecraft` and `chess` use the harness hooks added with them: `TEAM_WALL_MIN`, `eat/pre_team.sh`,
  `eat/snapshot.sh` and `eat/done.sh` (`agent_team/launch_team.sh`, `launch_stateless.sh`).
- `chess` is the version of the published run (EAT commit `4df4ec06`): levels hidden, practice games, a ladder phase
  from game 62. The later adaptive-pairing variant (a game clock, levels shown) stays on the `chess` branch.
