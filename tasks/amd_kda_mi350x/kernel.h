#pragma once
#include <hip/hip_runtime_api.h>
#include <cstdint>

// Kimi Delta Attention (KDA) prefill, Kimi-K3 shapes at TP8, AMD MI350X (gfx950).
//
// Gate / beta / normalization (all done inside the kernel):
//   g    = lower_bound * sigmoid(exp(A_log[h]) * (raw_g + dt_bias[h*128 + k]))   (log space)
//   beta = sigmoid(raw_beta)
//   q, k = L2-normalized over head_dim (eps 1e-6)
//
// State layout: V-major [N, H, V, K], fp32.
// bf16 buffers are passed as raw 16-bit words (uint16_t) because main.cpp is built by the
// host compiler, which cannot parse hip_bf16.h; kernel.cu reinterprets them.

using bf16_bits = uint16_t;

void kda_prefill_kernel_launch(
    bf16_bits* output,                // [total_seq_len, H, 128]
    float* new_state,                 // [num_seqs, H, 128, 128]
    const bf16_bits* q,               // [total_seq_len, H, 128]
    const bf16_bits* k,               // [total_seq_len, H, 128]
    const bf16_bits* v,               // [total_seq_len, H, 128]
    const bf16_bits* raw_g,           // [total_seq_len, H, 128]
    const bf16_bits* raw_beta,        // [total_seq_len, H]
    const float* A_log,               // [H]
    const float* dt_bias,             // [H * 128]
    const float* state,               // [num_seqs, H, 128, 128] or nullptr (zero initial state)
    const int64_t* cu_seqlens,        // [num_seqs + 1]
    int32_t num_seqs,
    int32_t num_heads,
    float scale,
    float lower_bound,
    int64_t total_seq_len,
    float* workspace,                 // kda_workspace_floats(...) floats
    hipStream_t stream
);

int64_t kda_workspace_floats(int64_t total_seq_len, int32_t num_seqs, int32_t num_heads);
