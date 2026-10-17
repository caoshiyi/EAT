"""Summarize a saved arena result without altering its complete raw record."""
import json, sys
from pathlib import Path
for name in sys.argv[1:]:
    raw = Path(name).read_text()
    print(name)
    print(raw.splitlines()[0] if raw else "EMPTY RAW OUTPUT")
    for line in raw.split("--- returned ---")[0].splitlines()[1:]:
        if not line.startswith(("ACTUAL ", "UP_ACTUAL ", "DOWN_ACTUAL ")):
            print(line)
    if "--- returned ---\n" in raw:
        body = raw.split("--- returned ---\n", 1)[1].split("\n--- chat", 1)[0]
        try:
            data = json.loads(body)
            if isinstance(data, dict):
                if data.get("truncated"):
                    prefix = data.get("json_prefix", "")
                    try:
                        data = json.loads(prefix.split(',"updates":', 1)[0] + "}")
                        data["arena_return_truncated"] = True
                        data["inventory_not_in_received_prefix"] = True
                    except json.JSONDecodeError:
                        data = {"arena_return_truncated": True, "json_prefix_first_400": prefix[:400]}
                for key in ("walked", "path", "positions"):
                    if isinstance(data.get(key), list):
                        a = data[key]
                        data[key] = {"count": len(a), "first": a[:1], "last": a[-1:]}
            print(json.dumps(data, indent=1))
        except json.JSONDecodeError:
            print("UNPARSED RETURN (inspect raw):", body[:1000])
    if "--- chat" in raw:
        print("--- chat" + raw.split("--- chat", 1)[1])
