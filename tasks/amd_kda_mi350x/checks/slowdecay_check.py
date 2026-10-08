"""Correctness under slow-decay gates (long memory), candidate and SOTA vs the fp32 reference.
The eval's random gates decay ~e^-2.5 per token, so cross-chunk state handling is barely exercised there.
Run from the repo root with HIP_VISIBLE_DEVICES set."""

import sys
from pathlib import Path

ROOT = Path.cwd()
sys.path = [p for p in sys.path if Path(p or ".").resolve() != (ROOT / "tools").resolve()]
sys.path.insert(0, str(ROOT / "tools"))
import eval_amd_kda_mi350x as ev  # noqa: E402

import torch  # noqa: E402
from reference import kda_prefill_reference  # noqa: E402

SHAPES = {
    "1x1k": [1024],
    "1x4k": [4096],
    "1x16k": [16384],
    "1x64k": [65536],
    "4x4k": [4096] * 4,
    "16x777": [777] * 16,
    "mixed_long_tail": [16384] + [256] * 16,
    "mixed_uneven": [4096, 2048, 1500, 512, 300, 100, 64, 33],
}
GATES = {
    "spectrum": (0.0, -14.0, 2.0),
    "slow": (0.0, -12.0, -6.0),
}

mod = ev.load_candidate()
print(f"{'shape':<16} {'gates':<9} | {'cand out':>9} {'cand st':>9} | {'sota out':>9} {'sota st':>9} | status")
bad = 0
for gname, (a_log, lo, hi) in GATES.items():
    for name, lens in SHAPES.items():
        inp = ev.make_inputs(lens, seed=11)
        H = inp["A_log"].shape[0]
        D = inp["dt_bias"].numel() // H
        inp["A_log"] = torch.full_like(inp["A_log"], a_log)
        inp["dt_bias"] = torch.linspace(lo, hi, D, device="cuda").repeat(H).to(inp["dt_bias"].dtype)
        with torch.inference_mode():
            o_ref, s_ref = kda_prefill_reference(**inp, scale=ev.SCALE, lower_bound=ev.LOWER_BOUND)
            res = ev.candidate_fn(mod, inp)()
            sres = ev.sota_baseline_fn(inp)()
            torch.cuda.synchronize()
            co, cs = ev.rel(res["output"], o_ref), ev.rel(res["new_state"], s_ref)
            so, ss = ev.rel(sres["output"], o_ref), ev.rel(sres["new_state"], s_ref)
        ok = co <= ev.RTOL and cs <= ev.RTOL and torch.isfinite(res["output"]).all().item()
        bad += not ok
        print(f"{name:<16} {gname:<9} | {co:9.2e} {cs:9.2e} | {so:9.2e} {ss:9.2e} | {'PASS' if ok else 'FAIL'}")
        del inp, o_ref, s_ref, res, sres
        torch.cuda.empty_cache()
print("ALL PASS" if bad == 0 else f"{bad} FAILED")
