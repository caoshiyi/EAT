"""Line-overlap check: does the clean-room candidate share code with sources the sandbox hides?

Normalized source lines (whitespace collapsed, comments stripped, >= 30 chars) of the candidate are
matched against (a) everything the sandbox allows (e.g. a pre-cutoff library snapshot, CUTLASS) and
(b) forbidden sources (e.g. the post-cutoff versions of the same library). A line found in (b) but not
in (a) could only have come from outside the clean room.

Usage: python cleanroom/audit_code_overlap.py CANDIDATE_DIRS ALLOWED_DIRS FORBIDDEN_DIRS   (each comma-separated)
Set EAT_FORBIDDEN_NAME (e.g. "kda") to only compare forbidden files whose path contains that substring.
"""

import os
import re
import sys
from pathlib import Path

EXT = {".cu", ".cuh", ".h", ".hpp", ".py", ".ptx", ".cpp", ".cc"}
CAND = [Path(p) for p in sys.argv[1].split(",")]
ALLOWED = [Path(p) for p in sys.argv[2].split(",")]
FORBIDDEN = [Path(p) for p in sys.argv[3].split(",")]


def norm_lines(path):
    try:
        text = path.read_text(errors="replace")
    except OSError:
        return set()
    out = set()
    for line in text.splitlines():
        line = re.sub(r"//.*|#(?!include|define|pragma).*", "", line)
        line = " ".join(line.split())
        if len(line) >= 30:
            out.add(line)
    return out


def corpus(roots, name=""):
    lines = {}
    for root in roots:
        files = [root] if root.is_file() else (p for p in root.rglob("*") if p.is_file())
        for p in files:
            if p.suffix not in EXT or (name and name not in str(p).lower()):
                continue
            for line in norm_lines(p):
                lines.setdefault(line, str(p))
    return lines


cand = corpus(CAND)
allowed = corpus(ALLOWED)
forbidden = corpus(FORBIDDEN, os.environ.get("EAT_FORBIDDEN_NAME", "").lower())
only_forbidden = [l for l in cand if l in forbidden and l not in allowed]
print(f"candidate lines {len(cand)}; in allowed sources {sum(l in allowed for l in cand)}; "
      f"in forbidden sources {sum(l in forbidden for l in cand)}; forbidden-only {len(only_forbidden)}")
for l in only_forbidden[:40]:
    print(f"  {cand[l].split('/tasks/')[-1]}  <=  {forbidden[l]}\n      {l[:160]}")
