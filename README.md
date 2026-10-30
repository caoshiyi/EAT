<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/eat_lockup_dark.png">
    <img alt="EAT" src="assets/eat_lockup_light.png" width="300">
  </picture>
</p>

<h3 align="center">Evolving Agent Teams</h3>
<p align="center"><em>Agents that diagnose why they stall and restructure their own team</em></p>

<p align="center">
  <a href="https://arxiv.org/abs/2610.36848"><img alt="Paper" src="https://img.shields.io/badge/Paper-NeurIPS%202026-E8A12E?style=flat-square&logo=arxiv&logoColor=white&labelColor=0E1A2B"></a>
  <a href="https://huggingface.co/datasets/eva98/eat-gym"><img alt="EAT Gym" src="https://img.shields.io/badge/%F0%9F%A4%97%20EAT%20Gym-tasks-E8A12E?style=flat-square&labelColor=0E1A2B"></a>
  <a href="https://huggingface.co/datasets/eva98/eat-evolution-traces"><img alt="Traces" src="https://img.shields.io/badge/%F0%9F%A4%97%20Traces-agent%20transcripts-E8A12E?style=flat-square&labelColor=0E1A2B"></a>
  <a href="https://github.com/caoshiyi/eat-kernels"><img alt="Kernels" src="https://img.shields.io/badge/Kernels-eat--kernels-E8A12E?style=flat-square&logo=github&logoColor=white&labelColor=0E1A2B"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache--2.0-5C7FA3?style=flat-square&labelColor=0E1A2B"></a>
</p>

<p align="center"><img alt="EAT runs: official score at the end of every iteration" src="assets/eat_curves.gif" width="100%"></p>

<p align="center"><b>One supervisor agent. No hand-written solution.</b> It designs a team of coding agents, watches it work,
diagnoses why it stalls, and rebuilds the team, for as long as the budget lasts.</p>

## Get started

In Claude Code, install EAT once:

```
/plugin install eat --marketplace caoshiyi/EAT
```

Then, in the repository you want to improve, just ask:

> *Use EAT to make `bench.py` faster on GPUs 0 and 1. Budget $200.*
>
> *Run the EAT Gym task `amd_kda_mi350x` on GPUs 0-3 with a $300 budget.*

Claude checks the machine, writes the task's eval and rules with you, records the starting score and launches the run;
later ask it how the run is going, or to pause, stop or resume it. **Nothing installed?** Tell Claude Code *"Use EAT
(github.com/caoshiyi/EAT) to ..."* and it fetches the skill itself.

## The supervisor invents the team that breaks the plateau

The supervisor never touches the solution. When the score stalls, it reads the team's transcripts, names what is
holding it back, and **creates the role that attacks it**. Over the 73 iterations of the MI350X run it used 42
distinct roles, from a single `solo_optimizer` to an `energy_auditor` and a `lander`:

<p align="center"><img alt="Team composition per iteration of the MI350X run" src="assets/eat_team_evolution.png" width="100%"></p>

**The B200 run passed the best published kernel in four iterations**, each one a team rebuilt around the
supervisor's diagnosis of the last:

<p align="center"><img alt="B200 run, iterations 1-5: the supervisor's diagnosis, the team it designed, and the score" src="assets/eat_b200_teams.png" width="100%"></p>

The same pattern appears late in long runs. In the MI350X run, iterations 57 and 58 shipped nothing; the
supervisor found that the team had been timing its ideas in a different regime from the eval, and wrote a new role
for iteration 59:

> **ENERGY AUDITOR.** *"The pattern runs on a power transient: device time is 1.08–1.29× the gapped time ... The team
> has therefore been pricing levers in a regime the score does not use. Your job is to fix the measurement and re-open
> what it may have mis-judged."*

