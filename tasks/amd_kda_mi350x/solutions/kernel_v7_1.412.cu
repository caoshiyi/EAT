// Chunked KDA prefill (C = 16), two kernels.
// Within a chunk (G = inclusive cumulative log decay, Gm = G at the chunk midpoint):
//   Km = k*exp(G-Gm), Qm = q*exp(G-Gm), Kn = k*exp(Gm-G), Kh = k*exp(G_C-G)
//   A = strict_lower(Km Kn^T),  B = lower(Qm Kn^T),  T = (I + diag(beta) A)^-1 diag(beta)
//   W = T Km, U = T V                       (prep kernel, parallel over chunks)
//   u = U - W (em*S0),  o = scale (Qm (em*S0) + B u),  S = dec*S0 + Kh^T u
//                                           (recurrence kernel, sequential over chunks)
// with em = exp(Gm), dec = exp(G_C).
#include <hip/hip_bf16.h>
#include <hip/hip_runtime.h>

#include "kernel.h"

namespace {

constexpr int kK = 128;
constexpr int kV = 128;
constexpr int kC = 16;
constexpr int kKP = kK + 1;
constexpr int kBV = 32;
constexpr int kThreads = 256;

// Per (chunk, head) workspace: a float record (B, em, dec) and a bf16 record (W, U, Qm, Kh).
constexpr int kOffB = 0;
constexpr int kOffEm = kOffB + kC * kC;
constexpr int kOffDec = kOffEm + kK;
constexpr int kRecF = kOffDec + kK;
constexpr int kOffW = 0;
constexpr int kOffU = kOffW + kC * kK;
constexpr int kOffQ = kOffU + kC * kV;
constexpr int kOffKh = kOffQ + kC * kK;   // U and Kh stored transposed ([v][t], [k][t])
constexpr int kRecH = kOffKh + kC * kK;

typedef float floatx4 __attribute__((ext_vector_type(4)));

__device__ inline floatx4 mfma4(float a, float b, floatx4 c) {
    return __builtin_amdgcn_mfma_f32_16x16x4f32(a, b, c, 0, 0, 0);
}
typedef __bf16 bf16x8 __attribute__((ext_vector_type(8)));
typedef __bf16 bf16x4 __attribute__((ext_vector_type(4)));

__device__ inline floatx4 mfma_k32(bf16x8 a, bf16x8 b, floatx4 c) {
    return __builtin_amdgcn_mfma_f32_16x16x32_bf16(a, b, c, 0, 0, 0);
}
__device__ inline floatx4 mfma_k16(bf16x4 a, bf16x4 b, floatx4 c) {
    return __builtin_amdgcn_mfma_f32_16x16x16bf16_1k(a, b, c, 0, 0, 0);
}
__device__ inline bf16x4 to_bf4(floatx4 x) {
    return bf16x4{(__bf16)x[0], (__bf16)x[1], (__bf16)x[2], (__bf16)x[3]};
}

__device__ inline float bf2f(__hip_bfloat16 x) { return __bfloat162float(x); }
__device__ inline float sigmoidf(float x) { return 1.f / (1.f + __expf(-x)); }

// Returns (sequence, chunk-within-sequence) for global chunk index b, or seq = -1.
__device__ inline void locate_chunk(const int64_t* cu, int N, int64_t b, int& seq, int64_t& c) {
    int64_t acc = 0;
    seq = -1;
    for (int n = 0; n < N; ++n) {
        const int64_t nc = (cu[n + 1] - cu[n] + kC - 1) / kC;
        if (b < acc + nc) {
            seq = n;
            c = b - acc;
            return;
        }
        acc += nc;
    }
}

__device__ inline int64_t chunk_base(const int64_t* cu, int n) {
    int64_t acc = 0;
    for (int i = 0; i < n; ++i) acc += (cu[i + 1] - cu[i] + kC - 1) / kC;
    return acc;
}

__global__ __launch_bounds__(kThreads) void kda_prep(
    float* __restrict__ wsf, __hip_bfloat16* __restrict__ wsh,
    const __hip_bfloat16* __restrict__ q, const __hip_bfloat16* __restrict__ k,
    const __hip_bfloat16* __restrict__ v, const __hip_bfloat16* __restrict__ raw_g,
    const __hip_bfloat16* __restrict__ raw_beta, const float* __restrict__ A_log,
    const float* __restrict__ dt_bias, const int64_t* __restrict__ cu_seqlens, int N, int H,
    float lower_bound) {
    __shared__ float sq[kC][kKP];
    __shared__ float sk[kC][kKP];
    __shared__ float sv[kC][kKP];
    __shared__ float sG[kC][kKP];
    __shared__ float skm[kC][kKP];
    __shared__ float sqm[kC][kKP];
    __shared__ float skn[kC][kKP];
    __shared__ float sA[kC][kC + 1];
    __shared__ float sbeta[kC];

    const int64_t b = blockIdx.x;
    const int h = blockIdx.y;
    int n;
    int64_t c;
    locate_chunk(cu_seqlens, N, b, n, c);
    if (n < 0) return;
    const int64_t bos = cu_seqlens[n], eos = cu_seqlens[n + 1];
    const int64_t c0 = bos + c * kC;
    float* rec = wsf + (b * H + h) * (int64_t)kRecF;
    __hip_bfloat16* rech = wsh + (b * H + h) * (int64_t)kRecH;

    const int tid = threadIdx.x;
    const int wave = tid / 64, lane = tid % 64;
    const int lr = lane % 16, lq = lane / 16;
    const float a = __expf(A_log[h]);
    const int lt = tid / 16;
    const int lc = (tid % 16) * 8;
    const int64_t t = c0 + lt;
    const bool valid = t < eos;
    {
        float qv[8], kv[8], gv[8], vv[8];
        float qn = 0.f, kn = 0.f;
        if (valid) {
            const int64_t row = (t * H + h) * kK + lc;
            const uint4 qr = *reinterpret_cast<const uint4*>(q + row);
            const uint4 kr = *reinterpret_cast<const uint4*>(k + row);
            const uint4 gr = *reinterpret_cast<const uint4*>(raw_g + row);
            const uint4 vr = *reinterpret_cast<const uint4*>(v + row);
            const __hip_bfloat16* qb = reinterpret_cast<const __hip_bfloat16*>(&qr);
            const __hip_bfloat16* kb = reinterpret_cast<const __hip_bfloat16*>(&kr);
            const __hip_bfloat16* gb = reinterpret_cast<const __hip_bfloat16*>(&gr);
            const __hip_bfloat16* vb = reinterpret_cast<const __hip_bfloat16*>(&vr);
#pragma unroll
            for (int e = 0; e < 8; ++e) {
                qv[e] = bf2f(qb[e]);
                kv[e] = bf2f(kb[e]);
                vv[e] = bf2f(vb[e]);
                qn += qv[e] * qv[e];
                kn += kv[e] * kv[e];
                gv[e] = lower_bound * sigmoidf(a * (bf2f(gb[e]) + dt_bias[h * kK + lc + e]));
            }
        } else {
#pragma unroll
            for (int e = 0; e < 8; ++e) qv[e] = kv[e] = gv[e] = vv[e] = 0.f;
        }
#pragma unroll
        for (int o = 8; o > 0; o >>= 1) {
            qn += __shfl_xor(qn, o);
            kn += __shfl_xor(kn, o);
        }
        const float qs = 1.f / fmaxf(sqrtf(qn), 1e-6f);
        const float ks = 1.f / fmaxf(sqrtf(kn), 1e-6f);
#pragma unroll
        for (int e = 0; e < 8; ++e) {
            sq[lt][lc + e] = qv[e] * qs;
            sk[lt][lc + e] = kv[e] * ks;
            sv[lt][lc + e] = vv[e];
            sG[lt][lc + e] = gv[e];
        }
        if (tid < kC) {
            const int64_t t2 = c0 + tid;
            sbeta[tid] = (t2 < eos) ? sigmoidf(bf2f(raw_beta[t2 * H + h])) : 0.f;
        }
    }
    __syncthreads();
    if (tid < kK) {
        float acc = 0.f;
#pragma unroll
        for (int tt = 0; tt < kC; ++tt) {
            acc += sG[tt][tid];
            sG[tt][tid] = acc;
            if (tt == kC / 2 - 1) rec[kOffEm + tid] = __expf(acc);
        }
        rec[kOffDec + tid] = __expf(acc);
    }
    __syncthreads();
    for (int idx = tid; idx < kC * kK; idx += kThreads) {
        const int tt = idx / kK, cc = idx % kK;
        const float G = sG[tt][cc];
        const float kk = sk[tt][cc], qq = sq[tt][cc];
        const float d = G - sG[kC / 2 - 1][cc];
        const float em = __expf(d), en = __expf(-d);
        skm[tt][cc] = kk * em;
        sqm[tt][cc] = qq * em;
        skn[tt][cc] = kk * en;
        rech[kOffQ + idx] = __float2bfloat16(qq * __expf(G));
    }
    if (tid < kK) {
        const float gl = sG[kC - 1][tid];
        __hip_bfloat16 kh[kC];
#pragma unroll
        for (int tt = 0; tt < kC; ++tt) kh[tt] = __float2bfloat16(sk[tt][tid] * __expf(gl - sG[tt][tid]));
        uint4* dst = reinterpret_cast<uint4*>(rech + kOffKh + tid * kC);
        dst[0] = *reinterpret_cast<const uint4*>(&kh[0]);
        dst[1] = *reinterpret_cast<const uint4*>(&kh[8]);
    }
    __syncthreads();
    if (wave < 2) {
        float (*src)[kKP] = wave == 0 ? skm : sqm;
        floatx4 acc0 = {0.f, 0.f, 0.f, 0.f}, acc1 = acc0;
#pragma unroll
        for (int s4 = 0; s4 < kK / 4; s4 += 2) {
            acc0 = mfma4(src[lr][4 * s4 + lq], skn[lr][4 * s4 + lq], acc0);
            acc1 = mfma4(src[lr][4 * s4 + 4 + lq], skn[lr][4 * s4 + 4 + lq], acc1);
        }
#pragma unroll
        for (int r = 0; r < 4; ++r) {
            const int i = 4 * lq + r, j = lr;
            const float val = acc0[r] + acc1[r];
            if (wave == 0) sA[i][j] = (j < i) ? val : 0.f;
            else rec[kOffB + i * kC + j] = (j <= i) ? val : 0.f;
        }
    }
    __syncthreads();
    // Forward substitution: column tid of [Km | V].
    {
        float (*src)[kKP] = tid < kK ? skm : sv;
        const int col = tid % kK;
        __hip_bfloat16* dst = rech + (tid < kK ? kOffW : kOffU);
        const float emc = tid < kK ? __expf(sG[kC / 2 - 1][col]) : 1.f;
        float x[kC];
#pragma unroll
        for (int tt = 0; tt < kC; ++tt) {
            float r = src[tt][col];
#pragma unroll
            for (int j = 0; j < tt; ++j) r -= sA[tt][j] * x[j];
            x[tt] = sbeta[tt] * r;
            if (tid < kK) dst[tt * kK + col] = __float2bfloat16(x[tt] * emc);
        }
        if (tid >= kK) {
            __hip_bfloat16 xb[kC];
#pragma unroll
            for (int tt = 0; tt < kC; ++tt) xb[tt] = __float2bfloat16(x[tt]);
            uint4* d4 = reinterpret_cast<uint4*>(dst + col * kC);
            d4[0] = *reinterpret_cast<const uint4*>(&xb[0]);
            d4[1] = *reinterpret_cast<const uint4*>(&xb[8]);
        }
    }
}

// Recurrence: one wave per (sequence, head, 16-column V tile), all 128 k rows in registers.
// Element r of Sc[kt]: k = 16kt + 4lq + r, v = v0 + lr (16x16 MFMA C layout).
// All three per-chunk products keep the MFMA reduction index aligned with the C layout
// (index 4lq + r at step r), so u and the state never leave registers.
constexpr int kKT = kK / 16;     // k tiles
#ifndef NVT_T2
#define NVT_T2 1536
#endif
#ifndef NVT_T4
#define NVT_T4 (1 << 30)
#endif

template <int NVT>
struct ChunkOps {
    floatx4 dec[kKT];
    bf16x8 w[kKT / 2], qm[kKT / 2];
    bf16x4 kh[kKT];
    floatx4 u[NVT];
    floatx4 b;
};

template <int NVT>
__device__ inline void load_ops(ChunkOps<NVT>& o, const float* __restrict__ rec,
                                const __hip_bfloat16* __restrict__ rech, int lr, int lq, int v0) {
#pragma unroll
    for (int kt = 0; kt < kKT; ++kt) {
        const int kb = 16 * kt + 4 * lq;
        o.dec[kt] = *reinterpret_cast<const floatx4*>(rec + kOffDec + kb);
        o.kh[kt] = *reinterpret_cast<const bf16x4*>(rech + kOffKh + (16 * kt + lr) * kC + 4 * lq);
    }
#pragma unroll
    for (int m = 0; m < kKT / 2; ++m) {
        const bf16x4 w0 = *reinterpret_cast<const bf16x4*>(rech + kOffW + lr * kK + 32 * m + 4 * lq);
        const bf16x4 w1 = *reinterpret_cast<const bf16x4*>(rech + kOffW + lr * kK + 32 * m + 16 + 4 * lq);
        const bf16x4 q0 = *reinterpret_cast<const bf16x4*>(rech + kOffQ + lr * kK + 32 * m + 4 * lq);
        const bf16x4 q1 = *reinterpret_cast<const bf16x4*>(rech + kOffQ + lr * kK + 32 * m + 16 + 4 * lq);
        o.w[m] = bf16x8{w0[0], w0[1], w0[2], w0[3], w1[0], w1[1], w1[2], w1[3]};
        o.qm[m] = bf16x8{q0[0], q0[1], q0[2], q0[3], q1[0], q1[1], q1[2], q1[3]};
    }
#pragma unroll
    for (int vt = 0; vt < NVT; ++vt) {
        const bf16x4 uu = *reinterpret_cast<const bf16x4*>(rech + kOffU + (v0 + 16 * vt + lr) * kC + 4 * lq);
#pragma unroll
        for (int r = 0; r < 4; ++r) o.u[vt][r] = (float)uu[r];
    }
    o.b = *reinterpret_cast<const floatx4*>(rec + kOffB + lr * kC + 4 * lq);
}

// Recurrence: one wave per (sequence, head, 16*NVT V columns), all 128 k rows in registers.
// Element r of Sc[vt][kt]: k = 16kt + 4lq + r, v = v0 + 16vt + lr (16x16 MFMA C layout).
// Every product keeps the MFMA reduction index aligned with this layout, so u and the state
// never leave registers.
template <int NVT>
__device__ __forceinline__ void chunk_step(const ChunkOps<NVT>& cur, floatx4 (&Sc)[NVT][kKT],
                                           __hip_bfloat16* __restrict__ out, int64_t c0,
                                           int64_t eos, int H, int h, int v0, int lr, int lq,
                                           float scale, float ufac, bool wout) {
    const bf16x4 bb = to_bf4(cur.b);
#pragma unroll
    for (int vt = 0; vt < NVT; ++vt) {
        // ks = W S, qs = Q~ S (em folded into W, Q~ = q*exp(G)); MFMA m covers k tiles 2m, 2m+1
        floatx4 ak = {0.f, 0.f, 0.f, 0.f}, aq = ak;
#pragma unroll
        for (int m = 0; m < kKT / 2; ++m) {
            bf16x8 bs;
#pragma unroll
            for (int e = 0; e < 4; ++e) {
                bs[e] = (__bf16)Sc[vt][2 * m][e];
                bs[e + 4] = (__bf16)Sc[vt][2 * m + 1][e];
            }
            ak = mfma_k32(cur.w[m], bs, ak);
            aq = mfma_k32(cur.qm[m], bs, aq);
        }
        floatx4 u;
#pragma unroll
        for (int r = 0; r < 4; ++r) u[r] = ufac * cur.u[vt][r] - ak[r];
        const bf16x4 ub = to_bf4(u);
        const floatx4 o = mfma_k16(bb, ub, aq);
#pragma unroll
        for (int r = 0; r < 4; ++r) {
            const int64_t t2 = c0 + 4 * lq + r;
            if (t2 < eos)
                out[(t2 * H + h) * kK + v0 + 16 * vt + lr] = __float2bfloat16(o[r] * scale);
        }
        // S = dec*S + Kh^T u
#pragma unroll
        for (int kt = 0; kt < kKT; ++kt) {
            floatx4 acc = Sc[vt][kt];
#pragma unroll
            for (int r = 0; r < 4; ++r) acc[r] *= cur.dec[kt][r];
            Sc[vt][kt] = mfma_k16(cur.kh[kt], ub, acc);
        }
    }
}

template <int NVT>
__device__ __forceinline__ void run_range(floatx4 (&Sc)[NVT][kKT], const float* __restrict__ recf,
                                          const __hip_bfloat16* __restrict__ rech, int64_t sf,
                                          int64_t sh, int64_t nch, int64_t bos, int64_t eos,
                                          __hip_bfloat16* __restrict__ out, int H, int h, int v0,
                                          int lr, int lq, float scale, float ufac, bool wout) {
    if constexpr (NVT == 1) {
        ChunkOps<NVT> b0, b1, b2;
        if (nch > 0) load_ops(b0, recf, rech, lr, lq, v0);
        if (nch > 1) load_ops(b1, recf + sf, rech + sh, lr, lq, v0);
        for (int64_t ci = 0; ci < nch; ci += 3) {
            if (ci + 2 < nch) load_ops(b2, recf + (ci + 2) * sf, rech + (ci + 2) * sh, lr, lq, v0);
            chunk_step(b0, Sc, out, bos + ci * kC, eos, H, h, v0, lr, lq, scale, ufac, wout);
            if (ci + 1 >= nch) break;
            if (ci + 3 < nch) load_ops(b0, recf + (ci + 3) * sf, rech + (ci + 3) * sh, lr, lq, v0);
            chunk_step(b1, Sc, out, bos + (ci + 1) * kC, eos, H, h, v0, lr, lq, scale, ufac, wout);
            if (ci + 2 >= nch) break;
            if (ci + 4 < nch) load_ops(b1, recf + (ci + 4) * sf, rech + (ci + 4) * sh, lr, lq, v0);
            chunk_step(b2, Sc, out, bos + (ci + 2) * kC, eos, H, h, v0, lr, lq, scale, ufac, wout);
        }
    } else {
        ChunkOps<NVT> b0, b1;
        if (nch > 0) load_ops(b0, recf, rech, lr, lq, v0);
        for (int64_t ci = 0; ci < nch; ci += 2) {
            if (ci + 1 < nch) load_ops(b1, recf + (ci + 1) * sf, rech + (ci + 1) * sh, lr, lq, v0);
            chunk_step(b0, Sc, out, bos + ci * kC, eos, H, h, v0, lr, lq, scale, ufac, wout);
            if (ci + 1 >= nch) break;
            if (ci + 2 < nch) load_ops(b0, recf + (ci + 2) * sf, rech + (ci + 2) * sh, lr, lq, v0);
            chunk_step(b1, Sc, out, bos + (ci + 1) * kC, eos, H, h, v0, lr, lq, scale, ufac, wout);
        }
    }

}

template <int NVT>
__global__ __launch_bounds__(64) void kda_recur(
    __hip_bfloat16* __restrict__ out, float* __restrict__ new_state,
    const float* __restrict__ wsf, const __hip_bfloat16* __restrict__ wsh,
    const float* __restrict__ state, const int64_t* __restrict__ cu_seqlens, int H, float scale) {
    const int v0 = blockIdx.x * 16 * NVT;
    const int h = blockIdx.y;
    const int n = blockIdx.z;
    const int lane = threadIdx.x;
    const int lr = lane % 16, lq = lane / 16;
    const int64_t bos = cu_seqlens[n], eos = cu_seqlens[n + 1];
    const int64_t cb = chunk_base(cu_seqlens, n);

    const int64_t sbase = ((int64_t)n * H + h) * kV * kK + (int64_t)(v0 + lr) * kK;
    floatx4 Sc[NVT][kKT];
#pragma unroll
    for (int vt = 0; vt < NVT; ++vt)
#pragma unroll
        for (int kt = 0; kt < kKT; ++kt)
            Sc[vt][kt] = state ? *reinterpret_cast<const floatx4*>(state + sbase + 16 * vt * kK +
                                                                   16 * kt + 4 * lq)
                               : floatx4{0.f, 0.f, 0.f, 0.f};

    const int64_t nch = (eos - bos + kC - 1) / kC;
    const float* recf = wsf + (cb * H + h) * (int64_t)kRecF;
    const __hip_bfloat16* rech = wsh + (cb * H + h) * (int64_t)kRecH;
    const int64_t sf = (int64_t)H * kRecF, sh = (int64_t)H * kRecH;
    run_range(Sc, recf, rech, sf, sh, nch, bos, eos, out, H, h, v0, lr, lq, scale, 1.f, true);

#pragma unroll
    for (int vt = 0; vt < NVT; ++vt)
#pragma unroll
        for (int kt = 0; kt < kKT; ++kt)
            *reinterpret_cast<floatx4*>(new_state + sbase + 16 * vt * kK + 16 * kt + 4 * lq) =
                Sc[vt][kt];
}


// Long single sequence: chunks are split into G groups of `cpg` chunks.
// MODE 1: each group runs from S = 0 on 128 real columns (-> N_g) and from S = I on 128
//         homogeneous columns with U = 0 (-> M_g), so that S_end = M_g S_start + N_g.
//         X[g][h][col 0..255][k] (col < 128: N_g[:, col], col >= 128: M_g[:, col - 128]).
// MODE 2: each group reruns from its true start state Sst[g][h][v][k] and writes outputs.
template <int NVT, int MODE>
__global__ __launch_bounds__(64) void kda_recur_grp(
    __hip_bfloat16* __restrict__ out, float* __restrict__ new_state,
    const float* __restrict__ wsf, const __hip_bfloat16* __restrict__ wsh,
    float* __restrict__ X, const float* __restrict__ Sst, const int64_t* __restrict__ cu_seqlens,
    int H, float scale, int cpg, int G) {
    const int col0 = blockIdx.x * 16 * NVT;
    const int h = blockIdx.y;
    const int g = blockIdx.z;
    const int lane = threadIdx.x;
    const int lr = lane % 16, lq = lane / 16;
    const int64_t bos = cu_seqlens[0], eos = cu_seqlens[1];
    const int64_t nch_all = (eos - bos + kC - 1) / kC;
    const int64_t c_start = (int64_t)g * cpg;
    const int64_t nch = nch_all - c_start < cpg ? nch_all - c_start : cpg;
    const bool ident = MODE == 1 && col0 >= kV;
    const int v0 = ident ? 0 : col0;

    floatx4 Sc[NVT][kKT];
#pragma unroll
    for (int vt = 0; vt < NVT; ++vt)
#pragma unroll
        for (int kt = 0; kt < kKT; ++kt) {
            if constexpr (MODE == 1) {
#pragma unroll
                for (int r = 0; r < 4; ++r)
                    Sc[vt][kt][r] = (ident && 16 * kt + 4 * lq + r == col0 - kV + 16 * vt + lr) ? 1.f : 0.f;
            } else {
                Sc[vt][kt] = *reinterpret_cast<const floatx4*>(
                    Sst + (((int64_t)g * H + h) * kV + v0 + 16 * vt + lr) * kK + 16 * kt + 4 * lq);
            }
        }

    const float* recf = wsf + (c_start * H + h) * (int64_t)kRecF;
    const __hip_bfloat16* rech = wsh + (c_start * H + h) * (int64_t)kRecH;
    const int64_t sf = (int64_t)H * kRecF, sh = (int64_t)H * kRecH;
    run_range(Sc, recf, rech, sf, sh, nch, bos + c_start * kC, eos, out, H, h, v0, lr, lq, scale,
              ident ? 0.f : 1.f, MODE == 2);

    if constexpr (MODE == 1) {
#pragma unroll
        for (int vt = 0; vt < NVT; ++vt)
#pragma unroll
            for (int kt = 0; kt < kKT; ++kt)
                *reinterpret_cast<floatx4*>(
                    X + (((int64_t)g * H + h) * 2 * kV + col0 + 16 * vt + lr) * kK + 16 * kt + 4 * lq) =
                    Sc[vt][kt];
    } else {
        if (g == G - 1) {
#pragma unroll
            for (int vt = 0; vt < NVT; ++vt)
#pragma unroll
                for (int kt = 0; kt < kKT; ++kt)
                    *reinterpret_cast<floatx4*>(new_state + ((int64_t)h * kV + v0 + 16 * vt + lr) * kK +
                                                16 * kt + 4 * lq) = Sc[vt][kt];
        }
    }
}

// Sequential scan over groups: Sst[g] = start state of group g; Sst[g+1] = M_g Sst[g] + N_g.
// One workgroup per (16-column V tile, head); thread = (k, 8 of the 16 columns).
__global__ __launch_bounds__(256) void kda_group_scan(
    const float* __restrict__ X, float* __restrict__ Sst, const float* __restrict__ state, int H,
    int G) {
    __shared__ float sS[kK][17];
    const int v0 = blockIdx.x * 16;
    const int h = blockIdx.y;
    const int tid = threadIdx.x;
    const int kk = tid % kK, vh = (tid / kK) * 8;
    float cur[8];
#pragma unroll
    for (int j = 0; j < 8; ++j) {
        cur[j] = state ? state[((int64_t)h * kV + v0 + vh + j) * kK + kk] : 0.f;
        sS[kk][vh + j] = cur[j];
    }
    __syncthreads();
    for (int g = 0; g < G; ++g) {
        float* dst = Sst + ((int64_t)g * H + h) * kV * kK;
#pragma unroll
        for (int j = 0; j < 8; ++j) dst[(int64_t)(v0 + vh + j) * kK + kk] = cur[j];
        if (g == G - 1) break;
        const float* Xg = X + ((int64_t)g * H + h) * 2 * kV * kK;
        float acc[8];
#pragma unroll
        for (int j = 0; j < 8; ++j) acc[j] = Xg[(int64_t)(v0 + vh + j) * kK + kk];
        for (int i = 0; i < kK; ++i) {
            const float m = Xg[(int64_t)(kV + i) * kK + kk];
#pragma unroll
            for (int j = 0; j < 8; ++j) acc[j] += m * sS[i][vh + j];
        }
        __syncthreads();
#pragma unroll
        for (int j = 0; j < 8; ++j) {
            cur[j] = acc[j];
            sS[kk][vh + j] = acc[j];
        }
        __syncthreads();
    }
}

}  // namespace

