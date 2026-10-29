#!/bin/bash
# Run by the harness right before each team starts.
cd "$(dirname "$0")/.." && source eat/env.sh
python3 tools/mc_arena.py up
