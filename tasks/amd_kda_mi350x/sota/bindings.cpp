// Registers vLLM's ROCm Kimi-K3 KDA prefill kernels as torch.ops.kda_sota.*
// Schemas copied from vllm/csrc/libtorch_stable/torch_bindings.cpp (vLLM commit 9521c60).

#include <optional>

#include <torch/csrc/stable/library.h>
#include <torch/csrc/stable/tensor.h>

void fused_kda_prologue(
    torch::stable::Tensor const& q, torch::stable::Tensor const& k,
    torch::stable::Tensor const& v, torch::stable::Tensor const& raw_g,
    torch::stable::Tensor const& raw_beta, torch::stable::Tensor const& a_log,
    torch::stable::Tensor const& dt_bias, torch::stable::Tensor& qg,
    torch::stable::Tensor& w, torch::stable::Tensor& u,
    torch::stable::Tensor& kg_t, torch::stable::Tensor& aqk,
    torch::stable::Tensor& decay, torch::stable::Tensor const& cu_seqlens,
    torch::stable::Tensor const& chunk_indices,
    std::optional<torch::stable::Tensor> conv_weight,
    std::optional<torch::stable::Tensor> conv_state,
    std::optional<torch::stable::Tensor> conv_state_indices,
    std::optional<torch::stable::Tensor> conv_has_initial_state, double scale,
    double lower_bound);

void fused_kda_chunk(
    torch::stable::Tensor const& qg, torch::stable::Tensor const& w,
    torch::stable::Tensor const& u, torch::stable::Tensor const& kg_t,
    torch::stable::Tensor const& aqk, torch::stable::Tensor const& decay,
    std::optional<torch::stable::Tensor> initial_state,
    std::optional<torch::stable::Tensor> final_state,
    torch::stable::Tensor& out, torch::stable::Tensor const& cu_seqlens,
    torch::stable::Tensor const& chunk_offsets, double scale,
    std::optional<torch::stable::Tensor> group_state, int64_t groups,
    std::optional<torch::stable::Tensor> checkpoint_state,
    std::optional<torch::stable::Tensor> checkpoint_offsets,
    std::optional<torch::stable::Tensor> checkpoint_state_indices,
    std::optional<torch::stable::Tensor> state_cache,
    std::optional<torch::stable::Tensor> state_indices,
    std::optional<torch::stable::Tensor> has_initial_state);

STABLE_TORCH_LIBRARY(kda_sota, ops) {
  ops.def(
      "fused_kda_prologue("
      "Tensor q, Tensor k, Tensor v, Tensor raw_g, Tensor raw_beta, "
      "Tensor A_log, Tensor dt_bias, Tensor! qg, Tensor! w, Tensor! u, "
      "Tensor! kg_t, Tensor! aqk, Tensor! decay, Tensor cu_seqlens, "
      "Tensor chunk_indices, Tensor? conv_weight, Tensor(e!)? conv_state, "
      "Tensor? conv_state_indices, Tensor? conv_has_initial_state, "
      "float scale, float lower_bound) -> ()");
  ops.def(
      "fused_kda_chunk("
      "Tensor qg, Tensor w, Tensor u, Tensor kg_t, Tensor aqk, Tensor decay, "
      "Tensor? initial_state, Tensor(a!)? final_state, Tensor! out, "
      "Tensor cu_seqlens, Tensor chunk_offsets, float scale, "
      "Tensor(b!)? group_state, int groups, "
      "Tensor(c!)? checkpoint_state=None, Tensor? checkpoint_offsets=None, "
      "Tensor? checkpoint_state_indices=None, Tensor(d!)? state_cache=None, "
      "Tensor? state_indices=None, Tensor? has_initial_state=None) -> ()");
}

STABLE_TORCH_LIBRARY_IMPL(kda_sota, CUDA, ops) {
  ops.impl("fused_kda_prologue", TORCH_BOX(&fused_kda_prologue));
  ops.impl("fused_kda_chunk", TORCH_BOX(&fused_kda_chunk));
}
