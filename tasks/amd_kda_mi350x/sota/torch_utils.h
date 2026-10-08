#pragma once

// HIP port of vllm/csrc/libtorch_stable/torch_utils.h, limited to what the
// Kimi-K3 KDA kernels use.

#include <torch/csrc/inductor/aoti_torch/c/shim.h>
#include <torch/csrc/stable/accelerator.h>
#include <torch/csrc/stable/ops.h>
#include <torch/csrc/stable/tensor.h>
#include <torch/headeronly/util/shim_utils.h>

#include <hip/hip_runtime.h>

#include <deque>
#include <mutex>
#include <string>
#include <vector>

#define STD_TORCH_CHECK_NOT_IMPLEMENTED(cond, ...) \
  STD_TORCH_CHECK(cond, "NotImplementedError: ", __VA_ARGS__)

inline std::deque<std::once_flag> device_flags;
inline std::vector<hipDeviceProp_t> device_properties;
inline std::once_flag vectors_init_flag;

inline void do_init_device_vectors() {
  int device_count;
  hipError_t err = hipGetDeviceCount(&device_count);
  STD_TORCH_CHECK(err == hipSuccess, "hipGetDeviceCount failed: " +
                                         std::string(hipGetErrorString(err)));
  device_flags.resize(device_count);
  device_properties.resize(device_count);
}

inline void initDeviceProperty(int device_index) {
  hipDeviceProp_t device_prop{};
  hipError_t err = hipGetDeviceProperties(&device_prop, device_index);
  STD_TORCH_CHECK(err == hipSuccess, "hipGetDeviceProperties failed: " +
                                         std::string(hipGetErrorString(err)));
  device_properties[device_index] = device_prop;
}

inline hipDeviceProp_t* get_device_prop() {
  std::call_once(vectors_init_flag, do_init_device_vectors);
  int device_index;
  hipError_t err = hipGetDevice(&device_index);
  STD_TORCH_CHECK(err == hipSuccess,
                  "hipGetDevice failed: " + std::string(hipGetErrorString(err)));
  std::call_once(device_flags[device_index], initDeviceProperty, device_index);
  return &device_properties[device_index];
}

inline hipStream_t get_current_cuda_stream(int32_t device_index = -1) {
  void* stream_ptr = nullptr;
  TORCH_ERROR_CODE_CHECK(
      aoti_torch_get_current_cuda_stream(device_index, &stream_ptr));
  return reinterpret_cast<hipStream_t>(stream_ptr);
}
