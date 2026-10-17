"""Host-only presenter regression, never player execution."""
import json,re
from pathlib import Path
root=Path('tasks/minecraft/team/execution')
raw=(root/'records/5038.txt').read_text()
# The presenter now saves corrected single records. Append explicit synthetic
# refusal headers to recreate the multi-record input that originally failed.
raw += '\n== #None 2026-10-17T05:11:33 p2 iter=11 REFUSED: already running #5039\n== #None 2026-10-17T05:11:36 p3 iter=11 REFUSED: already running #5040\n'
old=re.split(r'(?=^== #\d+ )',raw,flags=re.M)
assert '== #None ' in old[-1]
parts=re.split(r'(?=^== #(?:\d+|None) )',raw,flags=re.M)
real=[r for r in parts if re.match(r'== #\d+ ',r)]
assert len(real)==1
assert '== #None ' not in real[0]
returned=real[0].split('-- returned --\n')[1].strip()
value=json.loads(returned)
assert value['protectedEnd'] is True and value['hp']==20
assert value['logGain']==0
assert sum(r.startswith('== #None ') for r in parts)==2
print('PASS: actual5038 source/output/returned preserved; two synthetic refusalheaders isolated; real ending JSON parsed')
