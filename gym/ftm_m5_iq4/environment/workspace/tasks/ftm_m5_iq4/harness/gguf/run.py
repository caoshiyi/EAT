#!/usr/bin/env python3
"""GGUF benchmark: Qwen3.8-Flash-Next UD-IQ4_XS served from a 48 GB Mac, against Strata on the
same file and machine.

Phase 1, correctness (in-process, ../agentic/driver.py, teacher-forced, cold page cache):
  the recorded agentic sessions, the decode benchmark and a long-output session (a 30.6K-token
  prefix of a reply to the pelican storyboard prompt, then its last 1,024 tokens) are replayed on
  the GGUF directory; at every response position the candidate's distribution is compared with
  llama.cpp's on the same GGUF (traces_iq4.json: llama.cpp 3cf0325, CPU, teacher-forced top-20).
Phase 2, serving (`ftm serve --model <the GGUF directory> --port P`, no other flags: the defaults
  must serve the model's full 262,144-token context):
  - speed suite (speed_suite.py, the same requests Strata got): decode tok/s at a short context,
    prompt tok/s at ~4K and ~32K, and ~128K / ~250K prompts with a needle (prompt tok/s, decode
    tok/s after them, the needle found);
  - the pelican storyboard prompt (pelican_client.py, reasoning effort medium, greedy, up to
    48,000 tokens): the page it writes.

    score = sqrt(D * P), D = geomean(decode_short / S_decode, decode_256k / S_decode),
                         P = geomean(prompt_4k / S_4k, prompt_32k / S_32k, prompt_256k / S_32k)
  with S_* the baseline's numbers (strata_baseline.json by default). score > 1 means faster than
  the baseline overall; beats_baseline = every term > 1.

INVALID (score 0) unless:
  - every reported token is the forced one; top-1 agreement with llama.cpp >= CONFIDENT_MIN at
    positions where llama.cpp's top-2 margin >= MARGIN and >= OVERALL_MIN overall; KL(llama.cpp ||
    candidate) mean <= KLD_MEAN_MAX, p99 <= KLD_P99_MAX;
  - (full) >= PROBE_MIN of the free-running probe replies well-formed;
  - MLX peak <= 37 GiB, swap growth <= 1 GiB, engine load <= LOAD_S_MAX in both phases;
  - (full) both needles found; decode tok/s after the ~250K prompt >= LONG_DECODE_MIN_TOK_S,
    prompt tok/s at ~250K >= LONG_PROMPT_MIN x that at ~32K (long context must not slow down);
  - (full) the pelican reply has >= PELICAN_SVG_MIN complete <svg> drawings and ends (stop/length).

usage: run.py --gguf DIR [--repo DIR] [--quick] [--label NAME] [--baseline FILE]
              [--judge-python PY] [--no-sync] [--no-pelican] [--no-long]
  --quick: one session, no probes; serving: decode + ~4K prompt only.
"""

from __future__ import annotations

import argparse
import fcntl
import json
import math
import os
import re
import signal
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
TRACE = HERE / "traces_iq4.json"
CORPUS = HERE / "longctx_corpus.txt"
DRIVER = HERE.parent / "agentic" / "driver.py"
PROBE_CHECK = HERE.parent / "agentic" / "probe_check.py"
SUITE = HERE / "speed_suite.py"
PELICAN = HERE / "pelican_client.py"
LOCK = Path("/tmp/ftm_bench.lock")
MARGIN = 1.0
CONFIDENT_MIN = 0.98
OVERALL_MIN = 0.90
KLD_MEAN_MAX = 0.10
KLD_P99_MAX = 1.5
PROBE_MIN = 2
PEAK_GIB_MAX = 37.0
LOAD_S_MAX = 600
SWAP_GROWTH_MAX_MIB = 1024
LONG_DECODE_MIN_TOK_S = 21.0
LONG_PROMPT_MIN = 0.5
PELICAN_SVG_MIN = 20
PELICAN_MAX_TOKENS = 48000
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
            if path.suffix in {".cpp", ".h", ".metal", ".txt", ".cmake"} and path.stat().st_mtime > built:
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
    p = [math.exp(x) for x in ref_lps]
    q = [math.exp(x) for x in cand_lps]
    p_rest = min(max(1 - sum(p), 1e-9), 1)
    q_rest = min(max(1 - sum(q), 1e-9), 1)
    head = sum(pi * (lr - lq) for pi, lr, lq in zip(p, ref_lps, cand_lps))
    return max(head + p_rest * math.log(p_rest / q_rest), 0.0)


