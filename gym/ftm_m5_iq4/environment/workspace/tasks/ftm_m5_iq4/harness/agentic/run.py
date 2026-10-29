#!/usr/bin/env python3
"""Agentic-serving benchmark: Qwen3.8-Flash-Next 4-bit with expert offload on a Mac.

Replays the recorded agentic traces (traces.json: a real coding-agent loop through the chat
template and the serving path's parsers, thinking on, sampled with the checkpoint's recommended
parameters) on a FreeToken-metal checkout with driver.py, teacher-forced, from a cold page cache
(sudo purge, when allowed) after one warmup session, plus upstream FreeToken's bs=1 decode
benchmark (an AIME-25 prompt, 256 tokens), and scores end-to-end time against a baseline
(naive_reference.json by default):

    mean_vs_base = mean over the timed sessions and the decode benchmark of
                   (base time / candidate time)

A run is INVALID (mean_vs_base = 0) unless:
  - every reported token is the forced one (the harness hooks hold);
  - the candidate's greedy prediction matches the naive one at >= CONFIDENT_MIN of the response
    positions where the naive top-2 log-prob margin is >= MARGIN, and at >= OVERALL_MIN of all;
  - the KL divergence from the naive next-token distribution (over the naive top-20 plus the
    rest's mass, teacher-forced) has mean <= KLD_MEAN_MAX and 99th percentile <= KLD_P99_MAX;
  - (full runs) at least PROBE_MIN of the free-running probe replies, sampled with the
    recommended parameters, are well-formed: they end, and each tool call parses into a known
    tool with its required parameters;
  - MLX peak memory <= 37 GiB and swap use grows by <= 1 GiB;
  - the engine loads in <= 5 minutes.

usage: run.py --model DIR [--repo DIR] [--quick] [--label NAME] [--baseline FILE]
              [--write-baseline] [--judge-python PY] [--no-sync]
"""

from __future__ import annotations

import argparse
import fcntl
import json
import math
import os
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
TRACE = HERE / "traces.json"
DRIVER = HERE / "driver.py"
PROBE_CHECK = HERE / "probe_check.py"
LOCK = Path("/tmp/ftm_bench.lock")
MARGIN = 1.0
CONFIDENT_MIN = 0.98
OVERALL_MIN = 0.94
KLD_MEAN_MAX = 0.06
KLD_P99_MAX = 0.9
PROBE_MIN = 2
PEAK_GIB_MAX = 37.0
LOAD_S_MAX = 300
SWAP_GROWTH_MAX_MIB = 1024
QUICK_SESSIONS = 1


def log(msg: str) -> None:
    print(msg, flush=True)


def swap_used_mib() -> float:
    out = subprocess.run(["sysctl", "-n", "vm.swapusage"], capture_output=True, text=True).stdout
    m = re.search(r"used = ([\d.]+)M", out)
    return float(m.group(1)) if m else 0.0


def stale_extension(repo: Path) -> bool:
    """True when a C++/Metal source is newer than the built extension it belongs to."""
    for src_dir, ext_dir in [
        ("python/ftmetal/kernel", "python/ftmetal/kernel"),
        ("python/ftmetal/command_graph", "python/ftmetal/command_graph"),
    ]:
        sos = list((repo / ext_dir).glob("_C*.so"))
        if not sos:
            return True
        built = min(so.stat().st_mtime for so in sos)
        for path in (repo / src_dir).rglob("*"):
            if path.suffix in {".cpp", ".h", ".metal", ".txt", ".cmake"} and (
                path.stat().st_mtime > built
            ):
                return True
    return False


def sync(repo: Path) -> None:
    env = {**os.environ, "PATH": "/opt/homebrew/bin:" + os.environ.get("PATH", "")}
    cmd = ["uv", "sync", "-q"]
    if stale_extension(repo):
        log("C++/Metal sources changed since the last build: rebuilding the extensions")
        cmd += ["--reinstall-package", "ftmetal"]
    subprocess.run(cmd, cwd=repo, env=env, check=True)


def kld(ref_lps: list[float], cand_lps: list[float]) -> float:
    """KL(naive || candidate) at one position over the naive top-k tokens plus the rest's mass."""
    p = [math.exp(x) for x in ref_lps]
    q = [math.exp(x) for x in cand_lps]
    p_rest = min(max(1 - sum(p), 1e-9), 1)
    q_rest = min(max(1 - sum(q), 1e-9), 1)
    head = sum(pi * (lr - lq) for pi, lr, lq in zip(p, ref_lps, cand_lps))
    return max(head + p_rest * math.log(p_rest / q_rest), 0.0)


