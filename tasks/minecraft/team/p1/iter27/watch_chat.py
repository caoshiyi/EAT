"""Read-only arena coordination watch; bounded wait, exits on new chat. Never runs a player."""
import argparse
from datetime import datetime, timezone
import subprocess
import sys
import time

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--since', type=int, required=True, help='Last chat ID already read; arena CLI itself is inclusive')
p.add_argument('--seconds', type=float, default=40)
a = p.parse_args()
if not 0 < a.seconds <= 45:
    raise SystemExit('Watch must be at most45seconds')
end = time.monotonic() + a.seconds
while True:
    r = subprocess.run([sys.executable, 'tools/mc_arena.py', 'chat', '--since', str(a.since + 1)],
                       capture_output=True, text=True)
    if r.returncode or r.stdout.strip():
        print(datetime.now(timezone.utc).isoformat(timespec='seconds'), flush=True)
        print(r.stdout + r.stderr, flush=True)
        raise SystemExit(r.returncode)
    remaining = end - time.monotonic()
    if remaining <= 0:
        print(datetime.now(timezone.utc).isoformat(timespec='seconds'), 'NO_NEW_CHAT', flush=True)
        break
    time.sleep(min(5, remaining))
