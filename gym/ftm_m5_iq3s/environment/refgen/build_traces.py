"""Replace a traces file's llama.cpp reference (ref_ids, ref_lps, margins, reference) with teacher_force output."""
import json, sys
src, out_txt, dst, reference = sys.argv[1:5]
d = json.load(open(src))
groups = {g["name"]: g for g in [d["warmup"], d["decode"]] + d["sessions"]}
rows = {}
for line in open(out_txt):
    f = line.split()
    rows[(f[0], int(f[1]))] = (list(map(int, f[2::2])), list(map(float, f[3::2])))
for name, g in groups.items():
    for t, turn in enumerate(g["turns"]):
        start = len(turn["input_ids"]) - 1
        ids, lps = zip(*(rows[(f"{name}:{t}", start + r)] for r in range(len(turn["response"]))))
        turn["ref_ids"], turn["ref_lps"] = [list(x) for x in ids], [list(x) for x in lps]
        turn["margins"] = [x[0] - x[1] for x in lps]
d["reference"] = reference
json.dump(d, open(dst, "w"))
print("positions:", len(rows))
