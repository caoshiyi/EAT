"""Pure-PyTorch fp32 reference for KDA prefill (token-by-token recurrence)."""

import torch
import torch.nn.functional as F


def kda_gate(raw_g, A_log, dt_bias, lower_bound):
    """Log-space decay: lower_bound * sigmoid(exp(A_log) * (raw_g + dt_bias)). raw_g: [..., H, K]."""
    H, K = raw_g.shape[-2:]
    return lower_bound * torch.sigmoid(A_log.view(H, 1).exp() * (raw_g.float() + dt_bias.view(H, K)))


@torch.no_grad()
def kda_prefill_reference(q, k, v, raw_g, raw_beta, A_log, dt_bias, state, cu_seqlens, scale, lower_bound):
    """
    q, k, v, raw_g : [1, T, H, 128] bf16      raw_beta : [1, T, H] bf16
    A_log : [H] f32   dt_bias : [H*128] f32    state : [N, H, 128(V), 128(K)] f32 or empty
    Returns output [1, T, H, 128] bf16 and new_state [N, H, 128(V), 128(K)] f32.
    """
    qn = F.normalize(q.float(), dim=-1, eps=1e-6)[0]
    kn = F.normalize(k.float(), dim=-1, eps=1e-6)[0]
    vf = v.float()[0]
    decay = kda_gate(raw_g, A_log, dt_bias, lower_bound)[0].exp()
    beta = torch.sigmoid(raw_beta.float())[0]
    N = cu_seqlens.numel() - 1
    H, D = q.shape[2], q.shape[3]
    out = torch.empty_like(vf)
    new_state = torch.empty(N, H, D, D, dtype=torch.float32, device=q.device)
    cu = cu_seqlens.tolist()
    for n in range(N):
        # S is K-major [H, K, V] here; stored V-major on input/output.
        S = state[n].transpose(-1, -2).clone() if state.numel() else q.new_zeros(H, D, D, dtype=torch.float32)
        for t in range(cu[n], cu[n + 1]):
            S *= decay[t][..., None]
            kS = torch.einsum("hk,hkv->hv", kn[t], S)
            S += kn[t][..., None] * (beta[t][:, None] * (vf[t] - kS))[:, None, :]
            out[t] = scale * torch.einsum("hk,hkv->hv", qn[t], S)
        new_state[n] = S.transpose(-1, -2)
    return out[None].to(torch.bfloat16), new_state
