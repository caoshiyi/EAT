#!/bin/bash
# Run a command inside the clean-room sandbox (bubblewrap): no network except the Anthropic allowlist proxy, and a
# filesystem with only whitelisted paths (system dirs, CUDA, the clean repo + venv, the allowed reference sources, gpu_run).
# Anything not listed (post-cutoff libraries, other runs' transcripts, caches, other users' disks) is not visible.
#     cleanroom/sandbox.sh <command ...>
# Configuration (environment):
#   EAT_CLEAN         clean-room root holding k-search-v2/ (the harness clone), venv/, bin/ (copies of this directory)
#   EAT_ALLOWED_RO    space-separated host paths mounted read-only at the same location (allowed sources)
#   EAT_LOCKS         gpu_run lock directory (shared with runs outside the sandbox)
#   EAT_GPUS          GPUs gpu_run may hand out, comma-separated
#   CUDA_HOME, TORCH_CUDA_ARCH_LIST, CLAUDE_SHARE (dir of the installed claude binary, if outside $EAT_CLEAN)
set -euo pipefail
C=${EAT_CLEAN:?set EAT_CLEAN}
EAT_BIN=$(cd "$(dirname "$0")/../ops" && pwd)
SOCK=$C/run/proxy.sock
mkdir -p $C/run $C/home $C/tmp $C/claude-config "${EAT_LOCKS:?set EAT_LOCKS}"
if ! [ -S "$SOCK" ] || ! pgrep -f "allowlist_proxy.py --socket $SOCK" >/dev/null; then
    nohup python3 $C/bin/allowlist_proxy.py --socket $SOCK --log $C/run/proxy.log >/dev/null 2>&1 &
    for _ in $(seq 50); do [ -S "$SOCK" ] && break; sleep 0.1; done
fi

args=(
    --ro-bind /usr /usr --symlink usr/bin /bin --symlink usr/lib /lib --symlink usr/lib64 /lib64
    --symlink usr/sbin /sbin --ro-bind /etc /etc --ro-bind /sys /sys
    --dev-bind /dev /dev --proc /proc --tmpfs /tmp --tmpfs /run
    --unshare-net --unshare-ipc --unshare-uts --die-with-parent
    --ro-bind "$EAT_BIN/gpu_run" "$EAT_BIN/gpu_run"
    --bind "$EAT_LOCKS" "$EAT_LOCKS"
    --bind $C $C
    --ro-bind $C/venv $C/venv
    --ro-bind $C/bin $C/bin
    --chdir $C/k-search-v2
    --clearenv
    --setenv HOME $C/home --setenv USER eat --setenv LANG C.UTF-8 --setenv TERM xterm
    --setenv PATH "$C/venv/bin:$C/bin:$EAT_BIN:${CUDA_HOME:-/usr/local/cuda}/bin:/usr/bin:/bin"
    --setenv CUDA_HOME "${CUDA_HOME:-/usr/local/cuda}" --setenv LD_LIBRARY_PATH "${CUDA_HOME:-/usr/local/cuda}/lib64"
    --setenv VIRTUAL_ENV $C/venv
    --setenv TMPDIR $C/tmp --setenv XDG_CACHE_HOME $C/home/.cache
    --setenv TRITON_CACHE_DIR $C/home/.cache/triton --setenv TORCH_EXTENSIONS_DIR $C/home/.cache/torch_extensions
    --setenv CUTE_DSL_CACHE_DIR $C/home/.cache/cute_dsl
    --setenv TORCH_CUDA_ARCH_LIST "${TORCH_CUDA_ARCH_LIST:-10.0a}" --setenv MAX_JOBS 32
    --setenv CLAUDE_CONFIG_DIR $C/claude-config --setenv CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC 1
    --setenv HTTPS_PROXY http://127.0.0.1:18080 --setenv HTTP_PROXY http://127.0.0.1:18080
    --setenv https_proxy http://127.0.0.1:18080 --setenv http_proxy http://127.0.0.1:18080
    --setenv NO_PROXY localhost,127.0.0.1 --setenv no_proxy localhost,127.0.0.1
    --setenv GPU_GUARD_GPUS "${EAT_GPUS:-0}" --setenv GPU_GUARD_LOCK_DIR "$EAT_LOCKS"
)
[ -d /run/nvidia-persistenced ] && args+=(--ro-bind /run/nvidia-persistenced /run/nvidia-persistenced)
[ -n "${CLAUDE_SHARE:-}" ] && args+=(--ro-bind "$CLAUDE_SHARE" "$CLAUDE_SHARE")
for p in ${EAT_ALLOWED_RO:-}; do args+=(--ro-bind "$p" "$p"); done
for v in RESUME_SESSION_ID EVAL_CMD AGENT_TIMEOUT_ENFORCE CLAUDE_EXTRA_DISALLOWED CLAUDE_CODE_OAUTH_TOKEN; do
    [ -n "${!v:-}" ] && args+=(--setenv "$v" "${!v}")
done
exec bwrap "${args[@]}" bash -c 'python3 '"$C"'/bin/tcp2unix.py 18080 '"$SOCK"' </dev/null >/dev/null 2>&1 &
bridge=$!; sleep 0.3; "$@"; rc=$?; kill $bridge 2>/dev/null; exit $rc' sandbox "$@"