def agreement(trace: dict, result: dict) -> dict:
    total = matched = confident = confident_matched = 0
    forced_ok = True
    klds = []
    for session, run in zip(timed_sessions(trace, result), result["sessions"]):
        for turn, rec in zip(session["turns"], run["turns"]):
            forced_ok &= bool(rec["forced_ok"])
            for ids, lps, margin, got, cand in zip(turn["ref_ids"], turn["ref_lps"],
                                                   turn["margins"], rec["predicted"],
                                                   rec["cand_lps"]):
                same = ids[max(range(len(lps)), key=lps.__getitem__)] == got
                total += 1
                matched += same
                if margin >= MARGIN:
                    confident += 1
                    confident_matched += same
                klds.append(kld(lps, cand))
    klds = klds or [0.0]
    return {
        "forced_ok": forced_ok,
        "positions": total,
        "overall": matched / max(total, 1),
        "confident_positions": confident,
        "confident": confident_matched / max(confident, 1),
        "kld_mean": sum(klds) / len(klds),
        "kld_p99": pct(klds, 99),
        "kld_max": max(klds),
    }


def timed_sessions(trace: dict, result: dict) -> list[dict]:
    by_name = {s["name"]: s for s in [*trace["sessions"], trace["decode"]]}
    return [by_name[s["name"]] for s in result["sessions"]]


def pct(values: list[float], q: float) -> float:
    """The q-th percentile, linearly interpolated (numpy's default)."""
    if not values:
        return 0.0
    v = sorted(values)
    k = (len(v) - 1) * q / 100
    lo = math.floor(k)
    return v[lo] + (v[min(lo + 1, len(v) - 1)] - v[lo]) * (k - lo)


def summarize(result: dict) -> dict:
    agentic = [s for s in result["sessions"] if s["name"] != "decode_aime25"]
    turns = [t for s in agentic for t in s["turns"]]
    first = [s["turns"][0]["ttft_s"] for s in agentic]
    later = [t["ttft_s"] for s in agentic for t in s["turns"][1:]]
    prompt = sum(t["prompt_tokens"] for t in turns)
    cached = sum(t["cached_tokens"] or 0 for t in turns)
    ttft = sum(t["ttft_s"] for t in turns)
    decode_steps = sum(max(t["generated"] - 1, 0) for t in turns)
    decode_s = sum(t["decode_s"] for t in turns)
    out = {
        "wall_s": sum(s["wall_s"] for s in result["sessions"]),
        "agentic_wall_s": sum(s["wall_s"] for s in agentic),
        "turns": len(turns),
        "ttft_first_turn_mean_s": sum(first) / len(first) if first else 0.0,
        "ttft_later_p50_s": pct(later, 50),
        "ttft_later_p90_s": pct(later, 90),
        "tpot_ms": 1000 * decode_s / max(decode_steps, 1),
        "decode_tok_s": decode_steps / max(decode_s, 1e-9),
        "prefill_tok_s": (prompt - cached) / max(ttft, 1e-9),
        "prefix_hit_rate": cached / max(prompt, 1),
        "uncached_prompt_tokens": prompt - cached,
        "generated": sum(t["generated"] for t in turns),
    }
    bench = next((s for s in result["sessions"] if s["name"] == "decode_aime25"), None)
    if bench:
        t = bench["turns"][0]
        out["bench_decode_tok_s"] = (t["generated"] - 1) / max(t["decode_s"], 1e-9)
        out["bench_ttft_s"] = t["ttft_s"]
    return out


