# Qwen3.8-Flash-Next on one M5 Pro 48 GB: all results

Status: 2026-10-28 late evening. Every number below was measured on this MacBook Pro (M5 Pro, 20-core GPU, 48 GB) with
the same speed suite (greedy, batch 1). Unit: tokens/s unless noted. **Caveat:** this laptop's speed drifts 5-10% per
hour (heat, swap, background apps), and most rows below are single runs from different hours. A clean final
measurement (reboot, apps closed, 3 interleaved runs per configuration, medians) is still to be done; until then,
compare rows from the same session only.

## 1. The two EAT lines

| line | model file | start | best | score vs the starting engine |
|---|---|---|---|---|
| UD-IQ4_XS (4-bit, Unsloth) | 93.7 GB | `4e6acbe` | `95c2d59` (iter 2) | **1.61** |
| GSQ-RCO IQ3_S (3.5-bit, ISTA-DASLab) | 83.6 GB (54.8 weights + 28.8 PLE table) | `95c2d59` (cannot load the file) | `afe5e6c` (iter 12-13) | **1.69-1.75** (1.0489-1.0715 vs the 4-bit best) |

Score = sqrt(D x P), D = geomean(short decode, decode after ~250K), P = geomean(prefill ~4K, ~32K, ~250K), both
against the starting engine's speeds (34.3 decode, 451 / 456 prefill). EAT iterations 1-8: IQ4_XS; 9-20: IQ3_S;
stopped after 20 (three iterations without a gain on either line).

Gates on every kept commit: llama.cpp agreement (IQ3_S: confident .9992, overall .9759, KL .0097), identical outputs
with a 6000-slot expert cache (lossless = 1), MLX peak <= 37 GiB (measured 35.8-35.9), both needles, test suite with 6
known failures.

What the teams did (in order of effect): GGUF matmul on the M5's matrix units (prefill 450 -> ~1000), one contiguous
record per expert and split reads, KV lent to expert slots until a request needs it (7815 -> 10967 slots), a chained
second MTP draft, five new GGML formats for IQ3_S (IQ2_S, IQ3_XXS, Q2_0, Q4_K, Q5_K), tile-level work (scale loads,
8-simdgroup dense tile, quad-shuffle x sums). Porting the tile work back to IQ4_XS: no gain (microbench flat).

## 2. Speed (best valid full eval of each version)

| | decode | prefill 4K | 32K | 250K | decode after 250K | score |
|---|---|---|---|---|---|---|
| start, UD-IQ4_XS | 34.3 | 451 | 456 | 425 | 31.4 | 1.00 |
| best, UD-IQ4_XS | 40.2 | 989 | 1053 | 1015 | 38.7 | 1.61 |
| best, IQ3_S (iter 19 official) | 47.5 | 1036 | 1019 | 993 | 46.2 | 1.75 |
| best, IQ3_S (clean verify, iter 18) | 46.2 | 990 | 1011 | 983 | 45.5 | 1.69 |

The same code measured in other hours: IQ3_S head 0.90-1.07 (vs the 4-bit best), IQ4_XS head 1.30-1.61.

## 3. Against other engines (same machine, same suite)

Peak wired memory (whole process): FreeToken-metal 39.4-40.3 GiB (its MLX peak is 35.9; the gate is MLX <= 37).
Other engines were given at least as much where they allow it.

**Same afternoon (10-28, ~15:00-17:45), thermal state "fair" during most runs:**

| | file | decode | 4K | 32K | 250K | d250K | score | wired GiB |
|---|---|---|---|---|---|---|---|---|
| FreeToken-metal | UD-IQ4_XS | 42.3-43.8 | 944-988 | 1016-1022 | 924-953 | 36.5-38.2 | 1.56-1.59 | 39.6-40.3 |
| splash, auto budget | UD-IQ4_XS | 35.6 | 821 | 1063 | 955 | 33.9 | 1.45 | 38.0 |
| splash, 36G, defaults | UD-IQ4_XS | 36.6 | 795 | 897 | 730 | 35.5 | 1.37 | 37.5 |
| FreeToken-metal | IQ3_S | 45.9 | 985 | 984 | 937 | 43.9 | 1.67 | 39.4 |
| splash, auto budget | IQ3_S | 42.6 | 937 | 1083 | 873 | 42.0 | 1.62 | 38.4 |
| splash, 36G, lossless (bf16 KV, all rows verified, no ANE) | IQ3_S | 37.3 | 868 | 1055 | 902 | 39.4 | 1.52 | 36.6 |

FreeToken-metal vs splash at about equal memory: **~1.10x (4-bit), ~1.03x (3-bit)**; splash's defaults are lossy
(int8 KV, an int8 ANE prefill FFN, a learned subset of draft rows verified). Decode is ours (+8-23%); 32K prefill
is splash's (+4-10%). An earlier 1.37x was splash in a throttled state (10-25, "Thermal state: fair" at start).

**Evening (10-28), Strata with its MTP on (`--spec 3`, which its setup turns off on a 48 GB Mac):**

