#!/bin/bash
# Exit 0 when the task is finished; the harness then ends the run.
cd "$(dirname "$0")/.." && source eat/env.sh
python3 tools/eval_minecraft.py | grep -q "^dragon = 1"
