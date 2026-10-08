#!/usr/bin/env python3
"""Classify one `claude --print --output-format json` call: prints ok | limit | error.

    call_status.py OUT_JSON [STDERR_FILE] [EXIT_CODE]

ok     the output is a result that is not an error
limit  the call failed for a reason that passes with time or a new login (usage or rate limit, overload, auth)
error  anything else
"""
import json
import re
import sys

LIMIT = re.compile(r"usage limit|rate.?limit|limit reached|too many requests|\b429\b|overloaded|\b529\b|\b50[0234]\b|"
                   r"quota|credit balance|/login|not logged in|log in|authenticat|unauthorized|\b401\b|\b403\b|oauth|"
                   r"connection|timed? ?out|network|ECONN|ENOTFOUND|socket hang up", re.I)


def read(path: str) -> str:
    try:
        return open(path, errors="replace").read()
    except OSError:
        return ""


def main() -> str:
    out = read(sys.argv[1]) if len(sys.argv) > 1 else ""
    err = read(sys.argv[2]) if len(sys.argv) > 2 else ""
    rc = sys.argv[3] if len(sys.argv) > 3 else "0"
    result = None
    for line in out.splitlines():           # the result object is one JSON line; take the last that parses
        try:
            d = json.loads(line)
        except ValueError:
            continue
        if isinstance(d, dict) and ("result" in d or "is_error" in d):
            result = d
    if result is not None and not result.get("is_error") and "result" in result and rc == "0":
        return "ok"
    text = (str(result.get("result", "")) if result else out[-2000:]) + "\n" + err[-2000:]
    return "limit" if LIMIT.search(text) else "error"


if __name__ == "__main__":
    print(main())
