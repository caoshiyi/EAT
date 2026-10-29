#!/usr/bin/env python3
"""
Lossless check for tasks/ftm_m5_agentic: the engine's outputs must not depend on its expert cache.

Every lossless optimization of an expert-offload engine (kernels, read paths, scheduling, caching policy) computes
the same function whatever experts happen to be resident; an approximation that skips, substitutes or truncates
work where the cache misses does not. This replays the first recorded session and the decode benchmark of
$FTM_REPO/bench/agentic teacher-forced twice, with the engine's default expert cache and with a much smaller one,
and requires the predicted tokens and the recorded log-probabilities (5 decimals) to be identical at every response
position. A whole-model KL threshold cannot make this distinction: two correct attention implementations already
differ by a mean KL of ~0.025 here, more than a cache-dependent approximation adds.

Usage:
    python tools/check_lossless_ftm_m5.py [--repo DIR] [--small-cache 6000]
Prints `lossless = 1` (identical) or `lossless = 0` with the first differing positions.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

LOCK = Path("/tmp/ftm_bench.lock")
# Runs the checkout's own driver with every EngineConfig given a fixed expert cache size.
PATCHED_DRIVER = """
import runpy, sys
import ftmetal.engine.config as config
original = config.EngineConfig
def sized(*args, **kwargs):
    kwargs.setdefault("moe_cache_size", SIZE)
    return original(*args, **kwargs)
config.EngineConfig = sized
sys.argv = [DRIVER] + sys.argv[1:]
runpy.run_path(DRIVER, run_name="__main__")
"""


def run_driver(repo: Path, harness: Path, trace: Path, model: str, out: Path, cache_size: int | None) -> None:
    driver = harness / "driver.py"
    python = str(repo / ".venv" / "bin" / "python")
    args = ["eval", "--model", model, "--trace", str(trace), "--out", str(out),
            "--sessions", "1", "--no-probes"]
    if cache_size is None:
        cmd = [python, str(driver), *args]
    else:
        source = PATCHED_DRIVER.replace("SIZE", str(cache_size)).replace("DRIVER", repr(str(driver)))
        cmd = [python, "-c", source, *args]
    env = {key: value for key, value in os.environ.items() if key != "FTMETAL_FPREFILL_MMA"}
    result = subprocess.run(cmd, cwd="/tmp", env=env, capture_output=True, text=True)
    if result.returncode != 0 or not out.exists():
        sys.exit(f"driver failed (cache {cache_size}):\n{result.stdout[-2000:]}\n{result.stderr[-2000:]}")


def response_positions(result: dict) -> list[tuple[str, list[int], list[list[float]]]]:
    turns = [(f"{s['name']} turn {i}", t) for s in result["sessions"] for i, t in enumerate(s["turns"])]
    decode = result.get("decode")
    if decode:
        turns += [(f"{decode['name']} turn {i}", t) for i, t in enumerate(decode["turns"])]
    return [(name, t["predicted"], t["cand_lps"]) for name, t in turns]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=os.environ.get("FTM_REPO"))
    parser.add_argument("--small-cache", type=int, default=6000, help="expert slots of the second run")
    parser.add_argument("--harness", default=None, help="the bench/agentic copy (default: the repo's)")
    parser.add_argument("--model", default=os.environ.get("FTM_QWEN4_MODEL"))
    parser.add_argument("--trace", default=None, help="the trace to replay (default: the harness's traces.json)")
    args = parser.parse_args()
    model = args.model
    if not args.repo or not model or not os.environ.get("FTMETAL_MOE_DERIVED_ROOT"):
        sys.exit("set FTM_REPO, FTM_QWEN4_MODEL and FTMETAL_MOE_DERIVED_ROOT (agent_team/requirements)")
    repo = Path(args.repo)
    harness = Path(args.harness) if args.harness else repo / "bench" / "agentic"
    trace = Path(args.trace) if args.trace else harness / "traces.json"
    with tempfile.TemporaryDirectory() as tmp, open(LOCK, "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        runs = {}
        for name, size in [("default cache", None), (f"{args.small_cache}-slot cache", args.small_cache)]:
            out = Path(tmp) / f"{'small' if size else 'default'}.json"
            run_driver(repo, harness, trace, model, out, size)
            runs[name] = response_positions(json.loads(out.read_text()))
            print(f"{name}: {sum(len(p) for _, p, _ in runs[name])} response positions", flush=True)
    (name_a, a), (name_b, b) = runs.items()
    differences = []
    for (turn, pred_a, lps_a), (_, pred_b, lps_b) in zip(a, b, strict=True):
        for position, (pa, pb, la, lb) in enumerate(zip(pred_a, pred_b, lps_a, lps_b, strict=True)):
            if pa != pb or la != lb:
                gap = max(abs(x - y) for x, y in zip(la, lb, strict=True))
                differences.append((turn, position, pa, pb, gap))
    total = sum(len(p) for _, p, _ in a)
    if differences:
        flips = sum(1 for d in differences if d[2] != d[3])
        print(f"{len(differences)} of {total} positions differ between the {name_a} and the {name_b} "
              f"({flips} predicted tokens change); first: ")
        for turn, position, pa, pb, gap in differences[:5]:
            print(f"  {turn} position {position}: predicted {pa} vs {pb}, max log-prob gap {gap:.5f}")
        print("lossless = 0")
        return 1
    print(f"all {total} positions identical between the {name_a} and the {name_b}")
    print("lossless = 1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
