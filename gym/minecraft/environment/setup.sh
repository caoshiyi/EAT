#!/bin/bash
# Environment of minecraft. Run after fetch_task.sh copied workspace/ into $EAT_ROOT:
#     (cd $EAT_ROOT && source eat/env.sh && bash <task>/environment/setup.sh)
set -euo pipefail
: "${EAT_ROOT:?}"
cd "$EAT_ROOT"
uv venv -q --python 3.12 "$EAT_VENV"           # the tools need Python 3.10+ (macOS ships 3.9)
source "$EAT_VENV/bin/activate"
bash "$EAT_ROOT/tasks/minecraft/setup.sh"    # vanilla 1.20.4 server under .work/mc, its configuration, node deps
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init -q -b main
git -c user.name=eat-gym -c user.email=eat-gym@localhost add -A
git -c user.name=eat-gym -c user.email=eat-gym@localhost commit -q -m "start state of minecraft" || true
echo "ENV_READY minecraft"
