"""Speed suite for an OpenAI-compatible server (/v1/chat/completions, streamed): the same requests for
every engine, so the numbers compare across engines on the same machine and model file.

    speed_suite.py --port PORT --corpus CORPUS.txt --out OUT.json [--only NAME,...] [--model NAME]

Cases (thinking off, temperature 0, a fresh nonce at the start of every prompt so no prefix cache
is reused across cases):
  decode      a ~100-token request, 512 output tokens: decode tok/s
  prefill_4k  ~4K-token document + question, 32 output tokens: prompt tok/s
  prefill_32k ~32K
  long_128k   ~128K-token document with a needle, 256 output tokens: prompt tok/s, decode tok/s, found
  long_256k   ~250K
Prompt tok/s = prompt_tokens / time to the first streamed token; decode tok/s = (tokens - 1) /
(last token time - first token time), counting streamed content deltas when the server sends no usage.
"""

from __future__ import annotations

import argparse
import json
import random
import time
import urllib.request

CHARS_PER_TOKEN = 4.3
CASES = {
    "decode": dict(tokens=0, max_tokens=512, needle=False),
    "prefill_4k": dict(tokens=4096, max_tokens=32, needle=False),
    "prefill_32k": dict(tokens=32768, max_tokens=32, needle=False),
    "long_128k": dict(tokens=131072, max_tokens=256, needle=True),
    "long_256k": dict(tokens=250000, max_tokens=256, needle=True),
}
STORY = ("Write a long, detailed story about a lighthouse keeper who discovers a message in a bottle. "
         "Describe the setting, the characters and the events in vivid detail.")


def build_prompt(name: str, spec: dict, corpus: str, nonce: str) -> tuple[str, str | None]:
    if spec["tokens"] == 0:
        return f"[{nonce}] {STORY}", None
    n_chars = int(spec["tokens"] * CHARS_PER_TOKEN)
    rep = corpus * (n_chars // len(corpus) + 1)
    doc = rep[:n_chars]
    answer = None
    if spec["needle"]:
        rng = random.Random(name)
        answer = f"{rng.choice(['amber', 'cobalt', 'violet', 'scarlet'])}-{rng.randint(1000, 9999)}-{rng.choice(['heron', 'otter', 'lynx', 'falcon'])}"
        at = int(len(doc) * 0.37)
        at = doc.rfind("\n", 0, at) + 1
        doc = doc[:at] + f"\nIMPORTANT NOTE: the secret pass phrase is {answer}. Remember it.\n" + doc[at:]
        q = "What is the secret pass phrase mentioned in the document? Answer with the phrase only, then summarize the document in a few paragraphs."
    else:
        q = "Summarize the document above in one sentence."
    return f"[{nonce}]\n<document>\n{doc}\n</document>\n\n{q}", answer


def run_case(port: int, model: str, prompt: str, max_tokens: int) -> dict:
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.0,
        "stream": True,
        "stream_options": {"include_usage": True},
        "chat_template_kwargs": {"enable_thinking": False},
    }
    req = urllib.request.Request(f"http://127.0.0.1:{port}/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    t0 = time.perf_counter()
    first = last = None
    deltas = 0
    usage = None
    finish = None
    text = []
    with urllib.request.urlopen(req, timeout=4 * 3600) as resp:
        for raw in resp:
            line = raw.decode("utf-8", "replace").strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            try:
                ev = json.loads(data)
            except ValueError:
                continue
            if ev.get("usage"):
                usage = ev["usage"]
            for ch in ev.get("choices") or []:
                d = ch.get("delta") or {}
                piece = (d.get("content") or "") + (d.get("reasoning_content") or d.get("reasoning") or "")
                if piece:
                    now = time.perf_counter()
                    first = first if first is not None else now
                    last = now
                    deltas += 1
                    text.append(d.get("content") or "")
                if ch.get("finish_reason"):
                    finish = ch["finish_reason"]
    t1 = time.perf_counter()
    ptoks = (usage or {}).get("prompt_tokens")
    ctoks = (usage or {}).get("completion_tokens") or deltas
    ttft = (first - t0) if first is not None else None
    dec = (ctoks - 1) / (last - first) if first is not None and last > first and ctoks > 1 else None
    return {"prompt_tokens": ptoks, "completion_tokens": ctoks, "ttft_s": ttft, "total_s": t1 - t0,
            "prompt_tok_s": (ptoks / ttft) if ptoks and ttft else None, "decode_tok_s": dec, "finish": finish,
            "text_head": "".join(text)[:300]}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, required=True)
    ap.add_argument("--corpus", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="")
    ap.add_argument("--model", default="default")
    args = ap.parse_args()
    corpus = open(args.corpus, encoding="utf-8").read()
    names = [n for n in CASES if not args.only or n in args.only.split(",")]
    out = {}
    for name in names:
        spec = CASES[name]
        prompt, answer = build_prompt(name, spec, corpus, f"{name}-{time.time_ns()}")
        r = run_case(args.port, args.model, prompt, spec["max_tokens"])
        if answer is not None:
            r["needle"] = answer
            r["found"] = answer in r["text_head"]
        out[name] = r
        print(name, json.dumps({k: v for k, v in r.items() if k != "text_head"}), flush=True)
        json.dump(out, open(args.out, "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
