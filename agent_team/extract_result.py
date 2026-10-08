#!/usr/bin/env python3
"""Extract .result text from claude --print --output-format json output."""
import json, sys

path = sys.argv[1]
with open(path) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            d = json.loads(line)
            text = d.get('result', '') or d.get('content', '') or d.get('text', '') or ''
            print(text)
            sys.exit(0)
        except json.JSONDecodeError:
            continue
sys.exit(1)
