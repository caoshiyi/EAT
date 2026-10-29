#!/usr/bin/env python3
"""
Evaluate the FreeToken-metal checkout $FTM_REPO (tasks/ftm_m5_iq4) on this M5 Pro.

Runs tasks/ftm_m5_iq4/harness/gguf/run.py on $FTM_GGUF_IQ4 (the UD-IQ4_XS GGUF directory): phase 1 replays the
recorded sessions teacher-forced against llama.cpp's distributions on the same GGUF, phase 2 serves the model with
`ftm serve` and runs the speed suite (short decode, ~4K / ~32K prefill, ~128K / ~250K prompts with a needle). Its
score is against tasks/ftm_m5_iq4/baseline_m5.json, the starting code's speed suite on this machine. Full runs then
apply the task's exactness gates (cache invariance, the test suite); any failure scores 0. The last line is
`score = X` (`quick_score = X` with --quick, which runs one session, the short decode and the ~4K prefill).

Usage:
    python tools/eval_ftm_m5_iq4.py --quick
    python tools/eval_ftm_m5_iq4.py [--pelican]
    python tools/eval_ftm_m5_iq4.py --baseline-only    # record the baseline (once, on the starting code)
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TASK = ROOT / "tasks" / "ftm_m5_iq4"
HARNESS = TASK / "harness"
BASELINE = TASK / "baseline_m5.json"
KNOWN_FAILURES = TASK / "known_failures.txt"
BASELINE_KEYS = {"decode": ("decode_tok_s",), "prefill_4k": ("prompt_tok_s",), "prefill_32k": ("prompt_tok_s",),
                 "long_256k": ("prompt_tok_s", "decode_tok_s")}


def gate(name: str, cmd: list[str], env: dict[str, str], marker: str) -> bool:
    """Run a check; print its own result lines; True when it passed."""
    result = subprocess.run(cmd, cwd="/tmp", env=env, capture_output=True, text=True)
    lines = [line for line in result.stdout.splitlines() if marker in line or line.startswith("INVALID")]
    print(f"[{name}] " + ("passed" if result.returncode == 0 else "FAILED"))
    for line in lines[-6:]:
        print(f"  {line}")
    output = (result.stdout + result.stderr).strip()
    if result.returncode != 0 and not lines and output:
        print(f"  {output.splitlines()[-1]}")
    return result.returncode == 0


def test_suite(python: str, repo: Path, env: dict[str, str]) -> bool:
    """The checkout's tests/: passes when every failure is a known one of this machine."""
    result = subprocess.run([python, "-m", "pytest", "-q", "-p", "no:cacheprovider", str(repo / "tests")],
                            cwd=repo, env=env, capture_output=True, text=True)
    failed = set(re.findall(r"^FAILED (\S+)", result.stdout, flags=re.MULTILINE))
    known = {line.strip() for line in KNOWN_FAILURES.read_text().splitlines() if line.strip()}
    new = sorted(failed - known)
    summary = result.stdout.strip().splitlines()[-1] if result.stdout.strip() else result.stderr.strip()[-200:]
    passed = not new and (result.returncode == 0 or failed)
    print(f"[test suite] {'passed' if passed else 'FAILED'}")
    print(f"  {summary}")
    for test in new[:6]:
        print(f"  new failure: {test}")
    return passed


def latest_run(runs: Path, label: str) -> Path:
    candidates = sorted(runs.glob(f"*_{label}"), key=lambda path: path.stat().st_mtime)
    if not candidates:
        sys.exit(f"no run directory for {label} under {runs}")
    return candidates[-1]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true")
    parser.add_argument("--pelican", action="store_true", help="also run the long pelican generation gate")
    parser.add_argument("--label", default=os.environ.get("EAT_AGENT_TAG", "eval"))
    parser.add_argument("--repo", default=os.environ.get("FTM_REPO"))
    parser.add_argument("--baseline-only", action="store_true")
    args = parser.parse_args()
    gguf = os.environ.get("FTM_GGUF_IQ4")
    if not args.repo or not gguf or not os.environ.get("FTMETAL_MOE_DERIVED_ROOT"):
        sys.exit("set FTM_REPO, FTM_GGUF_IQ4 and FTMETAL_MOE_DERIVED_ROOT (agent_team/requirements)")
    repo = Path(args.repo)
    python = str(repo / ".venv" / "bin" / "python")
    # The checkout's own defaults decide (e.g. the flash-prefill GEMM path), not the caller's shell.
    env = {key: value for key, value in os.environ.items() if key not in ("FTMETAL_FPREFILL_MMA", "PYTHONPATH")}
    runs = Path(os.environ.get("EAT_WORK", "/tmp")) / "runs_ftm_m5_iq4"
    if not args.baseline_only and not BASELINE.exists():
        sys.exit(f"{BASELINE} is missing: record it once with --baseline-only on the starting code")
    cmd = [sys.executable, str(HARNESS / "gguf" / "run.py"), "--gguf", gguf, "--repo", str(repo), "--label",
           args.label, "--runs", str(runs)]
    if not args.baseline_only:
        cmd += ["--baseline", str(BASELINE)]
    if args.quick:
        cmd.append("--quick")
    elif not args.pelican:
        cmd.append("--no-pelican")
    bench = subprocess.run(cmd, env=env, capture_output=True, text=True)
    lines = bench.stdout.splitlines()
    print("\n".join(line for line in lines if not re.match(r"^(score|partial_score) = ", line)), flush=True)
    print(bench.stderr[-3000:], end="", file=sys.stderr)
    score = 0.0
    for line in lines:
        match = re.search(r"(?:^|\s)(?:score|partial_score) = ([\d.]+)", line)
        if match:
            score = float(match.group(1))
    if args.baseline_only:
        speed = json.loads((latest_run(runs, args.label) / "speed_suite.json").read_text())
        baseline = {case: {key: speed[case][key] for key in keys} for case, keys in BASELINE_KEYS.items()}
        baseline["note"] = f"the starting code's speed suite on this M5 Pro ({repo})"
        BASELINE.write_text(json.dumps(baseline, indent=1) + "\n")
        print(f"baseline written to {BASELINE}: {json.dumps(baseline)}")
        return 0
    if not args.quick:
        passed = [
            gate("cache invariance", [sys.executable, str(ROOT / "tools" / "check_lossless_ftm_m5.py"), "--repo",
                 str(repo), "--harness", str(HARNESS / "agentic"), "--trace",
                 str(HARNESS / "gguf" / "traces_iq4.json"), "--model", gguf], env, "lossless ="),
            test_suite(python, repo, {**env, "MLX_ENABLE_TF32": "0"}),
        ]
        if not all(passed):
            print("INVALID: an exactness gate failed")
            score = 0.0
    print(f"{'quick_score' if args.quick else 'score'} = {score:.4f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
