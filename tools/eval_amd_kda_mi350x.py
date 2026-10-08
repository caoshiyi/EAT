#!/usr/bin/env python3
"""
Evaluate the KDA prefill candidate (tasks/amd_kda_mi350x) on AMD MI350X.

Builds kernel.cu + main.cpp as a PyTorch HIP extension (or, if tasks/amd_kda_mi350x/kernel.py
exists, imports that Python/Gluon candidate instead), checks every workload against the fp32
reference, and times it against two recorded baselines:
  sota : vLLM's hand-written ROCm KDA prefill kernels (tasks/amd_kda_mi350x/sota) -> vs_base
  fla  : flash-linear-attention chunk_kda Triton                                  -> vs_fla

Usage:
    HIP_VISIBLE_DEVICES=<gpu> python tools/eval_amd_kda_mi350x.py --quick   # 4 workloads
    HIP_VISIBLE_DEVICES=<gpu> python tools/eval_amd_kda_mi350x.py           # all 10
    HIP_VISIBLE_DEVICES=<gpu> python tools/eval_amd_kda_mi350x.py --baseline-only sota   # record once
"""
from __future__ import annotations

import sys
from pathlib import Path

# tools/profile.py would shadow the stdlib `profile` module that torch._dynamo imports.
sys.path = [p for p in sys.path if Path(p or ".").resolve() != Path(__file__).resolve().parent]

import argparse
import hashlib
import json
import time

import torch

ROOT = Path(__file__).resolve().parent.parent
TASK_DIR = ROOT / "tasks" / "amd_kda_mi350x"
BASELINE_FILES = {"sota": TASK_DIR / "baseline_sota.json", "fla": TASK_DIR / "baseline_fla.json"}
REF_CACHE = TASK_DIR / "data"
BUILD_ROOT = TASK_DIR / "build"
sys.path.insert(0, str(TASK_DIR))

from reference import kda_prefill_reference  # noqa: E402

H, D = 12, 128
LOWER_BOUND = -5.0
SCALE = D ** -0.5
RTOL = 2e-2  # relative L2 error bound on output and final state

WORKLOADS = {
    "p_1x1k": [1024],
    "p_1x4k": [4096],
    "p_1x16k": [16384],
    "p_1x64k": [65536],
    "p_4x4k": [4096] * 4,
    "p_8x2k": [2048] * 8,
    "p_16x1k": [1024] * 16,
    "p_32x512": [512] * 32,
    "p_64x128": [128] * 64,
    "p_mixed": [8192, 1024, 777, 512, 256, 130, 64, 17],
}
QUICK = ["p_1x4k", "p_16x1k", "p_64x128", "p_mixed"]


def make_inputs(lens, seed=0):
    g = torch.Generator("cuda").manual_seed(seed)
    T, N = sum(lens), len(lens)
    rn = lambda *s, sc=1.0: torch.randn(*s, generator=g, device="cuda") * sc
    return dict(
        q=rn(1, T, H, D).bfloat16(), k=rn(1, T, H, D).bfloat16(), v=rn(1, T, H, D).bfloat16(),
        raw_g=rn(1, T, H, D).bfloat16(), raw_beta=rn(1, T, H).bfloat16(),
        A_log=torch.rand(H, generator=g, device="cuda") * 2 - 1, dt_bias=rn(H * D, sc=0.5),
        state=rn(N, H, D, D, sc=0.05),
        cu_seqlens=torch.tensor([0] + torch.tensor(lens).cumsum(0).tolist(), dtype=torch.long, device="cuda"),
    )


def reference(name, inp):
    REF_CACHE.mkdir(exist_ok=True)
    path = REF_CACHE / f"ref_{name}.pt"
    if path.exists():
        d = torch.load(path, map_location="cuda")
        return d["output"], d["new_state"]
    t0 = time.time()
    o, s = kda_prefill_reference(**inp, scale=SCALE, lower_bound=LOWER_BOUND)
    torch.save({"output": o, "new_state": s}, path)
    print(f"  [ref] computed {name} in {time.time() - t0:.0f}s (cached)")
    return o, s


