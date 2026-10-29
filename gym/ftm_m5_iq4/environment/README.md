# Environment of `ftm_m5_iq4`

What the EAT run had, rebuilt by `setup.sh` on a bare-metal Mac (no container: the task needs the Mac's GPU and SSD).

| component | version |
|---|---|
| machine | Apple MacBook Pro, M5 Pro (20-core GPU with matrix units), 48 GB unified memory, internal SSD |
| OS | macOS 26.7, Xcode Command Line Tools |
| Python | CPython 3.13 via `uv`, the engine's `uv.lock` (mlx pinned) |
| engine | FreeToken-metal (https://github.com/caoshiyi/FreeToken-metal) at `4e6acbe1621c` |
| model | `unsloth/Qwen3.8-Flash-Next-GGUF` (UD-IQ4_XS/*) plus Qwen/Qwen3.8-Flash-Next's config and tokenizer |
| reference | llama.cpp `fae9ac5` (`refs.txt`), CPU build; the correctness traces in `harness/gguf/traces_iq4.json` |

Disk: ~200 GB for the GGUF, the expert records and the MTP head; keep 150 GB free besides.

The MTP head (lossless speculative decoding; the run used it): the GGUF has no MTP tensors. The head is the MLX
`Qwen3.8-Flash-Next-MTP-4bit` checkpoint (mlx-vlm 0.7.10 `split_mtp` of the upstream `mtp.*` tensors, 4-bit, group 32)
with its routed experts re-quantized from the bf16 `mtp.*` tensors:
`uv run python tools/requant_mtp_experts.py <MTP-4bit dir> <bf16 shard with mtp.layers.0.mlp.experts.*>`, written under
`$FTMETAL_MOE_DERIVED_ROOT/Qwen3.8-Flash-Next-MTP-4bit/`. Without it the engine decodes without drafts.

Machine rules the run followed: one model process at a time (`/tmp/ftm_bench.lock`); a memory watchdog that sends SIGTERM
at 42 GiB wired or under 1 GiB available; never `kill -9` a model process; the laptop on AC power, `caffeinate -is`.
The machine's speed drifts 5-10% per hour, which is why landing needs a same-hour control.