That iteration set a new best (2.90×), and the run went on to 3.03×. Every team config, prompt and transcript is in
the [traces](https://huggingface.co/datasets/eva98/eat-evolution-traces).

## Demos

### A robot policy written by agents

The starting policy is the Pi_05 VLA. The EAT team replaced it with Python code that calls the frozen Pi_05 and, at
runtime, Claude, and raised RoboDojo's leaderboard score from 11.4 to **62.1 on held-out seeds, above every entry on
the leaderboard (55.3, Oct 26, 2026)**. Same scene, left: Pi_05; right: the team's code policy
([eat-robodojo-policy](https://github.com/caoshiyi/eat-robodojo-policy)).

<p align="center"><img alt="RoboDojo make_kong: Pi_05 vs. the EAT code policy" src="assets/robodojo_make_kong.gif" width="100%"></p>
<p align="center"><sub><code>make_kong</code> (Mahjong): task score 16.7 → 97.2. <a href="assets/robodojo_make_kong.mp4">Full video</a></sub></p>

<table>
<tr>
<td width="50%"><img alt="RoboDojo arrange_largest_number" src="assets/robodojo_arrange.gif" width="100%"></td>
<td width="50%"><img alt="RoboDojo classify_objects_by_language" src="assets/robodojo_cbl.gif" width="100%"></td>
</tr>
<tr>
<td align="center"><sub><code>arrange_largest_number</code>: task score 2.5 → 88.3</sub></td>
<td align="center"><sub><code>classify_objects_by_language</code>: task score 3.3 → 80.0</sub></td>
</tr>
</table>

### Qwen3.8-Flash-Next served from a laptop

One MacBook Pro (M5 Pro, 48 GB) serves Qwen3.8-Flash-Next from an 84-94 GB GGUF with its full 262K context. The file does
not fit in memory, so the routed experts stream from the SSD.

The teams evolved [FreeToken-metal](https://github.com/caoshiyi/FreeToken-metal) under strict rules:
- the GGUF is served exactly as quantized;
- every kept change is checked position by position against llama.cpp on recorded coding-agent sessions;
- outputs are identical whatever the expert cache size;
- speculative decoding is allowed only if it is lossless.

They put the GGUF matmuls on the M5's matrix units, moved to longer prompt chunks and chained two MTP drafts. Over the
starting engine, that gives **1.62× on Unsloth's UD-IQ4_XS, then 1.73× on ISTA-DASLab's 3.5-bit GSQ-RCO IQ3_S** (which
needed five new quantization formats).

We also compared against Strata on the same machine. Strata ran with its MTP on, a larger expert cache than ours and
longer prompt chunks; its own defaults on this Mac are slower. On the same IQ3_S file, FreeToken-metal decodes 1.25×
faster and reads prompts 1.4× faster.

| tokens/s, one M5 Pro 48 GB | decode | prompt 4K / 32K / 250K | decode after 250K |
|---|---|---|---|
| FreeToken-metal at the start, UD-IQ4_XS | 34.3 | 451 / 456 / 425 | 31.4 |
| FreeToken-metal, UD-IQ4_XS | 42.1 | 974 / 1034 / 1005 | 38.7 |
| Strata, UD-Q4_K_XL | 23.7 | 637 / 672 / 613 | 26.4 |
| FreeToken-metal, GSQ-RCO IQ3_S | 47.5 | 1027 / 1010 / 946 | 46.4 |
| Strata, GSQ-RCO IQ3_S | 38.0 | 718 / 742 / 660 | 36.1 |

<p align="center"><sub>Medians of three runs (four for Strata UD-Q4_K_XL, whose decode varied from 13 to 30), greedy, batch 1.
Strata: MTP on, a 29-30 GB expert arena (FreeToken-metal's expert cache is 25 GiB), 4096-token prompt chunks. Strata has
no UD-IQ4_XS build for the Mac, so its 4-bit row uses a different file. Details: <a href="docs/m5_results.md">docs/m5_results.md</a>.</sub></p>
<table>
<tr>
<td width="50%"><img alt="61K-token codebase question, 4-bit: FreeToken-metal vs Strata" src="assets/m5_longctx_iq4.gif" width="100%"></td>
<td width="50%"><img alt="61K-token codebase question, 3.5-bit: FreeToken-metal vs Strata" src="assets/m5_longctx_iq3s.gif" width="100%"></td>
</tr>
<tr>
<td align="center"><sub>4-bit (FreeToken-metal UD-IQ4_XS, Strata UD-Q4_K_XL): prompt 927 vs 709 tokens/s, decode 32.6 vs 21.9 tokens/s.
<a href="assets/m5_longctx_iq4.mp4">Full video</a></sub></td>
<td align="center"><sub>3.5-bit (both GSQ-RCO IQ3_S): prompt 925 vs 750 tokens/s, decode 45.1 vs 39.9 tokens/s.
<a href="assets/m5_longctx_iq3s.mp4">Full video</a></sub></td>
</tr>
</table>
<p align="center"><sub>One 61K-token prompt, nine of FreeToken-metal's source files followed by four questions about them, greedy,
the same prompt for both engines, played back at 2× speed.</sub></p>

### Four agents defeat the Ender Dragon

A shared Minecraft 1.20.4 survival world (Easy, no cheats, no server commands) with four fixed players, each acting
only through short Mineflayer programs an agent writes: no pixels, no keyboard. The world persists from team to team,
and the only other thing a team inherits is a notes folder it keeps itself. The score is read from the world's own
advancements: 12 milestones from bare hands to the dragon. In 38 iterations the teams went from bare hands through
iron, the Nether, blaze rods, eyes of ender and the stronghold to the End, and **defeated the Ender Dragon at 85.6
hours**, with no human play.

<p align="center"><img alt="Milestones over time" src="assets/minecraft_dragon_milestones.png" width="80%"></p>
<p align="center"><img alt="The four hits that ended the dragon fight" src="assets/minecraft_dragon.gif" width="100%"></p>
<p align="center"><sub>The four hits that ended the fight, re-enacted from the arena's records in the vanilla client.
<a href="assets/minecraft_dragon.mp4">Full video</a></sub></p>

### Learning chess over 200 games

A public continuous-learning benchmark reports that a single agent playing 200 games against Stockfish does not
improve. Here the team plays one stream of 200 rated games against Stockfish at levels it is never shown, Elo 1500 to
2400 in shuffled rotations; with no engine, opening database or web, every move is the agents' own, and unrated
practice games are free. Once the team was beating most of that range, the opponents moved up to 2000 to 2900, from
around game 60. Rated over its last 40 games, Claude Opus 5.5 as a single agent reached **2090 after 200 games**; as an
EAT team, keeping and revising a shared record of its games, it reached **2460 after 75**.

<p align="center"><img alt="Elo over games: EAT team vs single agent" src="assets/chess_elo.png" width="80%"></p>
<p align="center"><img alt="Same opponent (Stockfish 2500), three players" src="assets/chess_vs2500.gif" width="100%"></p>
<p align="center"><sub>Stockfish at Elo 2500 against a fresh agent, the single agent after 200 games and the EAT team.
<a href="assets/chess_vs2500.mp4">Full video</a></sub></p>

## Everything is released

- **Kernels**, packaged for inference engines (vLLM-style serving interface with paged state and prefix-cache
  checkpoints; MI350X 3.04× prefill and 1.69× decode, B200 2.57× on 26 serving workloads):
  [eat-kernels](https://github.com/caoshiyi/eat-kernels).
- **The RoboDojo policy**, with its eval fleet setup: [eat-robodojo-policy](https://github.com/caoshiyi/eat-robodojo-policy).
- **Every supervisor and agent transcript**, team config, note and per-iteration kernel or policy:
  [eva98/eat-evolution-traces](https://huggingface.co/datasets/eva98/eat-evolution-traces).
- **The tasks**, at the state each run started from: [EAT Gym](https://huggingface.co/datasets/eva98/eat-gym).

## How it works

EAT is a harness in which a **supervisor** agent repeatedly designs, launches and revises a **team** of coding agents
(Claude Code) that optimize a GPU kernel (or another program, such as a robot policy) against a fixed eval. The
supervisor never writes the solution; its only output each iteration is a team configuration (roles, prompts, phases,
ownership of files and GPUs). The team does the work, the harness runs the official eval, and the supervisor reflects
on the result and evolves the team. A file system kept across all teams (learnings, evolution history, artifacts)
grounds each redesign in what earlier teams found.

<p align="center"><img alt="The EAT framework" src="assets/eat_overview.png" width="900"></p>

```
while budget remains:
    supervisor:  REFLECT on the previous team's output -> EVOLVE roles / prompts / workflow -> emit TEAM_CONFIG
    harness:     launch the team's agents phase by phase -> run the official eval -> record cost and score
```

## Clean-room runs

To show that a result was not copied from code released after a cutoff, run the whole loop inside the
[bubblewrap](https://github.com/containers/bubblewrap) sandbox, from the task repository:

```bash
EAT_CLEAN=/path/to/sandbox-state EAT_ALLOWED_RO="/refs/cutlass /refs/flashinfer-2026-08-13" EAT_GPUS="0 1" \
CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch $EAT_HOME/cleanroom/sandbox.sh \
    bash $EAT_HOME/agent_team/launch_stateless.sh --persistent 50 3 300
```

Only the task repository, EAT, and the `EAT_ALLOWED_RO` sources are visible, and the network reaches only the
Anthropic API (through `allowlist_proxy.py`, which logs every request). Afterwards,
`cleanroom/audit_clean_traces.py` scans every tool call in the run's transcripts for web use, network commands and
forbidden sources, and `cleanroom/audit_code_overlap.py` finds code lines that appear only in the forbidden sources.

## For coding agents

If a user asks you to use EAT and the `eat` skill is not installed: clone this repository (for example to
`~/.claude/skills/eat`) and follow [`SKILL.md`](SKILL.md), with `EAT_HOME` set to the clone.

## Citation

```bibtex
@inproceedings{cao2026eat,
  title     = {Evolving Agent Teams},
  author    = {Cao, Shiyi and Mao, Ziming and Li, Dacheng and Gonzalez, Joseph E. and Stoica, Ion},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2610.36848}
}
```

## License

Apache-2.0. Tasks installed from the EAT Gym bring their own NOTICE for the third-party code they contain.