#ifndef LONG_T
#define LONG_T 8192
#endif
#ifndef CPG
#define CPG 64
#endif

static bool use_long_path(int64_t total_seq_len, int32_t num_seqs) {
    return num_seqs == 1 && total_seq_len >= LONG_T;
}
static int num_groups(int64_t total_seq_len) {
    return (int)(((total_seq_len + kC - 1) / kC + CPG - 1) / CPG);
}

int64_t kda_workspace_floats(int64_t total_seq_len, int32_t num_seqs, int32_t num_heads) {
    int64_t n = (total_seq_len / kC + num_seqs) * num_heads * (int64_t)(kRecF + kRecH / 2);
    if (use_long_path(total_seq_len, num_seqs))
        n += (int64_t)num_groups(total_seq_len) * num_heads * 3 * kV * kK;
    return n;
}

void kda_prefill_kernel_launch(
    bf16_bits* output, float* new_state,
    const bf16_bits* q, const bf16_bits* k, const bf16_bits* v,
    const bf16_bits* raw_g, const bf16_bits* raw_beta,
    const float* A_log, const float* dt_bias, const float* state,
    const int64_t* cu_seqlens, int32_t num_seqs, int32_t num_heads,
    float scale, float lower_bound, int64_t total_seq_len, float* workspace,
    hipStream_t stream) {
    using bf = __hip_bfloat16;
    const int64_t max_chunks = total_seq_len / kC + num_seqs;
    float* wsf = workspace;
    bf* wsh = reinterpret_cast<bf*>(workspace + max_chunks * num_heads * (int64_t)kRecF);
    hipLaunchKernelGGL(kda_prep, dim3(max_chunks, num_heads), dim3(kThreads), 0, stream,
                       wsf, wsh, reinterpret_cast<const bf*>(q), reinterpret_cast<const bf*>(k),
                       reinterpret_cast<const bf*>(v), reinterpret_cast<const bf*>(raw_g),
                       reinterpret_cast<const bf*>(raw_beta), A_log, dt_bias, cu_seqlens,
                       num_seqs, num_heads, lower_bound);
    if (use_long_path(total_seq_len, num_seqs)) {
        const int G = num_groups(total_seq_len);
        float* X = workspace + max_chunks * num_heads * (int64_t)(kRecF + kRecH / 2);
        float* Sst = X + (int64_t)G * num_heads * 2 * kV * kK;
        const int wa = G * num_heads * (2 * kV / 16);
        if (wa >= NVT_T2)
            hipLaunchKernelGGL((kda_recur_grp<2, 1>), dim3(2 * kV / 32, num_heads, G), dim3(64), 0,
                               stream, reinterpret_cast<bf*>(output), new_state, wsf, wsh, X, Sst,
                               cu_seqlens, num_heads, scale, CPG, G);
        else
            hipLaunchKernelGGL((kda_recur_grp<1, 1>), dim3(2 * kV / 16, num_heads, G), dim3(64), 0,
                               stream, reinterpret_cast<bf*>(output), new_state, wsf, wsh, X, Sst,
                               cu_seqlens, num_heads, scale, CPG, G);
        hipLaunchKernelGGL(kda_group_scan, dim3(kV / 16, num_heads), dim3(256), 0, stream, X, Sst,
                           state, num_heads, G);
        const int wc = G * num_heads * (kV / 16);
        if (wc >= NVT_T2)
            hipLaunchKernelGGL((kda_recur_grp<2, 2>), dim3(kV / 32, num_heads, G), dim3(64), 0,
                               stream, reinterpret_cast<bf*>(output), new_state, wsf, wsh, X, Sst,
                               cu_seqlens, num_heads, scale, CPG, G);
        else
            hipLaunchKernelGGL((kda_recur_grp<1, 2>), dim3(kV / 16, num_heads, G), dim3(64), 0,
                               stream, reinterpret_cast<bf*>(output), new_state, wsf, wsh, X, Sst,
                               cu_seqlens, num_heads, scale, CPG, G);
        return;
    }
    const int waves1 = num_seqs * num_heads * (kV / 16);
    auto launch = [&](auto kern, int nvt) {
        hipLaunchKernelGGL(kern, dim3(kV / (16 * nvt), num_heads, num_seqs), dim3(64), 0, stream,
                           reinterpret_cast<bf*>(output), new_state, wsf, wsh, state, cu_seqlens,
                           num_heads, scale);
    };
    if (waves1 >= NVT_T4) launch(kda_recur<4>, 4);
    else if (waves1 >= NVT_T2) launch(kda_recur<2>, 2);
    else launch(kda_recur<1>, 1);
}
