"""Judge the free-running probe replies of an eval (runs in the naive checkout's venv, so the
parsers that judge a candidate are not the candidate's).

A reply is valid when it ends (EOS within the probe budget) and either every tool call it makes
parses with the qwen3_coder parser into a known tool with its required parameters, or it makes
no call and leaves a non-empty answer with no stray tool-call markup.

usage: probe_check.py --model DIR --result RESULT.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from ftmetal.server.function_call_parser import FunctionCallParser
from ftmetal.server.reasoning_parser import ReasoningParser
from tokenizers import Tokenizer

sys.path.insert(0, str(Path(__file__).resolve().parent))
from agent_env import TOOLS, tool_names  # noqa: E402

EOS = (248044, 248046)


def judge(tok: Tokenizer, tokens: list[int]) -> tuple[bool, str]:
    if not tokens or tokens[-1] not in EOS:
        return False, "truncated"
    text = tok.decode(tokens[:-1], skip_special_tokens=False)
    _, content = ReasoningParser("qwen3", force_reasoning=True).parse_non_stream(text)
    parsed = FunctionCallParser(TOOLS, "qwen3_coder").parse_non_stream(content)
    required = tool_names()
    if parsed.calls:
        for call in parsed.calls:
            if call.name not in required:
                return False, f"unknown tool {call.name}"
            try:
                arguments = json.loads(call.parameters or "{}")
            except json.JSONDecodeError:
                return False, f"{call.name}: arguments are not JSON"
            missing = [p for p in required[call.name] if p not in arguments]
            if missing:
                return False, f"{call.name}: missing {missing}"
        return True, "tool calls " + ", ".join(c.name for c in parsed.calls)
    if "<tool_call>" in content or "<function=" in content:
        return False, "unparsed tool-call markup"
    if not parsed.normal_text.strip():
        return False, "empty answer"
    return True, "answer"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--result", required=True)
    args = parser.parse_args()
    tok = Tokenizer.from_file(str(Path(args.model) / "tokenizer.json"))
    result = json.loads(Path(args.result).read_text())
    verdicts = []
    for p in result.get("probes", []):
        ok, why = judge(tok, p["tokens"])
        verdicts.append({"name": p["name"], "valid": ok, "why": why, "tokens": len(p["tokens"])})
    print(json.dumps(verdicts))


if __name__ == "__main__":
    main()
