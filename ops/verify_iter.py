"""Independent re-run of iteration N's committed kernel on an idle allowed GPU: three official evals plus the task's
optional extra check (EAT_VERIFY_EXTRA, a shell command that must print "ALL PASS"). Passing reads are appended to
$EAT_WORK/verified_auto.json at the time of N's last ship.

Usage: python ops/verify_iter.py N   (reads EAT_ROOT, EAT_TASK, EAT_WORK, EAT_VENV, EAT_CACHE from ops/env.sh)
"""

import json
import os
import re
import subprocess
import sys

N = int(sys.argv[1])
REPO = os.environ["EAT_ROOT"]
TASK = os.environ["EAT_TASK"]
WORK = os.environ["EAT_WORK"]
OUT = f"{WORK}/verified_auto.json"
WT = f"{WORK}/verify_auto{N}"
ENV = (f"source {os.environ['EAT_VENV']}/bin/activate && export TRITON_CACHE_DIR={os.environ['EAT_CACHE']}/triton"
       f" && G=$(MAX_WAIT=1800 {REPO}/ops/pick_eval_gpu.sh) && echo GPU=$G && export HIP_VISIBLE_DEVICES=$G CUDA_VISIBLE_DEVICES=$G")
EXTRA = os.environ.get("EAT_VERIFY_EXTRA", "")


def sh(cmd):
    return subprocess.run(["bash", "-c", cmd], capture_output=True, text=True).stdout


log = sh(f"git -C {REPO} log --format='%H|%ci|%s'").splitlines()
commit = next(line.split("|")[0] for line in log if re.search(rf"\|iter {N}: ", line))
ships = [line.split("|")[1][:19].replace(" ", "T") for line in log if re.search(rf"build{N}: ship ", line)]
end = next(line.split("|")[1][:19].replace(" ", "T") for line in log if re.search(rf"\|iter {N}: ", line))
t = max(ships) if ships else end

# Untracked prebuilt baselines (e.g. sota/*.so) are copied into the worktree.
sh(f"git -C {REPO} worktree remove --force {WT} 2>/dev/null; git -C {REPO} worktree add -q --detach {WT} {commit} && "
   f"for f in {REPO}/tasks/{TASK}/sota/*.so; do [ -e \"$f\" ] && cp \"$f\" {WT}/tasks/{TASK}/sota/; done")
reads, ok = [], True
for _ in range(3):
    out = sh(f"cd {WT} && {ENV} && python tools/eval_{TASK}.py")
    m = re.search(r"mean_vs_base = ([\d.]+)", out)
    passed = bool(re.search(r"SUMMARY: (\d+)/\1 workloads passed", out))
    ok &= bool(m) and passed
    if m:
        reads.append(float(m.group(1)))
    print(re.findall(r"GPU=\d+", out), "passed" if passed else "FAILED", m.group(1) if m else None)
if EXTRA:
    extra = sh(f"cd {WT} && {ENV} && {EXTRA}")
    ok &= "ALL PASS" in extra
    print("extra check", "ALL PASS" if "ALL PASS" in extra else "FAILED")
sh(f"git -C {REPO} worktree remove --force {WT}")

data = json.load(open(OUT)) if os.path.exists(OUT) else []
kept = [r for r in reads if r >= 0.98 * max(reads)] if reads else []  # a read > 2 % below the best one had a co-tenant
if ok:
    data += [[t, r] for r in kept]
    json.dump(data, open(OUT, "w"))
print(f"iter {N} commit {commit[:8]} at {t}: {'VERIFIED' if ok else 'NOT VERIFIED'} reads {reads}, kept {kept}")