def fla_baseline(inp):
    from fla.ops.kda import chunk_kda
    o, s = chunk_kda(
        q=inp["q"], k=inp["k"], v=inp["v"], g=inp["raw_g"], beta=inp["raw_beta"],
        A_log=inp["A_log"], dt_bias=inp["dt_bias"], scale=SCALE,
        initial_state=inp["state"], output_final_state=True, state_v_first=True,
        use_qk_l2norm_in_kernel=True, use_gate_in_kernel=True, use_beta_sigmoid_in_kernel=True,
        safe_gate=True, lower_bound=LOWER_BOUND, cu_seqlens=inp["cu_seqlens"],
    )
    return {"output": o, "new_state": s}


def sota_baseline_fn(inp):
    sys.path.insert(0, str(TASK_DIR / "sota"))
    import sota_kda
    meta = sota_kda.prepare_meta(inp["cu_seqlens"])
    return lambda: sota_kda.run(**inp, scale=SCALE, lower_bound=LOWER_BOUND, meta=meta)


def build_candidate():
    from torch.utils.cpp_extension import load
    srcs = {f: (TASK_DIR / f).read_text() for f in ("kernel.h", "kernel.cu", "main.cpp")}
    digest = hashlib.sha1("".join(srcs.values()).encode()).hexdigest()[:12]
    bdir = BUILD_ROOT / digest
    bdir.mkdir(parents=True, exist_ok=True)
    for f, s in srcs.items():
        (bdir / f).write_text(s)
    t0 = time.time()
    mod = load(
        name=f"kda_cand_{digest}",
        sources=[str(bdir / "main.cpp"), str(bdir / "kernel.cu")],
        extra_cflags=["-O3"],
        extra_cuda_cflags=["-O3", "--offload-arch=gfx950"],
        build_directory=str(bdir),
        verbose=False,
    )
    print(f"[OK] built candidate {digest} in {time.time() - t0:.1f}s")
    return mod


def load_candidate():
    """kernel.py (Python/Triton/Gluon) takes precedence over kernel.cu + main.cpp."""
    py = TASK_DIR / "kernel.py"
    if not py.exists():
        return build_candidate()
    import importlib.util
    spec = importlib.util.spec_from_file_location("kda_cand_py", py)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    print(f"[OK] loaded Python candidate {py.name}")
    return mod


def candidate_fn(mod, inp):
    """Untimed optional `prepare(cu_seqlens)`, mirroring the SOTA's host metadata; `run` is timed."""
    if hasattr(mod, "prepare"):
        meta = mod.prepare(inp["cu_seqlens"])
        return lambda: mod.run(**inp, scale=SCALE, lower_bound=LOWER_BOUND, meta=meta)
    return lambda: mod.run(**inp, scale=SCALE, lower_bound=LOWER_BOUND)


_flush = None


