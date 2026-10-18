"""Combine reviewed normal-API helpers and an owned program body; no world actions."""
import sys
from pathlib import Path
root=Path(__file__).parent
body=Path(sys.argv[1])
out=Path(sys.argv[2])
out.write_text((root/'allowed_helpers.js').read_text()+"\n"+body.read_text())
print(out)
