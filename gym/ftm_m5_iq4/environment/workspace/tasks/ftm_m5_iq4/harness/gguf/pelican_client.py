#!/usr/bin/env python3
"""Send the pelican storyboard prompt to a local ftm server and save the reply.

usage: pelican_client.py OUT_DIR [--port 1919] [--max-tokens 32768] [--prefix-tokens N] [--temperature 0]

Streams /v1/chat/completions, records TTFT, reasoning / content token counts and decode
rate, and writes OUT_DIR/{reply.json, reasoning.txt, content.md, storyboard.html}.
--prefix-tokens prepends that many tokens of filler context to test long prompts.
"""

import argparse
import json
import re
import time
import urllib.request
from pathlib import Path

PROMPT = (
    "给我一个鹈鹕骑车的导演脚本，这份脚本只给我表格形式，并且写成网页，网页要有分镜svg配图，"
    "要求有迪斯尼风格，这份脚本将充分体现你的专业性，压倒其他大模型的脚本能力，注意这个表格只给配图，"
    "不需要文字，第一行第三张图，主角带墨镜，头盔，穿飞行夹克，围着橙白相间的围巾，背景的左下角要出现一个路人；"
    "第三行第二张图，主角没戴头盔，穿西海岸风格T恤，没有围巾，手里有一杯草莓饮料；一行6个配图，共4行"
)
FILLER = "The quick brown fox jumps over the lazy dog near the river bank. "


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--port", type=int, default=1919)
    ap.add_argument("--max-tokens", type=int, default=32768)
    ap.add_argument("--prefix-tokens", type=int, default=0)
    ap.add_argument("--effort", default=None, help="reasoning_effort: low / high / max / off")
    ap.add_argument("--temperature", type=float, default=0.0,
                    help="0 = greedy; a negative value sends none (the checkpoint's sampling)")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    content = PROMPT
    if args.prefix_tokens:
        # ~14 tokens per filler sentence
        content = FILLER * (args.prefix_tokens // 14) + "\n\n" + PROMPT
    body = {
        "model": "qwen3.8-flash-next",
        "messages": [{"role": "user", "content": content}],
        "max_tokens": args.max_tokens,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    if args.effort:
        body["reasoning_effort"] = args.effort
    if args.temperature >= 0:
        body["temperature"] = args.temperature
    req = urllib.request.Request(
        f"http://127.0.0.1:{args.port}/v1/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    t0 = time.perf_counter()
    first = None
    reasoning, text, usage, finish, chunks = [], [], None, None, 0
    with urllib.request.urlopen(req, timeout=36000) as resp:
        for raw in resp:
            line = raw.decode().strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            msg = json.loads(data)
            if msg.get("usage"):
                usage = msg["usage"]
            for ch in msg.get("choices", []):
                d = ch.get("delta", {})
                piece = (d.get("reasoning_content") or "") + (d.get("content") or "")
                if piece and first is None:
                    first = time.perf_counter() - t0
                if d.get("reasoning_content"):
                    reasoning.append(d["reasoning_content"])
                if d.get("content"):
                    text.append(d["content"])
                chunks += bool(piece)
                finish = ch.get("finish_reason") or finish
    total = time.perf_counter() - t0
    content_s = "".join(text)
    (out / "reasoning.txt").write_text("".join(reasoning))
    (out / "content.md").write_text(content_s)
    m = re.search(r"```html\s*(.*?)```", content_s, re.S) or re.search(
        r"(<!DOCTYPE html.*?</html>)", content_s, re.S | re.I
    )
    if m:
        (out / "storyboard.html").write_text(m.group(1))
    comp = (usage or {}).get("completion_tokens") or chunks
    rec = {
        "prefix_tokens": args.prefix_tokens,
        "ttft_s": first,
        "total_s": total,
        "usage": usage,
        "finish_reason": finish,
        "decode_tok_s": comp / (total - first) if first and total > first else None,
        "html_found": bool(m),
        "svg_count": content_s.count("<svg"),
    }
    (out / "reply.json").write_text(json.dumps(rec, indent=1))
    print(json.dumps(rec, indent=1))


if __name__ == "__main__":
    main()
