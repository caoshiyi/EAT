// Teacher-forced top-K log-probabilities from llama.cpp on the CPU, for reference traces.
//
// Input (text, one sequence per line): "<id> <start> <end> <n> <tok_0> ... <tok_{n-1}>". The logits at positions
// start..end-1 (each predicting the next token) are reported. Output (text, one position per line):
// "<id> <pos> <tok_1> <logprob_1> ... <tok_K> <logprob_K>", the K most likely next tokens under a float64 log-softmax.
// Every sequence starts from an empty context (the model's recurrent layers cannot be rolled back to a prefix).
//
//     teacher_force MODEL.gguf IN.txt OUT.txt [top_k=20] [n_ctx=40960] [batch=2048]

#include "llama.h"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

int main(int argc, char ** argv) {
    if (argc < 4) {
        std::fprintf(stderr, "usage: %s MODEL.gguf IN.txt OUT.txt [top_k] [n_ctx] [batch]\n", argv[0]);
        return 1;
    }
    const int top_k = argc > 4 ? std::atoi(argv[4]) : 20;
    const int n_ctx = argc > 5 ? std::atoi(argv[5]) : 40960;
    const int n_batch = argc > 6 ? std::atoi(argv[6]) : 2048;

    llama_backend_init();
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0;
    llama_model * model = llama_model_load_from_file(argv[1], model_params);
    if (!model) {
        std::fprintf(stderr, "failed to load %s\n", argv[1]);
        return 1;
    }
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = n_ctx;
    ctx_params.n_batch = n_batch;
    ctx_params.n_ubatch = n_batch;
    ctx_params.n_seq_max = 1;
    const int threads = (int) std::max(1u, std::thread::hardware_concurrency());
    ctx_params.n_threads = threads;
    ctx_params.n_threads_batch = threads;
    ctx_params.no_perf = true;
    llama_context * ctx = llama_init_from_model(model, ctx_params);
    if (!ctx) {
        std::fprintf(stderr, "failed to create the context\n");
        return 1;
    }
    const int n_vocab = llama_vocab_n_tokens(llama_model_get_vocab(model));

    std::ifstream in(argv[2]);
    std::ofstream out(argv[3], std::ios::app);
    llama_batch batch = llama_batch_init(n_batch, 0, 1);
    std::string line;
    std::vector<double> logp(n_vocab);
    std::vector<int> order(n_vocab);
    while (std::getline(in, line)) {
        if (line.empty()) {
            continue;
        }
        std::istringstream fields(line);
        std::string id;
        int start, end, n;
        fields >> id >> start >> end >> n;
        std::vector<llama_token> tokens(n);
        for (int i = 0; i < n; ++i) {
            fields >> tokens[i];
        }
        llama_memory_clear(llama_get_memory(ctx), true);
        for (int base = 0; base < n; base += n_batch) {
            const int count = std::min(n_batch, n - base);
            batch.n_tokens = count;
            for (int i = 0; i < count; ++i) {
                const int pos = base + i;
                batch.token[i] = tokens[pos];
                batch.pos[i] = pos;
                batch.n_seq_id[i] = 1;
                batch.seq_id[i][0] = 0;
                batch.logits[i] = pos >= start && pos < end;
            }
            if (llama_decode(ctx, batch) != 0) {
                std::fprintf(stderr, "llama_decode failed for %s at %d\n", id.c_str(), base);
                return 1;
            }
            for (int i = 0; i < count; ++i) {
                const int pos = base + i;
                if (!(pos >= start && pos < end)) {
                    continue;
                }
                const float * logits = llama_get_logits_ith(ctx, i);
                double peak = logits[0];
                for (int v = 1; v < n_vocab; ++v) {
                    peak = std::max(peak, (double) logits[v]);
                }
                double total = 0.0;
                for (int v = 0; v < n_vocab; ++v) {
                    total += std::exp((double) logits[v] - peak);
                }
                const double log_total = std::log(total) + peak;
                for (int v = 0; v < n_vocab; ++v) {
                    logp[v] = (double) logits[v] - log_total;
                    order[v] = v;
                }
                std::partial_sort(order.begin(), order.begin() + top_k, order.end(),
                                  [&](int a, int b) { return logp[a] > logp[b]; });
                out << id << ' ' << pos;
                for (int k = 0; k < top_k; ++k) {
                    out << ' ' << order[k] << ' ' << logp[order[k]];
                }
                out << '\n';
            }
        }
        out.flush();
        std::fprintf(stderr, "%s: %d tokens, %d positions\n", id.c_str(), n, end - start);
    }
    llama_batch_free(batch);
    llama_free(ctx);
    llama_model_free(model);
    llama_backend_free();
    return 0;
}
