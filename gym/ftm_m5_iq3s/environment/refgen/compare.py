"""Compare teacher_force output with a traces file's ref_ids/ref_lps (top-1 agreement, KL over the shared top-K)."""
import json, math, sys
d = json.load(open(sys.argv[1])); out = sys.argv[2]
groups = {g["name"]: g for g in [d["warmup"], d["decode"]] + d["sessions"]}
same = total = 0; kls = []; maxdiff = 0.0
for line in open(out):
    f = line.split(); gid, pos = f[0], int(f[1]); ids = list(map(int, f[2::2])); lps = list(map(float, f[3::2]))
    name, t = gid.rsplit(":", 1); turn = groups[name]["turns"][int(t)]
    r = pos - (len(turn["input_ids"]) - 1)
    ref_ids, ref_lps = turn["ref_ids"][r], turn["ref_lps"][r]
    total += 1; same += ids[0] == ref_ids[0]
    mine = dict(zip(ids, lps)); kl = 0.0
    for i, lp in zip(ref_ids, ref_lps):
        if i in mine:
            kl += math.exp(lp) * (lp - mine[i]); maxdiff = max(maxdiff, abs(lp - mine[i]))
    kls.append(kl)
kls.sort()
print(f"{total} positions: top-1 same {same}/{total}, KL(ref||mine) over shared top-K mean {sum(kls)/len(kls):.5f} p99 {kls[int(0.99*(len(kls)-1))]:.5f}, max |dlogprob| {maxdiff:.4f}")
