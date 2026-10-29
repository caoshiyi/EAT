"""Write teacher_force input lines from a traces file (every turn of warmup, decode and the sessions)."""
import json, sys
traces, out, only = sys.argv[1], sys.argv[2], (sys.argv[3].split(",") if len(sys.argv) > 3 else None)
d = json.load(open(traces))
groups = [d["warmup"], d["decode"]] + d["sessions"]
with open(out, "w") as f:
    for g in groups:
        if only and g["name"] not in only:
            continue
        for t, turn in enumerate(g["turns"]):
            tokens = turn["input_ids"] + turn["response"]
            start, end = len(turn["input_ids"]) - 1, len(tokens) - 1
            f.write(f"{g['name']}:{t} {start} {end} {len(tokens)} " + " ".join(map(str, tokens)) + "\n")
