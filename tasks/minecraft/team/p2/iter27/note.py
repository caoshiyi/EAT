"""Append a truthful UTC-stamped owner note from stdin; no arena/world access."""
import datetime,sys
from pathlib import Path
message=sys.stdin.read().strip()
if not message:raise SystemExit('empty note')
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (Path(__file__).resolve().parent/'WORK_LOG.md').open('a') as f:f.write('\n'+stamp+' — '+message+'\n')
print(stamp)
