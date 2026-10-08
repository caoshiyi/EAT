#!/bin/bash
# Builds the SOTA baseline (vLLM ROCm Kimi-K3 KDA prefill kernels) into sota/libkda_sota.so.
# Run once on the MI350X host with the task venv active.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
BUILD=$HERE/build
mkdir -p "$BUILD/kimi_k3"
cp "$HERE/fused_kda_chunk_kernel_rocm.cu" "$BUILD/kimi_k3/"
cp "$HERE/torch_utils.h" "$BUILD/torch_utils.h"

TORCH_DIR=$(python -c "import torch,os;print(os.path.dirname(torch.__file__))")
FLAGS=(-O3 -std=c++20 -fPIC --offload-arch=gfx950 -DUSE_ROCM -D__HIP_PLATFORM_AMD__=1
       -I"$TORCH_DIR/include" -I"$TORCH_DIR/include/torch/csrc/api/include")

hipcc "${FLAGS[@]}" -x hip -c "$BUILD/kimi_k3/fused_kda_chunk_kernel_rocm.cu" -o "$BUILD/chunk.o" &
hipcc "${FLAGS[@]}" -c "$HERE/bindings.cpp" -o "$BUILD/bindings.o" &
wait
hipcc -shared -fPIC --offload-arch=gfx950 "$BUILD/chunk.o" "$BUILD/bindings.o" \
  -L"$TORCH_DIR/lib" -ltorch -ltorch_cpu -ltorch_hip -lc10 -lc10_hip \
  -Wl,-rpath,"$TORCH_DIR/lib" -o "$HERE/libkda_sota.so"
echo "built $HERE/libkda_sota.so"
