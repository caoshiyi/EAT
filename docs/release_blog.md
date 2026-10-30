# EAT: three new results

## 1. A model bigger than the machine, served from a laptop

One MacBook Pro (M5 Pro, 48 GB) serves Qwen3.8-Flash-Next from an 84-94 GB GGUF with its full 262K context. The file
does not fit in memory, so the routed experts stream from the SSD.

The agent teams evolved FreeToken-metal, our MLX + Metal serving engine, under strict rules:
- the GGUF is served exactly as quantized;
- every kept change is checked position by position against llama.cpp on recorded coding-agent sessions;
- every kept change gives identical outputs whatever the expert cache size;
- speculative decoding is allowed only if it is lossless.

The teams put the GGUF matmuls on the M5's matrix units, moved to longer prompt chunks and chained two MTP drafts. Over
the starting engine, that gives **1.62× on Unsloth's UD-IQ4_XS, then 1.73× on ISTA-DASLab's 3.5-bit GSQ-RCO IQ3_S**,
which needed five new quantization formats.

We compared against Strata on the same machine. We tuned Strata only through its own settings: MTP on, a larger expert
cache than ours, and longer prompt chunks. Its defaults on this Mac are slower. On the same IQ3_S file, FreeToken-metal
decodes 1.25× faster and reads prompts 1.4× faster.

| tokens/s, one M5 Pro 48 GB | decode | prompt 4K / 32K / 250K | decode after 250K |
|---|---|---|---|
| FreeToken-metal at the start, UD-IQ4_XS | 34.3 | 451 / 456 / 425 | 31.4 |
| FreeToken-metal, UD-IQ4_XS | 42.1 | 974 / 1034 / 1005 | 38.7 |
| Strata, UD-Q4_K_XL | 23.7 | 637 / 672 / 613 | 26.4 |
| FreeToken-metal, GSQ-RCO IQ3_S | 47.5 | 1027 / 1010 / 946 | 46.4 |
| Strata, GSQ-RCO IQ3_S | 38.0 | 718 / 742 / 660 | 36.1 |

<sub>All runs are greedy, batch 1. Each figure is a median: of three runs, or four for Strata UD-Q4_K_XL, whose decode
varied between 13 and 30 tokens/s. Strata ran with MTP on, a 29-30 GB expert arena (FreeToken-metal's expert cache is
25 GiB) and 4096-token prompt chunks. Strata has no UD-IQ4_XS build for the Mac, so its 4-bit row uses a different
file.</sub>

![4-bit: FreeToken-metal vs Strata](../assets/m5_longctx_iq4.gif)

4-bit (FreeToken-metal UD-IQ4_XS, Strata UD-Q4_K_XL): prompt 927 vs 709 tokens/s, decode 32.6 vs 21.9 tokens/s.
[Full video](../assets/m5_longctx_iq4.mp4)

![3.5-bit: FreeToken-metal vs Strata](../assets/m5_longctx_iq3s.gif)

3.5-bit (both GSQ-RCO IQ3_S): prompt 925 vs 750 tokens/s, decode 45.1 vs 39.9 tokens/s.
[Full video](../assets/m5_longctx_iq3s.mp4)

Each demo is one 61K-token prompt: nine of FreeToken-metal's source files followed by four questions about them. Both
engines get the same prompt and decode greedily. Playback is at 2× speed.

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

A public continuous-learning benchmark reports that a single agent playing 200 games against Stockfish does not
improve. Here the team plays one stream of 200 rated games against Stockfish at levels it is never shown, Elo 1500 to
2400 in shuffled rotations; with no engine, opening database or web, every move is the agents' own, and unrated
practice games are free. Once the team was beating most of that range, the opponents moved up to 2000 to 2900, from
around game 60. Rated over its last 40 games, Claude Opus 5.5 as a single agent reached **2090 after 200 games**; as an
EAT team, keeping and revising a shared record of its games, it reached **2460 after 75**.

![Elo over games: EAT team vs single agent](../assets/chess_elo.png)

![Same opponent (Stockfish 2500), three players](../assets/chess_vs2500.gif)

Stockfish at Elo 2500 against a fresh agent, the single agent after 200 games and the EAT team.
[Full video](../assets/chess_vs2500.mp4)

---

All numbers, comparisons, ablations and caveats behind these paragraphs: [m5_results.md](m5_results.md).
