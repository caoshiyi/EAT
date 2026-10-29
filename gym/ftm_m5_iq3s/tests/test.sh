#!/bin/bash
# Verifier of ftm_m5_iq3s: put the protected eval, harness and baselines back over the agent's copy, run the official eval and
# write $L/reward.json (reward = the score, 0 if any gate fails).
set -uo pipefail
L=${L:-/logs/verifier}; mkdir -p "$L"
cd "${EAT_ROOT:?}"
cp -a "$(dirname "$0")/protected/." .
bash eat/eval.sh 2>&1 | tee "$L/eval.log"
python3 -c "import re,json,sys; m=re.findall(r'^SCORE: ([0-9.]+)', open('$L/eval.log').read(), re.M); json.dump({'reward': float(m[-1]) if m else 0.0}, open('$L/reward.json','w'))"
