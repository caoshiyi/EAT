# Agentic-serving benchmark (Qwen3.8-Flash-Next 4-bit, expert offload, Mac)

The benchmark behind the numbers in this PR: three recorded coding-agent sessions (23 turns, tool
calls, thinking on, multi-turn prefix reuse) replayed teacher-forced through the engine, plus a
bs=1 decode benchmark (an AIME-25 prompt, 256 tokens). Score = mean over the four of
`baseline time / candidate time`.

Every run also checks correctness against the naive engine's recorded log-probabilities: top-1
agreement (>= 98% on confident positions, >= 94% overall), KL divergence (mean <= 0.06,
p99 <= 0.9), well-formed free-running tool calls, MLX peak <= 37 GiB, swap growth <= 1 GiB.
A run that fails any gate scores 0.

## Setup

1. The MLX checkpoint `Qwen3.8-Flash-Next-4bit` (~79 GB) on a local SSD.
2. `uv sync` in the repo.
3. The derived on-disk formats (lossless, each tool verifies what it writes; ~105 GB in total):

   ```bash
   export FTMETAL_MOE_DERIVED_ROOT=/path/to/ftm_derived
   M=/path/to/Qwen3.8-Flash-Next-4bit
   uv run python tools/repack_expert_scales.py $M
   uv run python tools/repack_expert_pairs.py $M --bits 13 --union
   uv run python tools/repack_ple_rows.py $M
   ```

   Keep `FTMETAL_MOE_DERIVED_ROOT` set when running the benchmark.

## Run

```bash
export FTMETAL_MOE_DERIVED_ROOT=/path/to/ftm_derived
python3 bench/agentic/run.py --model $M --label mine          # full run, ~5 min with this PR
python3 bench/agentic/run.py --model $M --quick --label try   # first session + decode only
```

The run purges the page cache first (`sudo -n purge`; allow it passwordless, or the times are
optimistic). Results go to `bench/agentic/runs/<run_id>/` (`record.json`, `driver.log`); the last
line printed is `mean_vs_base`.

The default baseline (`naive_reference.json`) is naive on our machine (EC2 Mac M4 Pro 48 GB). On
other hardware, measure your own on a naive checkout (two runs are averaged):

```bash
python3 bench/agentic/run.py --model $M --repo /path/to/naive-checkout \
    --baseline my_naive.json --write-baseline --label naive1
python3 bench/agentic/run.py --model $M --baseline my_naive.json --label mine
```

Use `--judge-python /path/to/naive-checkout/.venv/bin/python` to judge the probe replies with
the naive engine's parsers rather than the candidate's.

## Files

- `traces.json`: the recorded sessions, decode prompt, probe prompts and reference log-probs.
- `driver.py`: replays a trace on a checkout (`eval`) or records one (`build`).
- `agent_env.py`: the coding-agent environment the traces were recorded in (tools, system prompt).
- `probe_check.py`: judges the free-running probe replies.
- `run.py`: runs the driver, applies the gates, scores against the baseline.
