"""Append an actual UTC-stamped note to P1's owned work log (stdin)."""
from datetime import datetime, timezone
from pathlib import Path
import sys

note = sys.stdin.read().strip()
if not note:
    raise SystemExit('No note; nothing changed')
stamp = datetime.now(timezone.utc).isoformat(timespec='seconds')
path = Path(__file__).resolve().parent / 'WORK_LOG.md'
with path.open('a') as f:
    f.write(f'\n{stamp} — {note}\n')
print(stamp, 'appended', len(note), 'characters to', path)