def pct(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    v = sorted(values)
    k = (len(v) - 1) * q / 100
    lo = math.floor(k)
    return v[lo] + (v[min(lo + 1, len(v) - 1)] - v[lo]) * (k - lo)


def agreement(trace: dict, result: dict) -> dict:
    by_name = {s["name"]: s for s in [*trace["sessions"], trace["decode"]]}
    total = matched = confident = confident_matched = 0
    forced_ok = True
    klds = []
    per_session = {}
    for run in result["sessions"]:
        session = by_name[run["name"]]
        s_tot = s_match = 0
        s_kl = []
        for turn, rec in zip(session["turns"], run["turns"]):
            forced_ok &= bool(rec["forced_ok"])
            for ids, lps, margin, got, cand in zip(turn["ref_ids"], turn["ref_lps"], turn["margins"],
                                                   rec["predicted"], rec["cand_lps"]):
                same = ids[max(range(len(lps)), key=lps.__getitem__)] == got
                total += 1
                matched += same
                s_tot += 1
                s_match += same
                if margin >= MARGIN:
                    confident += 1
                    confident_matched += same
                k = kld(lps, cand)
                klds.append(k)
                s_kl.append(k)
        per_session[run["name"]] = {"positions": s_tot, "overall": s_match / max(s_tot, 1),
                                    "kld_mean": sum(s_kl) / max(len(s_kl), 1)}
    klds = klds or [0.0]
    return {"forced_ok": forced_ok, "positions": total, "overall": matched / max(total, 1),
            "confident_positions": confident, "confident": confident_matched / max(confident, 1),
            "kld_mean": sum(klds) / len(klds), "kld_p99": pct(klds, 99), "kld_max": max(klds),
            "per_session": per_session}


def check_probes(judge_python: str, model: str, run_dir: Path, out_json: Path) -> list[dict]:
    proc = subprocess.run(
        [judge_python, str(PROBE_CHECK), "--model", model, "--result", str(out_json)],
        capture_output=True, text=True, cwd="/tmp")
    (run_dir / "probe_check.log").write_text(proc.stdout + proc.stderr)
    if proc.returncode != 0:
        raise RuntimeError(f"probe check failed; see {run_dir / 'probe_check.log'}")
    return json.loads(proc.stdout.strip().splitlines()[-1])


def run_child(cmd: list[str], log_path: Path, timeout_s: float) -> int | str:
    """Run a model process in its own session, so a signal to this script's process group does not
    kill the model mid-forward."""
    with open(log_path, "w") as f:
        proc = subprocess.Popen(cmd, cwd="/tmp", stdout=f, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            return proc.wait(timeout=timeout_s)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
            return "timeout"


def server_up(port: int) -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/v1/models", timeout=5) as r:
            return r.status == 200
    except Exception:
        return False


def serving_phase(repo: Path, gguf: str, port: int, run_dir: Path, quick: bool, pelican: bool,
                  long_ctx: bool) -> dict:
    out: dict = {}
    srv_log = open(run_dir / "serve.log", "w")
    t0 = time.time()
    srv = subprocess.Popen([str(repo / ".venv" / "bin" / "ftm"), "serve", "--model", gguf, "--port", str(port)],
                           cwd=str(repo), stdout=srv_log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        while not server_up(port):
            if srv.poll() is not None:
                out["error"] = f"ftm serve exited ({srv.returncode}) before serving; see {run_dir / 'serve.log'}"
                return out
            if time.time() - t0 > LOAD_S_MAX:
                out["error"] = f"ftm serve not up after {LOAD_S_MAX}s"
                return out
            time.sleep(2)
        out["load_s"] = time.time() - t0
        log(f"ftm serve up in {out['load_s']:.0f}s")
        cases = ["decode", "prefill_4k"] if quick else ["decode", "prefill_4k", "prefill_32k"]
        if long_ctx and not quick:
            cases += ["long_128k", "long_256k"]
        suite_json = run_dir / "speed_suite.json"
        py = sys.executable
        rc = subprocess.run([py, str(SUITE), "--port", str(port), "--corpus", str(CORPUS),
                             "--out", str(suite_json), "--only", ",".join(cases)],
                            stdout=open(run_dir / "speed_suite.log", "w"), stderr=subprocess.STDOUT,
                            timeout=4 * 3600).returncode
        out["suite"] = json.loads(suite_json.read_text()) if suite_json.exists() else {}
        if rc != 0:
            out["error"] = f"speed suite failed ({rc}); see {run_dir / 'speed_suite.log'}"
            return out
        if pelican and not quick:
            pdir = run_dir / "pelican"
            subprocess.run([py, str(PELICAN), str(pdir), "--port", str(port), "--max-tokens", str(PELICAN_MAX_TOKENS),
                            "--effort", "medium"], stdout=open(run_dir / "pelican.log", "w"), stderr=subprocess.STDOUT,
                           timeout=3 * 3600)
            reply = json.loads((pdir / "reply.json").read_text()) if (pdir / "reply.json").exists() else {}
            content = (pdir / "content.md").read_text() if (pdir / "content.md").exists() else ""
            reply["svg_complete"] = len(re.findall(r"<svg\b[\s\S]*?</svg>", content))
            reply["html_complete"] = "</html>" in content.lower()
            out["pelican"] = reply
    finally:
        if srv.poll() is None:
            srv.send_signal(signal.SIGINT)
            try:
                srv.wait(timeout=600)
            except subprocess.TimeoutExpired:
                log("WARNING: ftm serve did not exit within 10 minutes of SIGINT; left running")
        srv_log.close()
    return out


def geomean(xs: list[float]) -> float:
    xs = [max(x, 1e-9) for x in xs]
    return math.exp(sum(math.log(x) for x in xs) / len(xs)) if xs else 0.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gguf", default=os.environ.get("FTM_GGUF_DIR"),
                        help="the UD-IQ4_XS GGUF directory (shards + config / tokenizer files)")
    parser.add_argument("--repo", default=str(REPO), help="the FreeToken-metal checkout to run")
    parser.add_argument("--quick", action="store_true")
    parser.add_argument("--label", default="run")
    parser.add_argument("--baseline", default=str(HERE / "strata_baseline.json"))
    parser.add_argument("--judge-python", default=None,
                        help="python that judges the probes (default: the repo's .venv)")
    parser.add_argument("--runs", default=str(HERE / "runs"))
    parser.add_argument("--port", type=int, default=19190)
    parser.add_argument("--no-sync", action="store_true", help="skip `uv sync` in the repo")
    parser.add_argument("--no-pelican", action="store_true")
    parser.add_argument("--no-long", action="store_true")
    args = parser.parse_args()
    if not args.gguf:
        sys.exit("--gguf (or FTM_GGUF_DIR) is required")
    repo = Path(args.repo).resolve()
    judge_python = args.judge_python or str(repo / ".venv" / "bin" / "python")
    full = not (args.quick or args.no_pelican or args.no_long)
    run_id = time.strftime("%Y%m%d-%H%M%S") + "_" + re.sub(r"[^\w.-]+", "_", args.label)
    run_dir = Path(args.runs) / run_id
    run_dir.mkdir(parents=True)
    log(f"run {run_id}: repo {repo}{'' if full else ' (partial run)'}")

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
        cmd = [str(repo / ".venv" / "bin" / "python"), str(DRIVER), "eval", "--model", args.gguf,
               "--trace", str(TRACE), "--out", str(out_json)]
        if args.quick:
            cmd += ["--sessions", str(QUICK_SESSIONS), "--no-probes"]
        t_start = time.time()
        rc = run_child(cmd, run_dir / "driver.log", (40 if args.quick else 120) * 60)
        phase1_s = time.time() - t_start
        serving = {}
        if rc == 0:
            serving = serving_phase(repo, args.gguf, args.port, run_dir, args.quick, not args.no_pelican,
                                    not args.no_long)
        elapsed = time.time() - t_start
        swap_growth = swap_used_mib() - swap_before

    for line in (run_dir / "driver.log").read_text().splitlines()[-12:]:
        log(f"  | {line}")
    invalid = []
    result = json.loads(out_json.read_text()) if rc == 0 and out_json.exists() else None
    if result is None:
        invalid.append(f"driver failed ({rc}); see {run_dir / 'driver.log'}")
    trace = json.loads(TRACE.read_text())
    record = {"run_id": run_id, "repo": str(repo), "quick": args.quick, "full": full,
              "elapsed_s": elapsed, "phase1_s": phase1_s, "swap_growth_mib": swap_growth}
    if result is not None:
        agree = agreement(trace, result)
        record.update(agreement=agree, peak_gib=result["peak_gib"], load_s=result["load_s"],
                      session_wall_s={s["name"]: s["wall_s"] for s in result["sessions"]})
        if not args.quick:
            probes = check_probes(judge_python, args.gguf, run_dir, out_json)
            record["probes"] = probes
            valid = sum(p["valid"] for p in probes)
            log("probes: " + "; ".join(f"{p['name']} {'ok' if p['valid'] else 'BAD'} ({p['why']})" for p in probes))
            if valid < PROBE_MIN:
                invalid.append(f"{valid} of {len(probes)} probe replies well-formed < {PROBE_MIN}")
        if not agree["forced_ok"]:
            invalid.append("reported tokens differ from the forced ones")
        if agree["confident"] < CONFIDENT_MIN:
            invalid.append(f"confident-position agreement {agree['confident']:.4f} < {CONFIDENT_MIN}")
        if agree["overall"] < OVERALL_MIN:
            invalid.append(f"overall agreement {agree['overall']:.4f} < {OVERALL_MIN}")
        if agree["kld_mean"] > KLD_MEAN_MAX:
            invalid.append(f"mean KLD {agree['kld_mean']:.4f} > {KLD_MEAN_MAX}")
        if agree["kld_p99"] > KLD_P99_MAX:
            invalid.append(f"p99 KLD {agree['kld_p99']:.4f} > {KLD_P99_MAX}")
        if result["peak_gib"] > PEAK_GIB_MAX:
            invalid.append(f"MLX peak {result['peak_gib']:.2f} GiB > {PEAK_GIB_MAX}")
        if result["load_s"] > LOAD_S_MAX:
            invalid.append(f"engine load {result['load_s']:.0f}s > {LOAD_S_MAX}s")
        log(f"agreement with llama.cpp: confident {agree['confident']:.4f} ({agree['confident_positions']} "
            f"positions with margin >= {MARGIN}), overall {agree['overall']:.4f} ({agree['positions']} positions); "
            f"KLD mean {agree['kld_mean']:.5f}, p99 {agree['kld_p99']:.4f}, max {agree['kld_max']:.3f}")
        for name, s in agree["per_session"].items():
            log(f"  {name}: {s['positions']} positions, top-1 {s['overall']:.4f}, KLD mean {s['kld_mean']:.5f}, "
                f"wall {record['session_wall_s'][name]:.1f}s")
        log(f"peak MLX memory {result['peak_gib']:.2f} GiB, engine load {result['load_s']:.1f}s")
    if swap_growth > SWAP_GROWTH_MAX_MIB:
        invalid.append(f"swap grew {swap_growth:.0f} MiB > {SWAP_GROWTH_MAX_MIB}")

    score = 0.0
    if result is not None:
        record["serving"] = serving
        if serving.get("error"):
            invalid.append(serving["error"])
        suite = serving.get("suite", {})
        base = json.loads(Path(args.baseline).read_text())
        for name, r in suite.items():
            log(f"  {name}: prompt {r.get('prompt_tokens')} tokens, prompt {r.get('prompt_tok_s') or 0:.1f} tok/s, "
                f"decode {r.get('decode_tok_s') or 0:.2f} tok/s, finish {r.get('finish')}"
                + (f", needle {'found' if r.get('found') else 'MISSING'}" if "found" in r else ""))

        def rate(name: str, key: str) -> float:
            return float((suite.get(name) or {}).get(key) or 0.0)

        terms = {}
        if "decode" in suite:
            terms["decode_short"] = rate("decode", "decode_tok_s") / base["decode"]["decode_tok_s"]
        if "prefill_4k" in suite:
            terms["prompt_4k"] = rate("prefill_4k", "prompt_tok_s") / base["prefill_4k"]["prompt_tok_s"]
        if "prefill_32k" in suite:
            terms["prompt_32k"] = rate("prefill_32k", "prompt_tok_s") / base["prefill_32k"]["prompt_tok_s"]
        if "long_256k" in suite:
            terms["decode_256k"] = rate("long_256k", "decode_tok_s") / base["decode"]["decode_tok_s"]
            terms["prompt_256k"] = rate("long_256k", "prompt_tok_s") / base["prefill_32k"]["prompt_tok_s"]
            for name in ("long_128k", "long_256k"):
                if not suite.get(name, {}).get("found"):
                    invalid.append(f"{name}: needle not found")
            if rate("long_256k", "decode_tok_s") < LONG_DECODE_MIN_TOK_S:
                invalid.append(f"decode after ~250K tokens {rate('long_256k', 'decode_tok_s'):.2f} tok/s < "
                               f"{LONG_DECODE_MIN_TOK_S} tok/s")
            if rate("long_256k", "prompt_tok_s") < LONG_PROMPT_MIN * rate("prefill_32k", "prompt_tok_s"):
                invalid.append(f"prompt rate at ~250K {rate('long_256k', 'prompt_tok_s'):.1f} tok/s < "
                               f"{LONG_PROMPT_MIN} x that at ~32K {rate('prefill_32k', 'prompt_tok_s'):.1f}")
        if "pelican" in serving:
            p = serving["pelican"]
            log(f"pelican: {p.get('svg_complete')} complete drawings, page {'complete' if p.get('html_complete') else 'INCOMPLETE'}, "
                f"{(p.get('usage') or {}).get('completion_tokens')} tokens, finish {p.get('finish_reason')}, "
                f"{p.get('decode_tok_s') or 0:.1f} tok/s")
            if (p.get("svg_complete") or 0) < PELICAN_SVG_MIN or p.get("finish_reason") not in ("stop", "length"):
                invalid.append(f"pelican: {p.get('svg_complete')} complete drawings < {PELICAN_SVG_MIN} "
                               f"(finish {p.get('finish_reason')})")
        for k, v in terms.items():
            log(f"  vs baseline {k}: {v:.3f}x")
        d = [terms[k] for k in ("decode_short", "decode_256k") if k in terms]
        pr = [terms[k] for k in ("prompt_4k", "prompt_32k", "prompt_256k") if k in terms]
        if d and pr:
            score = math.sqrt(geomean(d) * geomean(pr))
        record["terms"] = terms
        record["beats_baseline"] = bool(terms) and all(v > 1 for v in terms.values())
    record["invalid"] = invalid
    record["score"] = 0.0 if invalid else score
    (run_dir / "record.json").write_text(json.dumps(record, indent=1))
    for reason in invalid:
        log(f"INVALID: {reason}")
    log(f"run_id = {run_id}")
    log(f"{'score' if full else 'partial_score'} = {record['score']:.4f}")


if __name__ == "__main__":
    main()
