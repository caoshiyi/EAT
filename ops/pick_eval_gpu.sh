#!/bin/bash
# Print the index of an idle GPU from $EAT_GPUS (in that order) for the official eval.
# Idle = GPU use < 5 % and memory < 5 % on two samples 5 s apart. Waits up to MAX_WAIT seconds for one, then falls back to the
# least-busy allowed GPU. On AMD, HIP and rocm-smi numbering can differ: set EAT_ROCM_MAP="hip:rocm ..." (e.g. "0:3 3:1"),
# matched by PCI bus; unmapped indices are taken as equal.
MAX_WAIT=${MAX_WAIT:-1800}
read -r -a ORDER <<<"${EAT_GPUS:-0}"
declare -A ROCM=()
for p in ${EAT_ROCM_MAP:-}; do ROCM[${p%%:*}]=${p##*:}; done

load() {  # prints "use mem" (percent) for a device index
    if command -v rocm-smi >/dev/null; then
        rocm-smi -d "${ROCM[$1]:-$1}" --showuse --showmemuse 2>/dev/null | awk -F: '/GPU use/{u=$NF} /VRAM%/{v=$NF} END{gsub(/ /,"",u); gsub(/ /,"",v); print u+0, v+0}'
    else
        nvidia-smi -i "$1" --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits | awk -F', ' '{print $1+0, int(100*$2/$3)}'
    fi
}

start=$(date +%s)
while true; do
    for h in "${ORDER[@]}"; do
        read -r u1 v1 <<<"$(load "$h")"
        if [ "$u1" -lt 5 ] && [ "$v1" -lt 5 ]; then
            sleep 5
            read -r u2 v2 <<<"$(load "$h")"
            if [ "$u2" -lt 5 ] && [ "$v2" -lt 5 ]; then
                echo "[pick_eval_gpu] GPU $h idle (use $u1/$u2 %, mem $v1/$v2 %)" >&2
                echo "$h"; exit 0
            fi
        fi
    done
    [ $(( $(date +%s) - start )) -ge "$MAX_WAIT" ] && break
    sleep 30
done
best=""; bs=999
for h in "${ORDER[@]}"; do
    read -r u v <<<"$(load "$h")"
    [ $(( u + v )) -lt "$bs" ] && { bs=$(( u + v )); best=$h; }
done
echo "[pick_eval_gpu] no idle GPU after ${MAX_WAIT}s; using least-busy GPU $best (use+mem $bs)" >&2
echo "$best"
