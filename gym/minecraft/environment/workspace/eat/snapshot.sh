#!/bin/bash
# The world snapshot the supervisor reads after each team.
cd "$(dirname "$0")/.." && source eat/env.sh
exec python3 tools/mc_snapshot.py
