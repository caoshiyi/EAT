# Host-only actual-record replay; imports read-only helpers, never scans/runs players.
import importlib.util, json
from pathlib import Path
p = Path(__file__).parent
spec = importlib.util.spec_from_file_location('execution_watch', p / 'watch.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
a = m.ending_alert((p / 'records/4103.txt').read_text())
assert a['issue'] == 'DROP_CENTER_POST' and a['preceding_selfAir']['raw'] == 168
for n in [4031, 4097, 4105, 4130]:
    assert m.ending_alert((p / f'records/{n}.txt').read_text()) is None, n
# This flag was initialized false despite an already-closed camp/newlife.
# Preserve the report as an inspection trigger, not physical exposure proof.
a = m.ending_alert((p / 'records/4125.txt').read_text())
assert a['protectedEnd'] is False and a['doors'] == [False, False]
raw = (p / 'records/4134.txt').read_text().split('-- returned --', 1)[1].strip()
a = m.summarize_return(raw)
assert a['killed'] is True and a['hits'] == 8 and a['pearlDelta'] == 0 and a['full'] is True
print('PASS wet alert/selfair, normal camp/repaired exclusions, stale flag counterexample, kill without pearl summary')
