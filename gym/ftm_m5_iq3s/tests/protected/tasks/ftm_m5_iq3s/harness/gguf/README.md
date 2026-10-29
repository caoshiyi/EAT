# GGUF benchmark (Qwen3.8-Flash-Next UD-IQ4_XS, expert offload, Mac)

The benchmark behind the GGUF numbers in this PR: `ftm serve` on Unsloth's UD-IQ4_XS GGUF of
Qwen3.8-Flash-Next (87 GiB) on a 48 GB Mac, scored against Strata's numbers on the same file and
machine (`strata_baseline.json`).

A run has two phases:

1. **Correctness**, in-process and teacher-forced (`../agentic/driver.py`): three recorded
   coding-agent sessions, a decode benchmark and a long-output session (a 30.6K-token prefix of a
   reply to the pelican prompt, then its last 1,024 tokens). At every response position the
   distribution is compared with llama.cpp's on the same GGUF (`traces_iq3s.json`, llama.cpp
   `fae9ac5` on CPU, top-20): top-1 agreement >= 98% where llama.cpp's top-2 margin >= 1 nat and
   >= 90% overall, KL mean <= 0.10, p99 <= 1.5; free-running tool-call probes well-formed.
2. **Serving**, `ftm serve --model <GGUF dir>` with no other flags:
   - `speed_suite.py`: decode after a short prompt (512 tokens), prefill at ~4K and ~32K, and
     ~128K / ~250K prompts with a needle (prefill rate, decode after the prompt, needle found);
   - `pelican_client.py`: a long greedy generation (a 24-panel SVG storyboard, reasoning effort
     medium, up to 48K tokens); at least 20 complete drawings and a normal finish.

`score = sqrt(D * P)` with `D` the geomean of decode (short, after ~250K) over the baseline's
short-context decode, and `P` the geomean of prefill (4K, 32K, ~250K) over the baseline's 4K /
32K prefill; > 1 is faster than the baseline. A run also fails (score 0) if MLX peak memory
exceeds 37 GiB, swap grows by more than 1 GiB, decode after ~250K tokens is below 21 tok/s, or
the ~250K prefill rate is below half the 32K one.

## Setup

1. The GGUF directory: the three `Qwen3.8-Flash-Next-UD-IQ4_XS-0000N-of-00003.gguf` shards, plus
   the original model's `config.json` (without a `quantization` block), `generation_config.json`,
   `tokenizer.json`, `tokenizer_config.json` and `chat_template.jinja` next to them.
2. `uv sync` in the repo.
3. The experts as contiguous per-expert records (a byte-for-byte copy of the GGUF's expert
   tensors, read back and verified; ~55 GB):

   ```bash
   export FTMETAL_MOE_DERIVED_ROOT=/path/to/ftm_derived
   G=/path/to/UD-IQ4_XS
   uv run python tools/repack_expert_records.py $G
   ```

4. Optional, the MTP head for lossless speculative decoding (the numbers in the PR use it; it
   only drafts, the verified tokens are the GGUF model's). The GGUF has no MTP tensors; the head
   is rebuilt from the MLX `Qwen3.8-Flash-Next-MTP-4bit` checkpoint, its routed experts
   re-quantized from the original bf16 checkpoint's `mtp.*` tensors, and found under
   `$FTMETAL_MOE_DERIVED_ROOT/Qwen3.8-Flash-Next-MTP-4bit/`:

   ```bash
   # the second argument: the bf16 checkpoint's safetensors shard holding mtp.layers.0.mlp.experts.*
   uv run python tools/requant_mtp_experts.py /path/to/Qwen3.8-Flash-Next-MTP-4bit /path/to/bf16/model-000NN-of-000MM.safetensors
   ```

   Without it the engine decodes without MTP drafts.

Keep `FTMETAL_MOE_DERIVED_ROOT` set when running the benchmark.

## Run

```bash
export FTMETAL_MOE_DERIVED_ROOT=/path/to/ftm_derived
python3 bench/gguf/run.py --gguf $G --label mine           # full run, ~50 min
python3 bench/gguf/run.py --gguf $G --quick --label try    # one session; decode + 4K prefill
```

The run purges the page cache first (`sudo -n purge`; allow it passwordless, or the times are
optimistic). Keep the machine otherwise idle: decode is sensitive to CPU contention (a compile in
the background costs ~10% at long context). Results go to `bench/gguf/runs/<run_id>/`
(`record.json`, `driver.log`, `serve.log`, `speed_suite.json`, `pelican/storyboard.html`); the
last line printed is `score`.

## Measuring another engine

`speed_suite.py` and `pelican_client.py` talk to any OpenAI-compatible server
(`/v1/chat/completions`, streamed), so another engine gets the same requests:

```bash
python3 bench/gguf/speed_suite.py --port 8080 --corpus bench/gguf/longctx_corpus.txt --out other.json
python3 bench/gguf/pelican_client.py other_pelican --port 8080 --effort medium --max-tokens 48000
```

Write its numbers in the format of `strata_baseline.json` and pass `--baseline other_baseline.json`.

## Reference (EC2 Mac M4 Pro 48 GB, macOS 26.7, one full run on this branch)

| | Strata `7dd5cf1` | this PR |
|---|---|---|
| Decode, short prompt | 12.99 tok/s | 28.54 tok/s |
| Prefill 4K / 32K | 100.7 / 95.9 tok/s | 343.7 / 370.6 tok/s |
| Prefill ~250K | 94.9 tok/s | 357.3 tok/s |
| Decode after ~250K | 10.25 tok/s | 27.69 tok/s |
| score | | 2.82 |

## Files

- `run.py`: runs both phases, applies the gates, scores against the baseline.
- `traces_iq3s.json`: the sessions, decode prompt, probes and llama.cpp's reference log-probs.
- `speed_suite.py`, `pelican_client.py`, `longctx_corpus.txt` (Python standard-library source,
  the long documents' filler): the serving phase.
- `strata_baseline.json`: Strata's numbers on the same Mac, file and requests.
