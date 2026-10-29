#!/usr/bin/env python3
"""
Fast prefill probe for tasks/ftm_m5_iq4: the speed suite's ~32K prefill case (and the short decode) on one checkout.

Starts `<repo>/.venv/bin/ftm serve --model $FTM_GGUF_IQ4` under the benchmark lock, runs the frozen harness's
speed_suite.py with --only (default prefill_32k,decode), stops the server with SIGTERM and prints one line per case.
Not a gate and not the score: a quick A/B signal for prefill work (~3 min), where the eval's --quick only covers ~4K.

    python3 tools/ftm_m5_iq4/prefill_probe.py --repo <checkout> [--only prefill_32k,decode] [--env KEY=VALUE ...]
"""
from __future__ import annotations

import argparse
import fcntl
import json
import os
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUITE = ROOT / "tasks" / "ftm_m5_iq4" / "harness" / "gguf"
LOCK = Path("/tmp/ftm_bench.lock")
PORT = 19191
START_TIMEOUT_S = 600


def model_id() -> str | None:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/v1/models", timeout=5) as response:
            return json.load(response)["data"][0]["id"]
    except (OSError, ValueError, KeyError, IndexError):
        return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--only", default="prefill_32k,decode")
    parser.add_argument("--env", action="append", default=[], help="KEY=VALUE for the server (an A/B switch)")
    args = parser.parse_args()
    gguf = os.environ.get("FTM_GGUF_IQ4")
    if not gguf:
        sys.exit("set FTM_GGUF_IQ4")
    repo = Path(args.repo)
    env = {key: value for key, value in os.environ.items() if key not in ("FTMETAL_FPREFILL_MMA", "PYTHONPATH")}
    env.update(item.split("=", 1) for item in args.env)
    lock = open(LOCK, "w")
    fcntl.flock(lock, fcntl.LOCK_EX)
    with tempfile.TemporaryDirectory() as tmp:
        log = open(Path(tmp) / "serve.log", "w")
        server = subprocess.Popen([str(repo / ".venv" / "bin" / "ftm"), "serve", "--model", gguf, "--port", str(PORT)],
                                  cwd=repo, env=env, stdout=log, stderr=subprocess.STDOUT)
        try:
            deadline = time.time() + START_TIMEOUT_S
            mid = None
            while mid is None:
                if server.poll() is not None or time.time() > deadline:
                    print((Path(tmp) / "serve.log").read_text()[-2000:])
                    sys.exit("the server did not start")
                time.sleep(3)
                mid = model_id()
            out = Path(tmp) / "speed.json"
            subprocess.run([sys.executable, str(SUITE / "speed_suite.py"), "--port", str(PORT), "--corpus",
                            str(SUITE / "longctx_corpus.txt"), "--out", str(out), "--model", mid,
                            f"--only={args.only}"], check=True, capture_output=True, text=True)
            for case, result in json.loads(out.read_text()).items():
                print(f"{case}: prompt {result['prompt_tokens']} tokens, prefill {result['prompt_tok_s']:.1f} tok/s, "
                      f"decode {result['decode_tok_s']:.1f} tok/s")
        finally:
            if server.poll() is None:
                # SIGTERM: the engine unwinds after its current GPU command.
                server.send_signal(signal.SIGTERM)
                server.wait(timeout=180)
    return 0


if __name__ == "__main__":
    sys.exit(main())
