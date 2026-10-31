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

### Qwen3.8-Flash-Next served from a 48 GB Mac

The model does not fit in the Mac's memory, so its experts stream from the SSD. An EAT team wrote the offload engine,
starting from a naive port. On an Apple M4 Pro with 48 GB:

- **GGUF UD-IQ4_XS**, against Strata on the same file (both with MTP speculation): decode **31.1 vs 15.3 tokens/s**;
  after a 256K-token prompt, decode **33.6 vs 12.4 tokens/s** and prefill **352 vs 113 tokens/s**.
- **MLX 4-bit**, against the naive engine: batch-1 decode **30.3 vs 13.4 tokens/s**.

<p align="center"><img alt="Qwen3.8-Flash-Next on an M4 Pro: EAT's engine vs Strata and the naive engine, tokens/s" src="assets/eat_mac_serving.png" width="100%"></p>

The same model driving Claude Code locally: each engine serves Claude Code v2.1.296 on the same Mac and GGUF (MTP on
for both), with the same bug to fix in a small project. Both find the same one-line fix; EAT's engine finishes in
**2 min 46 s**, Strata in **6 min 39 s** (Claude Code's ~18K-token system prompt alone takes Strata about 3 minutes).

<p align="center"><img alt="Claude Code on a local Qwen3.8-Flash-Next: EAT's engine vs Strata" src="assets/mac_claude_code_race.gif" width="100%"></p>
<p align="center"><sub>Each engine recorded alone, replayed side by side at 6× speed; the clock shows real time. <a href="assets/mac_claude_code_race.mp4">Full video (3×)</a></sub></p>

**Coming soon:** serving on an Apple M5 Pro.

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
