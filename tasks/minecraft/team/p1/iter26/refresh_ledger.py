"""Summarize captured arena outputs, preserving failed callers independently of cleanup."""
import csv,json,pathlib,re
root=pathlib.Path('tasks/minecraft/team/p1/iter26');rows=[]
for p in root.glob('*.out'):
    raw=p.read_text();body=raw.split('--- output ---',1)[-1].split('--- returned ---',1)[0]
    ts=[json.loads(l[9:]) for l in body.splitlines() if l.startswith('TERMINAL ')]
    t=ts[-1] if ts else {};s=t.get('state',{});errors=[l for l in body.splitlines() if re.match(r'^(?:FAIL|CLOSE_FAIL|PRIMARY_FAILURE|RETENTION_FAILURE)\b',l)]
    full=sum(bool(c.get('full')) for c in t.get('shell',[]));total=len(t.get('shell',[]))
    status='FAILED_BEFORE_EXECUTION' if '--- error ---' in raw and not ts else 'FAILED_CALLER' if errors else ('FULL_ENDING' if total and full==total else 'UNCLASSIFIED')
    rows.append([s.get('at',''), 'SANDBOX' if '[sandbox]' in raw[:60] else 'LIVE',p.name,raw.splitlines()[0] if raw else '',status,s.get('hp'),s.get('food'),json.dumps(s.get('p')),f'{full}/{total}', ' | '.join(errors)])
with (root/'EXPERIMENTS.tsv').open('w') as f:
    w=csv.writer(f,delimiter='\t');w.writerow(['terminal_utc','environment','capture','program','caller_status','hp','food','position','full_boundaries','errors']);w.writerows(sorted(rows))
