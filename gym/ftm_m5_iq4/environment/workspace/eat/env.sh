# Environment of ftm_m5_iq4, sourced before the agents, the eval and environment/setup.sh run.
export EAT_ROOT="${EAT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)}"
export EAT_WORK="${EAT_WORK:-$EAT_ROOT/.work}"
export EAT_REFS="${EAT_REFS:-$EAT_WORK/refs}"
export EAT_MODELS="${EAT_MODELS:-$HOME/models}"            # the GGUF and its derived files (~200 GB)
export FTM_REPO="$EAT_ROOT"                                # the engine is this repository
export FTM_GGUF_IQ4="${FTM_GGUF_IQ4:-$EAT_MODELS/Qwen3.8-Flash-Next-UD-IQ4_XS}"
export FTMETAL_MOE_DERIVED_ROOT="${FTMETAL_MOE_DERIVED_ROOT:-$EAT_MODELS/ftm_derived}"
export FTM_MOE_HOST_TIER_LOCK=0 UV_PYTHON=3.13 MLX_ENABLE_TF32=0
# macOS has no GNU timeout; the harness's shim (EAT ops/macbin) is put first on PATH when it exists.
[ -n "${EAT_HOME:-}" ] && [ -d "$EAT_HOME/ops/macbin" ] && export PATH="$EAT_HOME/ops/macbin:$PATH"
