# EAT: three new results

## 1. A model bigger than the machine, served from a laptop

One MacBook Pro (M5 Pro, 48 GB) serves Qwen3.8-Flash-Next from an 84-94 GB GGUF with its full 262K context. The file
does not fit in memory, so the routed experts stream from the SSD. The agent teams evolved FreeToken-metal, our MLX +
Metal serving engine, under strict rules: the GGUF is served exactly as quantized; every kept change is checked
position by position against llama.cpp on recorded coding-agent sessions, and must give identical outputs whatever
the expert cache size; speculative decoding is allowed only if it is lossless. The teams put the GGUF matmuls on the
M5's matrix units, gave each expert one SSD read, lent idle KV memory to the expert cache and chained two MTP drafts:
**1.61× on Unsloth's UD-IQ4_XS, then 1.75× on ISTA-DASLab's 3.5-bit GSQ-RCO IQ3_S** (which needed five new
quantization formats), over the starting engine. Against Strata on the same machine and file, with at least as much
memory and its MTP turned on, FreeToken-metal reads a 61K-token codebase 2.4-3.2× faster and answers in about half
the time.

| tokens/s, one M5 Pro 48 GB | decode | prefill 4K / 32K / 250K | decode after 250K |
|---|---|---|---|
| FreeToken-metal at the start, UD-IQ4_XS | 34.3 | 451 / 456 / 425 | 31.4 |
| FreeToken-metal, UD-IQ4_XS | 42.3 | 988 / 1022 / 953 | 37.8 |
| Strata, UD-Q4_K_XL (MTP on) | 29.8 | 238 / 249 / 226 | 24.6 |
| FreeToken-metal, GSQ-RCO IQ3_S | 45.9 | 985 / 984 / 937 | 43.9 |
| Strata, GSQ-RCO IQ3_S (MTP on) | 36.7 | 347 / 338 / 310 | 33.9 |

<sub>Greedy, batch 1. Strata has no UD-IQ4_XS build on the Mac. (To be replaced by tonight's clean measurement:
3 interleaved runs each, medians, Strata at ≥ our memory.)</sub>

![4-bit: FreeToken-metal vs Strata](../assets/m5_longctx_iq4.gif)

4-bit (FreeToken-metal UD-IQ4_XS, Strata UD-Q4_K_XL): prompt 818 vs 256 tokens/s, done in 172 s vs 367 s.
[Full video](../assets/m5_longctx_iq4.mp4)

![3-bit: FreeToken-metal vs Strata](../assets/m5_longctx_iq3s.gif)

3-bit (both GSQ-RCO IQ3_S): prompt 891 vs 370 tokens/s, done in 134 s vs 252 s. [Full video](../assets/m5_longctx_iq3s.mp4)

## 2. Four agents defeat the Ender Dragon

A shared Minecraft 1.20.4 survival world (Easy, no cheats, no server commands) with four fixed players. Each player
acts only through short Mineflayer programs that an agent writes: no pixels, no keyboard. The world persists from one
team to the next, and the only other thing a team inherits is a notes folder it keeps itself. The score is read from
the world's own advancements: 12 milestones from bare hands to the dragon. In 38 iterations the teams went from bare
hands through iron, the Nether, blaze rods, eyes of ender and the stronghold to the End, and **defeated the Ender
Dragon at 85.6 hours**, with no human play.

![Milestones over time](../assets/minecraft_dragon_milestones.png)

![The four hits that ended the fight](../assets/minecraft_dragon.gif)

The four hits that ended the fight, re-enacted from the arena's records in the vanilla client.
[Full video](../assets/minecraft_dragon.mp4)

## 3. Learning chess over 200 games

A public continuous-learning benchmark found that a single agent playing 200 games against Stockfish does not improve.
Here the team plays one stream of 200 rated games against Stockfish at levels it is never shown, Elo 1500 to 2400 in
shuffled rotations. There is no engine, opening database or web access, so every move is the agents' own; unrated
practice games are free. Once the team was beating most of that range, the opponents moved up to 2000-2900 from game
62 on. Claude Opus 5.5 as a single agent rose to **2090 after 200 games**; as an EAT team, keeping and revising a
shared record of its games, it reached **2460 after 75**.

![Elo over games: EAT team vs single agent](../assets/chess_elo.png)

![Same opponent (Stockfish 2500), three players](../assets/chess_vs2500.gif)

Stockfish at Elo 2500 against a fresh agent, the single agent after 200 games and the EAT team.
[Full video](../assets/chess_vs2500.mp4)

---

All numbers, comparisons, ablations and caveats behind these paragraphs: [m5_results.md](m5_results.md).
