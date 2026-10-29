#!/bin/bash
# Verifier of chess: put the protected eval and game tools back, then score the state the run left (reward = elo).
set -uo pipefail
L=${L:-/logs/verifier}; mkdir -p "$L"
cd "${EAT_ROOT:?}" && cp -a "$(dirname "$0")/protected/." .
bash eat/eval.sh 2>&1 | tee "$L/eval.log"
python3 -c "import re,json; m=re.findall(r'^SCORE: (-?[0-9.]+)', open('$L/eval.log').read(), re.M); json.dump({'reward': float(m[-1]) if m else 0.0}, open('$L/reward.json','w'))"