| | file | decode | 4K | 32K | 250K | d250K | score | wired GiB |
|---|---|---|---|---|---|---|---|---|
| Strata, 25 GB arena, MTP | IQ3_S | 36.7 | 347 | 338 | 310 | 33.9 | 0.87 | 36.7 |
| Strata, 25 GB arena, no MTP | IQ3_S | 26.2 | 352 | 335 | 332 | 24.9 | 0.75 | 34.7 |
| Strata, defaults (12 GB arena) | IQ3_S | 19.0 | 271 | 290 | 263 | 16.6 | 0.56 | 23.8 |
| Strata, 25 GB arena, MTP | UD-Q4_K_XL | 29.8 | 238 | 249 | 226 | 24.6 | 0.64 | 37.4 |
| Strata, 25 GB arena, no MTP | UD-Q4_K_XL | 22.2 | 233 | 255 | 228 | 18.6 | 0.56 | 36.0 |

FreeToken-metal vs Strata (MTP on): ~2x (3-bit), ~2.5x (4-bit; Strata has no UD-IQ4_XS build on the Mac). Strata had
~3 GiB less wired memory here; a rerun with a 29 GB arena (wired ~40 GiB, at least ours) is running, with paired
FreeToken-metal runs in the same session.

Reference, M4 Pro 48 GB (the starting engine's own run, UD-IQ4_XS): Strata 13.0 decode / ~100 prefill; her FreeToken-metal 28.5 / ~360.

## 4. Why we are faster than splash (ablations, UD-IQ4_XS, same afternoon)

| FreeToken-metal with ... off | decode | score | change |
|---|---|---|---|
| (nothing: control, two runs) | 42.3 | 1.56-1.59 | - |
| MTP drafts | 28.6 | 1.33 | -16% (decode -32%) |
| the second draft | 39.6 | 1.52 | -3.5% |
| KV lent to expert slots | 38.9 | 1.52 | -3.5% |
| contiguous expert records | 42.0 | 1.55 | -2% |
| split reads | 42.0 | 1.54 | -2.5% |
| router look-ahead hints | 42.5 | 1.59 | 0 |

| splash with ... | score | change |
|---|---|---|
| defaults (36G) | 1.37 | - |
| `--disable-ane` | 1.35 | -1.5% |
| `--kv-format bf16` | 1.30 | -5% |
| `--verify-rows all` | 1.28 | -6% |

Reading: splash also runs its GGUF tiles on the matrix units (`matmul2d`) and streams experts with read-ahead. Our
decode edge is the chained second MTP draft (~6%) and KV lent to the expert cache (~8%); expert-IO layout is worth
~2%. Prefill: no lever above moves it; the two engines are about even (splash ahead at 32K).

## 5. Demos

| demo | engines | result | file |
|---|---|---|---|
| 61K-token codebase question, 3-bit | FreeToken-metal vs Strata (IQ3_S, MTP, 25 GB) | prompt 891 vs 370 tok/s, done 134 s vs 252 s | [video](../assets/m5_longctx_iq3s.mp4) |
| 61K-token codebase question, 4-bit | FreeToken-metal IQ4_XS vs Strata Q4_K_XL (MTP, 25 GB) | prompt 818 vs 256 tok/s, done 172 s vs 367 s | [video](../assets/m5_longctx_iq4.mp4) |
| pelican storyboard (134-token prompt) | FreeToken-metal vs Strata (no MTP) | 56.5 vs 19.8 tok/s; outputs differ from token ~40 | not published |

At the pelican divergence point llama.cpp ranks "导演" (ours) first at -1.090 and "迪士尼" (Strata) second at -1.147:
greedy outputs split at a near-tie, not a bug. Strata on the Mac ignores temperature and seed (its Metal sampler is a
stub), so sampled comparisons are not possible; demos use greedy on both sides.

## 6. Release

- EAT PR https://github.com/caoshiyi/EAT/pull/1: README demos (FreeToken-metal table + both long-prompt
  demos, Ender Dragon curve + video, chess Elo curve + vs-2500 video), this file and the blog draft (`docs/`), the harness hooks (`TEAM_WALL_MIN`,
  `eat/pre_team.sh`, `eat/snapshot.sh`, `eat/done.sh`, macOS: bash 3.2, `ops/macbin/timeout`). Tested with one-iteration
  chess ($2.91) and minecraft ($1.34) runs.
- Gym tasks for `eva98/eat-gym`: branch `release/gym-tasks` (`ftm_m5_iq4`, `ftm_m5_iq3s`, `minecraft`, `chess` at the
  published run's version; chess ladder 1500-2400, then 2000-2900 from game 62, read off the Elo plot).
- FreeToken-metal PR https://github.com/caoshiyi/FreeToken-metal/pull/2 (`m5/iq3s` -> `eat-main-5af7892`); `m5/gguf`
  pushed for the IQ4 task's references. The repository must be public before the Gym tasks can be set up.
- Minecraft: dragon at 85.6 h, 38 iterations. Chess (Claude Opus 5.5): EAT team 2460 after 75 games, single agent
  2090 after 200.

## 7. Open

1. Clean final measurement (reboot, apps closed, 3 interleaved runs each of FreeToken-metal IQ4/IQ3, Strata Q4/IQ3 at
   >= our memory, splash IQ4/IQ3), then replace the README table and ratios with its medians.
2. Strata at 29 GB arena (running now), and the long-prompt demos at that memory.
3. FreeToken-metal Gym tasks not installed end to end (needs the repository public and ~200 GB of models).

Raw data (each run's `results.tsv` with every EAT experiment, the speed-suite JSONs, the demo recordings) is kept with
the run records.
