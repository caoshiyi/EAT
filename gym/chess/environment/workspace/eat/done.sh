#!/bin/bash
# Exit 0 when the task is finished; the harness then ends the run.
cd "$(dirname "$0")/.." && source eat/env.sh
python tools/eval_chess.py --done
