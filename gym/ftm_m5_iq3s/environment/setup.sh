#!/bin/bash
# Environment of ftm_m5_iq3s on a bare-metal Mac (Apple M5 Pro, 48 GB, macOS 26). Run from the task directory after
# fetch_task.sh copied workspace/ into $EAT_ROOT:  (cd $EAT_ROOT && source eat/env.sh && bash <task>/environment/setup.sh)
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
: "${EAT_ROOT:?}" "${EAT_MODELS:?}" "${FTMETAL_MOE_DERIVED_ROOT:?}"
mkdir -p "$EAT_WORK" "$EAT_MODELS"
# 1. The engine at the start state (https://github.com/caoshiyi/FreeToken-metal @ 95c2d598275ed52733cd780e2305260403a109d6), under the task files already in $EAT_ROOT.
cd "$EAT_ROOT"
[ -d .git ] || git init -q -b main
git fetch -q --depth 1 https://github.com/caoshiyi/FreeToken-metal 95c2d598275ed52733cd780e2305260403a109d6
git -c advice.detachedHead=false checkout -q FETCH_HEAD -- .
git fetch -q https://github.com/caoshiyi/FreeToken-metal m5/gguf:m5/gguf       # the earlier GGUF engine that program.md points to
uv sync
# 2. llama.cpp at the reference commit (read-only for the agents; the correctness traces were made with it).
while read -r n url c; do d=$EAT_REFS/$n; mkdir -p "$d"; [ -d "$d/.git" ] || git init -q "$d"
    git -C "$d" fetch -q --depth 1 "$url" "$c"; git -C "$d" -c advice.detachedHead=false checkout -q FETCH_HEAD; done < "$HERE/refs.txt"
# 3. The GGUF (ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF), with the original model's config and tokenizer beside it.
uvx --from huggingface_hub hf download ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF --include "*IQ3_S*" --local-dir "$EAT_MODELS/.dl_ftm_m5_iq3s"
mkdir -p "$FTM_GGUF_IQ3S" && find "$EAT_MODELS/.dl_ftm_m5_iq3s" -name '*.gguf' -exec ln -sf {} "$FTM_GGUF_IQ3S/" \;
uvx --from huggingface_hub hf download Qwen/Qwen3.8-Flash-Next config.json generation_config.json tokenizer.json \
    tokenizer_config.json chat_template.jinja --local-dir "$FTM_GGUF_IQ3S"
# 4. The experts as one contiguous record per expert (byte-for-byte copy of the GGUF's expert tensors, verified).
uv run python tools/repack_expert_records.py "$FTM_GGUF_IQ3S"
# 5. The MTP head (drafts only; see environment/README.md): tools/requant_mtp_experts.py on the MLX MTP-4bit checkpoint.
# 6. The start state, committed.
git -c user.name=eat-gym -c user.email=eat-gym@localhost add -A
git -c user.name=eat-gym -c user.email=eat-gym@localhost commit -q -m "start state of ftm_m5_iq3s" || true
echo "ENV_READY ftm_m5_iq3s"
