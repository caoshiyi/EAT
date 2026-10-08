# Node-specific settings shared by the launcher and ops scripts. Source it (or export the same variables) before running.
export EAT_ROOT="${EAT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"   # this repository
export EAT_WORK="${EAT_WORK:-$EAT_ROOT/.work}"          # run logs, verification output, caches
export EAT_REFS="${EAT_REFS:-$EAT_WORK/refs}"           # reference repos the agents may read (see tasks/*/refs.txt)
export EAT_VENV="${EAT_VENV:-$EAT_WORK/venv}"           # python env with torch for the task
export EAT_CACHE="${EAT_CACHE:-$EAT_WORK/cache}"
export EAT_TASK="${EAT_TASK:-amd_kda_mi350x}"
export EAT_LOG="${EAT_LOG:-$EAT_WORK/eat_$EAT_TASK.log}"     # tee target of launch_stateless.sh
export EAT_SESSION="${EAT_SESSION:-eat_$EAT_TASK}"           # tmux session prefix of the run
export EAT_GPUS="${EAT_GPUS:-0}"                             # GPUs the run may use, in preference order (HIP/CUDA numbering)
mkdir -p "$EAT_WORK" "$EAT_CACHE"