def bench(fn, iters, warmup):
    """Median latency (ms); flushes the 256MB Infinity Cache before each timed run."""
    global _flush
    if _flush is None:
        _flush = torch.empty(512 * 1024 * 1024 // 4, dtype=torch.float32, device="cuda")
    for _ in range(warmup):
        fn()
    torch.cuda.synchronize()
    ts = []
    for _ in range(iters):
        _flush.zero_()
        a, b = torch.cuda.Event(enable_timing=True), torch.cuda.Event(enable_timing=True)
        a.record()
        fn()
        b.record()
        torch.cuda.synchronize()
        ts.append(a.elapsed_time(b))
    ts.sort()
    return ts[len(ts) // 2]


def rel(a, b):
    a, b = a.float(), b.float()
    return ((a - b).norm() / b.norm().clamp_min(1e-12)).item()


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true", help="4 workloads, 20 timed iterations")
    ap.add_argument("--workloads", nargs="*", default=None)
    ap.add_argument("--baseline-only", choices=["sota", "fla"], default=None,
                    help="time one baseline on all workloads and write baseline_<name>.json (run once)")
    args = ap.parse_args(argv)

    names = args.workloads or (QUICK if args.quick else list(WORKLOADS))
    iters, warmup = (20, 3) if args.quick else (50, 10)
    dev = torch.cuda.get_device_name(0)
    print(f"[OK] device: {dev}, torch {torch.__version__}")

    if args.baseline_only:
        which = args.baseline_only
        rec = {"device": dev, "latency_ms": {}}
        for name in WORKLOADS:
            inp = make_inputs(WORKLOADS[name])
            with torch.inference_mode():
                fn = sota_baseline_fn(inp) if which == "sota" else (lambda: fla_baseline(inp))
                res = fn()
                o_ref, s_ref = reference(name, inp)
                oe, se = rel(res["output"], o_ref), rel(res["new_state"], s_ref)
                assert oe <= RTOL and se <= RTOL, f"{which} baseline incorrect on {name}: {oe} {se}"
                ms = bench(fn, 50, 10)
            rec["latency_ms"][name] = ms
            print(f"  {name:<10} {which} baseline {ms:.4f} ms (out_err {oe:.1e}, state_err {se:.1e})")
        BASELINE_FILES[which].write_text(json.dumps(rec, indent=1))
        print(f"[OK] wrote {BASELINE_FILES[which]}")
        return 0

    baseline = json.loads(BASELINE_FILES["sota"].read_text())["latency_ms"]
    fla_base = json.loads(BASELINE_FILES["fla"].read_text())["latency_ms"]
    try:
        mod = load_candidate()
    except Exception as e:
        print("COMPILE ERROR DETAILS:")
        print(str(e)[-6000:])
        print(f"\nSUMMARY: 0/{len(names)} workloads passed (COMPILE_ERROR)")
        return 1

    print(f"\n{'workload':<10} | {'status':<10} | {'out_err':>8} | {'state_err':>9} | {'latency(ms)':>11} | {'sota(ms)':>9} | {'vs_base':>7} | {'vs_fla':>6}")
    print("-" * 91)
    passed, vs, vs_fla = 0, [], []
    for name in names:
        inp = make_inputs(WORKLOADS[name])
        o_ref, s_ref = reference(name, inp)
        try:
            with torch.inference_mode():
                fn = candidate_fn(mod, inp)
                res = fn()
                torch.cuda.synchronize()
            oe, se = rel(res["output"], o_ref), rel(res["new_state"], s_ref)
            ok = oe <= RTOL and se <= RTOL and torch.isfinite(res["output"]).all().item()
        except Exception as e:
            print(f"{name:<10} | {'RUNTIME_ERR':<10} | {str(e)[:200]}")
            continue
        if not ok:
            print(f"{name:<10} | {'INCORRECT':<10} | {oe:8.2e} | {se:9.2e} |")
            continue
        with torch.inference_mode():
            ms = bench(fn, iters, warmup)
        v = baseline[name] / ms
        vf = fla_base[name] / ms
        passed += 1
        vs.append(v)
        vs_fla.append(vf)
        print(f"{name:<10} | {'PASSED':<10} | {oe:8.2e} | {se:9.2e} | {ms:11.4f} | {baseline[name]:9.4f} | {v:7.3f} | {vf:6.2f}")

    print(f"\n{'=' * 60}")
    print(f"SUMMARY: {passed}/{len(names)} workloads passed")
    if vs:
        mean_vs = sum(vs) / len(vs)
        print(f"  mean_vs_base = {mean_vs:.3f} (baseline: SOTA vLLM ROCm KDA kernels)")
        print(f"  combined_score = {mean_vs * 100:.1f}")
        print(f"  mean_vs_fla = {sum(vs_fla) / len(vs_fla):.3f} (fla chunk_kda Triton, for reference)")
    print("=" * 60)
    return 0 if passed == len(names) else 1


if __name__ == "__main__":
    raise SystemExit(main())