def check_probes(judge_python: str, model: str, run_dir: Path, out_json: Path) -> list[dict]:
    proc = subprocess.run(
        [judge_python, str(PROBE_CHECK), "--model", model, "--result", str(out_json)],
        capture_output=True, text=True, cwd="/tmp")
    (run_dir / "probe_check.log").write_text(proc.stdout + proc.stderr)
    if proc.returncode != 0:
        raise RuntimeError(f"probe check failed; see {run_dir / 'probe_check.log'}")
    return json.loads(proc.stdout.strip().splitlines()[-1])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=os.environ.get("FTM_QWEN4_MODEL"),
                        help="the MLX Qwen3.8-Flash-Next-4bit checkpoint directory")
    parser.add_argument("--repo", default=str(REPO), help="the FreeToken-metal checkout to run")
    parser.add_argument("--quick", action="store_true", help=f"first {QUICK_SESSIONS} session")
    parser.add_argument("--label", default="run")
    parser.add_argument("--baseline", default=str(HERE / "naive_reference.json"))
    parser.add_argument("--write-baseline", action="store_true",
                        help="append this run's times to --baseline")
    parser.add_argument("--judge-python", default=None,
                        help="python that judges the probes (default: the repo's .venv)")
    parser.add_argument("--runs", default=str(HERE / "runs"))
    parser.add_argument("--no-sync", action="store_true", help="skip `uv sync` in the repo")
    parser.add_argument("--timeout-min", type=float, default=None)
    args = parser.parse_args()
    if not args.model:
        sys.exit("--model (or FTM_QWEN4_MODEL) is required")
    repo = Path(args.repo).resolve()
    judge_python = args.judge_python or str(repo / ".venv" / "bin" / "python")
    sessions = QUICK_SESSIONS if args.quick else None
    timeout_min = args.timeout_min or (40 if args.quick else 90)
    run_id = time.strftime("%Y%m%d-%H%M%S") + "_" + re.sub(r"[^\w.-]+", "_", args.label)
    run_dir = Path(args.runs) / run_id
    run_dir.mkdir(parents=True)
    log(f"run {run_id}: repo {repo}{' (quick)' if args.quick else ''}")

    with open(LOCK, "w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            log("waiting for the benchmark lock (another run holds it)...")
            fcntl.flock(lock, fcntl.LOCK_EX)
        if not args.no_sync:
            sync(repo)
        swap_before = swap_used_mib()
        if subprocess.run(["sudo", "-n", "purge"], capture_output=True).returncode != 0:
            log("note: `sudo -n purge` failed, the page cache is not cold (times are optimistic)")
        out_json = run_dir / "result.json"
        cmd = [str(repo / ".venv" / "bin" / "python"), str(DRIVER), "eval", "--model",
               args.model, "--trace", str(TRACE), "--out", str(out_json)]
        if sessions:
            cmd += ["--sessions", str(sessions), "--no-probes"]
        start = time.time()
        with open(run_dir / "driver.log", "w") as driver_log:
            # Its own session: a signal to this script's process group neither kills the model
            # mid-forward (which can wedge the GPU) nor frees the lock before the model exits.
            proc = subprocess.Popen(
                cmd, cwd="/tmp", stdout=driver_log, stderr=subprocess.STDOUT,
                start_new_session=True, pass_fds=(lock.fileno(),),
            )
            try:
                rc = proc.wait(timeout=timeout_min * 60)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait()
                rc = "timeout"
        elapsed = time.time() - start
        swap_growth = swap_used_mib() - swap_before

    tail = (run_dir / "driver.log").read_text().splitlines()[-15:]
    for line in tail:
        log(f"  | {line}")
    invalid = []
    if rc != 0 or not out_json.exists():
        invalid.append(f"driver failed ({rc}); see {run_dir / 'driver.log'}")
        result = None
    else:
        result = json.loads(out_json.read_text())
    trace = json.loads(TRACE.read_text())

    record = {"run_id": run_id, "repo": str(repo), "quick": args.quick,
              "elapsed_s": elapsed, "swap_growth_mib": swap_growth}
    if result is not None:
        agree = agreement(trace, result)
        summary = summarize(result)
        record.update(agreement=agree, summary=summary, peak_gib=result["peak_gib"],
                      load_s=result["load_s"])
        if not args.quick:
            probes = check_probes(judge_python, args.model, run_dir, out_json)
            record["probes"] = probes
            valid = sum(p["valid"] for p in probes)
            log("probes: " + "; ".join(f"{p['name']} {'ok' if p['valid'] else 'BAD'} "
                                       f"({p['why']}, {p['tokens']} tokens)" for p in probes))
            if valid < PROBE_MIN:
                invalid.append(f"{valid} of {len(probes)} probe replies well-formed < {PROBE_MIN}")
        if not agree["forced_ok"]:
            invalid.append("reported tokens differ from the forced ones (harness hooks bypassed)")
        if agree["confident"] < CONFIDENT_MIN:
            invalid.append(f"confident-position agreement {agree['confident']:.4f} < "
                           f"{CONFIDENT_MIN}")
        if agree["overall"] < OVERALL_MIN:
            invalid.append(f"overall agreement {agree['overall']:.4f} < {OVERALL_MIN}")
        if result["peak_gib"] > PEAK_GIB_MAX and not args.write_baseline:
            invalid.append(f"MLX peak {result['peak_gib']:.2f} GiB > {PEAK_GIB_MAX}")
        if result["load_s"] > LOAD_S_MAX:
            invalid.append(f"engine load {result['load_s']:.0f}s > {LOAD_S_MAX}s")
        if swap_growth > SWAP_GROWTH_MAX_MIB:
            invalid.append(f"swap grew {swap_growth:.0f} MiB > {SWAP_GROWTH_MAX_MIB}")
        if agree["kld_mean"] > KLD_MEAN_MAX:
            invalid.append(f"mean KLD {agree['kld_mean']:.4f} > {KLD_MEAN_MAX}")
        if agree["kld_p99"] > KLD_P99_MAX:
            invalid.append(f"p99 KLD {agree['kld_p99']:.4f} > {KLD_P99_MAX}")
        log(f"agreement: confident {agree['confident']:.4f} "
            f"({agree['confident_positions']} positions with margin >= {MARGIN}), "
            f"overall {agree['overall']:.4f} ({agree['positions']} positions); KLD mean "
            f"{agree['kld_mean']:.5f}, p99 {agree['kld_p99']:.4f}, max {agree['kld_max']:.3f}")
        log(f"peak MLX memory {result['peak_gib']:.2f} GiB, swap growth {swap_growth:.0f} MiB, "
            f"engine load {result['load_s']:.1f}s")
        log(f"agentic {summary['agentic_wall_s']:.1f}s over {summary['turns']} turns: TTFT "
            f"first turn {summary['ttft_first_turn_mean_s']:.1f}s, later p50 "
            f"{summary['ttft_later_p50_s']:.1f}s / p90 {summary['ttft_later_p90_s']:.1f}s; "
            f"TPOT {summary['tpot_ms']:.0f} ms ({summary['decode_tok_s']:.2f} tok/s); prefill "
            f"{summary['prefill_tok_s']:.1f} tok/s over {summary['uncached_prompt_tokens']} "
            f"uncached tokens; prefix hit {summary['prefix_hit_rate']:.3f}")
        if "bench_decode_tok_s" in summary:
            log(f"decode bench (upstream bench_decode_moe shape): "
                f"{summary['bench_decode_tok_s']:.2f} tok/s, TTFT {summary['bench_ttft_s']:.1f}s")

    base_path = Path(args.baseline)
    if args.write_baseline:
        if invalid:
            sys.exit("baseline run invalid: " + "; ".join(invalid))
        baselines = json.loads(base_path.read_text()) if base_path.exists() else {"runs": []}
        baselines["runs"].append({s["name"]: s["wall_s"] for s in result["sessions"]})
        names = baselines["runs"][0].keys()
        baselines["session_wall_s"] = {
            n: sum(r[n] for r in baselines["runs"]) / len(baselines["runs"]) for n in names
        }
        base_path.write_text(json.dumps(baselines, indent=1))
        log(f"baseline updated: {baselines['session_wall_s']}")

    score = 0.0
    if result is not None and base_path.exists():
        base = json.loads(base_path.read_text())["session_wall_s"]
        ratios = []
        for s in result["sessions"]:
            ratio = base[s["name"]] / s["wall_s"]
            ratios.append(ratio)
            log(f"  session {s['name']}: {s['wall_s']:.1f}s (base {base[s['name']]:.1f}s) "
                f"-> {ratio:.3f}x")
        score = sum(ratios) / len(ratios)
        record["ratios"] = ratios
    record["invalid"] = invalid
    record["score"] = 0.0 if invalid else score
    (run_dir / "record.json").write_text(json.dumps(record, indent=1))
    for reason in invalid:
        log(f"INVALID: {reason}")
    key = "quick_vs_base" if args.quick else "mean_vs_base"
    log(f"run_id = {run_id}")
    log(f"{key} = {record['score']:.4f}")


if __name__ == "__main__":
    main()
