# Qwen3.8-Flash-Next on one M5 Pro 48 GB

The numbers behind the FreeToken-metal section of the README.

## Setting

- **Machine:** MacBook Pro, M5 Pro (20-core GPU), 48 GB, macOS 26.7, on AC power.
- **Model:** Qwen3.8-Flash-Next, served from two GGUF files:
  - Unsloth UD-IQ4_XS, 93.7 GB;
  - ISTA-DASLab GSQ-RCO IQ3_S, 83.6 GB (54.8 GB of weights plus a 28.8 GB n-gram table).
- **Context and memory:** the full 262,144-token context. Neither file fits in memory, so the routed experts stream from the SSD.
- **Engine:** [FreeToken-metal](https://github.com/caoshiyi/FreeToken-metal), an MLX + Metal serving engine.

**Rules for every kept change:**
- the GGUF is served exactly as quantized;
- on recorded coding-agent sessions, top-1 tokens agree with llama.cpp position by position:
  - IQ3_S: 99.9% where llama.cpp is confident, 97.6% overall, mean KL 0.0097;
- the outputs are identical whatever the expert cache size;
- speculative decoding is lossless (greedy output is the target model's own);
- the MLX peak stays at or below 37 GiB;
- both long-context needles are found;
- the test suite passes.

## The EAT runs

Score = sqrt(D × P):
- D is the geometric mean of short decode and decode after a ~250K prompt;
- P is the geometric mean of prompt speed at ~4K, ~32K and ~250K tokens;
- each term is divided by the starting engine's speed on UD-IQ4_XS: 34.3 decode, 451 and 456 prompt tokens/s.

The starting engine cannot load the IQ3_S file, so the IQ3_S line is scored against the same UD-IQ4_XS baseline.

| line | iterations | best | score |
|---|---|---|---|
| UD-IQ4_XS | 1-8 | `95c2d59` | 1.62 |
| GSQ-RCO IQ3_S | 9-20 | `afe5e6c` | 1.73 |

Scores are medians of the three-round measurement below.

The run stopped after 20 iterations, after three in a row without a gain on either line.

What the teams changed, roughly in order of effect:
- GGUF matmuls on the M5's matrix units (Metal 4 `matmul2d`);
- 8192-token prompt chunks;
- a second, chained MTP draft;
- KV memory lent to the expert cache until a request needs it;
- one contiguous SSD record per expert, with split reads;
- for IQ3_S, five new GGML formats (IQ2_S, IQ3_XXS, Q2_0, Q4_K, Q5_K) and tile-level kernel work.

## Speed against Strata

**Method:**
- the same speed suite for both engines, greedy, batch 1;
- three rounds, alternating between the engines, reporting medians;
- peak wired memory is sampled every 2 s for the whole system.

**Strata on this Mac:** by default it uses a 12 GB expert arena, 1024-token prompt chunks and no MTP. Here it runs with:
- a 29 GB arena for UD-Q4_K_XL and 30 GB for IQ3_S (`STRATA_METAL_ARENA_GB`), so its expert cache is larger than FreeToken-metal's (see the memory table);
- the arena wired in memory (`STRATA_METAL_WIRE_ARENA=1`), its own default on Macs with 64 GB or more;
- 4096-token prompt chunks (`STRATA_METAL_PROMPT_CHUNK=4096`), its own default on Macs with 96 GB or more;
- MTP on (`--spec 3` with its MTP head);
- for UD-Q4_K_XL only, short prompts under 512 tokens skip the prompt GEMM path (`STRATA_METAL_PROMPT_GEMM_MIN=512`):
  - with 4096-token chunks, a short prompt otherwise takes its 5.2 GB of prompt buffers out of the expert arena; in a quick run decode was 32 tokens/s with this setting and 28 without;
  - on IQ3_S this setting did not help.

Strata has no UD-IQ4_XS build for the Mac, so its 4-bit run uses UD-Q4_K_XL, a different file.

| tokens/s | decode | prompt 4K | 32K | 250K | decode after 250K | score | peak wired (system) |
|---|---|---|---|---|---|---|---|
| FreeToken-metal at the start, UD-IQ4_XS | 34.3 | 451 | 456 | 425 | 31.4 | 1.00 | |
| FreeToken-metal, UD-IQ4_XS | 42.1 | 974 | 1034 | 1005 | 38.7 | 1.62 | 38.5-40.2 GiB |
| Strata, UD-Q4_K_XL | 23.7 | 637 | 672 | 613 | 26.4 | 0.95 | 39.8-40.6 GiB |
| FreeToken-metal, GSQ-RCO IQ3_S | 47.5 | 1027 | 1010 | 946 | 46.4 | 1.73 | 38.5-40.2 GiB |
| Strata, GSQ-RCO IQ3_S | 38.0 | 718 | 742 | 660 | 36.1 | 1.29 | 39.6-39.7 GiB |

**Strata UD-Q4_K_XL rounds:** the median is over four rounds. Its decode was 27.1, 29.9, 12.6 and 20.3 tokens/s; prompt
speeds stayed within 10%.

**Memory, by each engine's own accounting:**

| | expert cache | whole process |
|---|---|---|
| FreeToken-metal | 24.7 GiB (UD-IQ4_XS) / 25.3 GiB (IQ3_S) | 36.4 GiB budget, plus a 2 GiB host victim cache |
| Strata | 27.0 GiB (29 GB arena, UD-Q4_K_XL) / 27.9 GiB (30 GB arena, IQ3_S) | 40.6 / 38.7 GiB |

Peak wired memory above is sampled for the whole system, so it also moves with background activity.

Tuning Strata (IQ3_S, decode and ~4K / ~32K prompt, tokens/s; only Strata's own settings, no code changes):

| Strata | decode | 4K | 32K |
|---|---|---|---|
| defaults (12 GB arena, no MTP, 1024-token chunks) | 19.0 | 271 | 290 |
| 29 GB arena, MTP on, 1024-token chunks | 37.9 | 392 | 403 |
| ... and 2048-token chunks | 36.2 | 587 | 607 |
| ... and 4096-token chunks | 39.4 | 709 | 745 |
| ... and 8192-token chunks | 36.2 | 468 | 517 |
| 4096-token chunks, MTP off | 27.2 | 767 | 706 |

None of the other settings tried moved Strata past run-to-run noise. On IQ3_S they all gave 37-39 decode and 700-745
prompt tokens/s:
- `--spec` 2 or 4;
- `--spec-min-p 0.5`;
- the suffix drafter (`--suffix-draft 3`);
- `--lookup-chain 2`;
- read-ahead depth 10;
- split reads;
- 12 I/O threads;
- `STRATA_METAL_PARTIAL`;
- `STRATA_METAL_ROUTE`;
- keeping the host weight copies.

## Where FreeToken-metal's speed comes from

IQ3_S, decode and ~4K / ~32K prompt, tokens/s, with one mechanism off at a time. Two control runs (45.1 and 48.3 decode) put run-to-run noise at about ±4%.

| FreeToken-metal with ... | decode | 4K | 32K |
|---|---|---|---|
| nothing off (two runs) | 45.1-48.3 | 1017-1028 | 989-1013 |
| GGUF matmuls off the matrix units | 47.2 | 470 | 478 |
| 1024-token prompt chunks | 47.5 | 600 | 595 |
| 4096-token prompt chunks | 44.8 | 935 | 929 |
| MTP off | 35.9 | 1045 | 1019 |
| one MTP draft instead of two | 45.5 | 969 | 989 |
| no KV lent to the expert cache | 44.4 | 1014 | 1013 |
| no contiguous expert records | 46.5 | 1026 | 1005 |
| whole-expert reads | 45.4 | 1025 | 1006 |
| no router look-ahead hints | 47.2 | 1027 | 1011 |
| attention scores off the matrix units | 45.2 | 999 | 974 |

**Prompt:**
- The matrix-unit GGUF matmul accounts for 2.2× of FreeToken-metal's prompt speed. Strata uses `matmul2d` too.
- At the same chunk size FreeToken-metal reads the prompt 1.3-1.5× faster:
  - 1024-token chunks: 600 vs 392 tokens/s;
  - 4096-token chunks: 935 vs 709.
- FreeToken-metal also gains from 8192-token chunks. Strata slows down at 8192, probably because its prompt buffers are taken out of its expert arena while a prompt runs.

**Decode:**
- Without MTP, FreeToken-metal decodes 32% faster than Strata in the speed suite (35.9 vs 27.2).
- Strata's MTP adds more (+45% against +26-34%), so with MTP on both sides the gap narrows.
- In the quick suite above, the second draft, KV lending, expert records, split reads and router hints are within noise. The decode probe below, with five prompts per point, does resolve KV lending.

## Decode, split into compute and SSD reads

IQ3_S, client-side decode tokens/s.
- **Normal:** five fresh ~3K-token prompts, 256 tokens each, median. Experts stream from the SSD as needed.
- **All in cache:** one ~3K-token prompt sent six times, 128 tokens each, median of the last five. From the second time
  on, the same tokens use the same experts, which are already in each engine's cache, so this is compute only.

Two rounds each, alternating engines:

| | normal | all in cache | lost to SSD reads |
|---|---|---|---|
| FreeToken-metal, MTP on | 50.2-52.1 | 53.1-53.9 | 2-7% |
| Strata, MTP on | 35.8-39.4 | 48.6-50.8 | 22-26% |
| FreeToken-metal, MTP off | 34.9 | 37.0 | 6% |
| Strata, MTP off | 25.4 | 32.2 | 21% |
| Strata, MTP on, 1024-token prompt chunks | 35.9 | 50.1 | 28% |

- **Compute:** with every expert in cache, FreeToken-metal is 5% faster with MTP and 15% faster without it.
- **SSD reads:** most of the decode gap is here. Strata loses 21-28% of its speed to reads, FreeToken-metal 2-7%.
  - Strata holds more experts than FreeToken-metal: 13,660 slots against 13,258.
  - None of Strata's settings for reads changed its loss: arena size, read-ahead depth, split reads, I/O threads,
    prompt chunk size.
- **4-bit:** with every expert in cache, Strata decodes UD-Q4_K_XL at 28-29 tokens/s, against 50.8 for FreeToken-metal
  on UD-IQ4_XS. The 4-bit gap is in compute on that file.

Disk reads per decoded token (system-wide `iostat` on the SSD, cold prompts, median of five, two rounds):

| | read per token | normal decode | all in cache | stall per token |
|---|---|---|---|---|
| FreeToken-metal | 26 MB | 49.1-52.5 | 52.8-54.2 | ~0.6 ms |
| FreeToken-metal, no KV lending | 54 MB | 44.4 | 51.2 | ~3.0 ms |
| Strata | 43 MB | 34.0-38.9 | 40.2-48.1 | ~4.9 ms |

Stall per token is 1 / normal - 1 / all in cache, using the round where both were measured together.

- **Strata misses more.** It reads 1.6× as many bytes per token as FreeToken-metal, although it holds more experts.
- **Each Strata read costs more.** Without KV lending, FreeToken-metal reads more per token than Strata (54 MB) and
  still stalls less (3.0 ms against 4.9 ms), because its reads overlap the GPU's work better.

FreeToken-metal with its read-side mechanisms off (same probe, normal decode, against a control of 50.2-52.1):

| off | normal | expert slots |
|---|---|---|
| host victim cache | 51.8 | 13,258 |
| LRFU eviction (plain LRU instead) | 50.2 | 13,258 |
| router look-ahead hints | 49.9 | 13,258 |
| contiguous records, split reads, deferred stores | 51.2 | 13,258 |
| KV lent to the expert cache | 41.1 | 9,527 |
| all of the above | 42.4 | 9,527 |

- **KV lending** is the one that matters: without it, 3,700 fewer experts fit and decode drops by a fifth.
- **The other mechanisms** are within noise on IQ3_S.
- **Everything off:** with 9,527 slots, FreeToken-metal still decodes faster than Strata does with 13,660.

## Long-prompt demo

| | prompt | decode | answer |
|---|---|---|---|
| FreeToken-metal, UD-IQ4_XS | 927 tokens/s (66 s) | 32.6 tokens/s | 3128 tokens |
| Strata, UD-Q4_K_XL | 709 tokens/s (87 s) | 21.9 tokens/s | 3079 tokens |
| FreeToken-metal, GSQ-RCO IQ3_S | 925 tokens/s (66 s) | 45.1 tokens/s | 2791 tokens |
| Strata, GSQ-RCO IQ3_S | 750 tokens/s (82 s) | 39.9 tokens/s | 3119 tokens |

Each engine gets the same prompt of about 61,200 tokens: nine FreeToken-metal source files, then four questions about them. The answer is greedy and limited to 4096 tokens.

The questions ask how the expert cache picks a victim, how KV memory is lent to expert slots, and how MTP drafts are verified. The fourth asks for a pytest unit test.

Strata's Metal sampler on the Mac is greedy only, so both engines decode greedily. Greedy outputs of two different engines can still part at near-ties: in one recorded case llama.cpp scores the two candidate tokens at -1.090 and -1.147.

## Measurement note

This laptop's speed drifts by 5-10% over an hour, with heat, swap and background apps. Compare rows within one table. The tuning and ablation tables are single runs taken in the same afternoon. The speed table gives medians of three alternating rounds.
