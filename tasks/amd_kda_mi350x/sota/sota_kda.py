"""SOTA baseline: vLLM's hand-written ROCm KDA prefill (vLLM commit 9521c60, Apache-2.0).

Python side ported from vllm/models/kimi_k3/amd/ops/kda_chunk.py (see vllm_reference/).
Two launches: fused_kda_prologue (norms, gate, intra-chunk solve, w/u) and fused_kda_chunk
(chunk recurrence + output; long sequences are split into parallel chunk groups).
"""

import os
from functools import cache

import torch

from fla.ops.utils.index import prepare_chunk_indices, prepare_chunk_offsets

torch.ops.load_library(os.path.join(os.path.dirname(os.path.abspath(__file__)), "libkda_sota.so"))
ops = torch.ops.kda_sota

CHUNK_SIZE = 64
HEAD_DIM = 128
_BLOCKS_P1, _BLOCKS_P2 = 2, 1
_MIN_LEN, _DEEP_LEN, _MAX_GROUPS = 4, 12, 32


@cache
def _num_cus() -> int:
    return torch.cuda.get_device_properties(torch.cuda.current_device()).multi_processor_count


@cache
def _chunk_groups(chunks_per_seq: int, num_seqs: int, num_heads: int) -> int:
    cus = _num_cus()
    nh = max(num_seqs * num_heads, 1)
    fill1 = cus // (_BLOCKS_P1 * nh)
    fill2 = cus // (_BLOCKS_P2 * nh)
    cand = fill1
    if fill2 > 0 and chunks_per_seq // fill2 >= _DEEP_LEN:
        cand = fill2
    cand = min(cand, chunks_per_seq // _MIN_LEN, _MAX_GROUPS)
    return cand if cand >= 4 else 1


def _group_workspace(groups: int, nh: int, device):
    if groups <= 1:
        return None
    planes = groups * nh
    plane = HEAD_DIM * HEAD_DIM
    floats = 2 * planes * plane + planes * HEAD_DIM
    floats += (planes * plane + 1) // 2
    return torch.empty(floats, dtype=torch.float32, device=device)


def prepare_meta(cu_seqlens: torch.Tensor):
    """Per-batch metadata vLLM builds once outside the attention op (not timed)."""
    return dict(
        cu32=cu_seqlens.to(torch.int32),
        chunk_indices=prepare_chunk_indices(cu_seqlens, CHUNK_SIZE).to(torch.int32),
        chunk_offsets=prepare_chunk_offsets(cu_seqlens.to(torch.int32), CHUNK_SIZE),
    )


def run(q, k, v, raw_g, raw_beta, A_log, dt_bias, state, cu_seqlens, scale, lower_bound, meta):
    """Same inputs/outputs as tasks/amd_kda_mi350x main.cpp::run."""
    _, T, H, _ = q.shape
    N = cu_seqlens.numel() - 1
    dev = q.device
    ci = meta["chunk_indices"]
    nc = ci.shape[0]

    def like(last):
        return torch.empty(1, T, H, last, dtype=q.dtype, device=dev)

    qg, w, u = like(HEAD_DIM), like(HEAD_DIM), like(HEAD_DIM)
    kg_t = torch.empty(nc, H, HEAD_DIM, CHUNK_SIZE, dtype=q.dtype, device=dev)
    aqk = like(CHUNK_SIZE)
    decay = torch.empty(nc, H, HEAD_DIM, dtype=torch.float32, device=dev)
    ops.fused_kda_prologue(
        q, k, v, raw_g, raw_beta, A_log.reshape(-1), dt_bias.reshape(-1),
        qg, w, u, kg_t, aqk, decay, meta["cu32"], ci,
        None, None, None, None, scale, lower_bound,
    )
    new_state = torch.empty(N, H, HEAD_DIM, HEAD_DIM, dtype=torch.float32, device=dev)
    out = torch.empty_like(v)
    groups = _chunk_groups(nc // max(N, 1), N, H)
    ops.fused_kda_chunk(
        qg, w, u, kg_t, aqk, decay, state if state.numel() else None, new_state, out,
        meta["cu32"], meta["chunk_offsets"], scale, _group_workspace(groups, N * H, dev), groups,
        None, None, None, None, None, None,
    )
    return {"output": out, "new_state": new_state}
