#!/bin/bash
# Official eval of ftm_m5_iq4: correctness against llama.cpp, the serving speed suite, the cache-invariance check and the
# test suite. The last line is "SCORE: <x>" (0 if any gate fails). One model at a time: it takes /tmp/ftm_bench.lock.
cd "$(dirname "$0")/.."
source eat/env.sh
LOG=$(mktemp); trap 'rm -f "$LOG"' EXIT
python3 tools/eval_ftm_m5_iq4.py --repo "$EAT_ROOT" "$@" 2>&1 | tee "$LOG"
python3 - "$LOG" <<'PY'
import re, sys
m = re.findall(r"^score = ([0-9.]+)", open(sys.argv[1]).read(), re.M)
print(f"SCORE: {float(m[-1]) if m else 0.0}")
PY
