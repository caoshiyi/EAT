"""Write coordinator-owned memory only. No arena/world operations."""
import argparse,datetime,os,pathlib,re,sys
b=pathlib.Path(os.environ['EAT_ROOT'])/'tasks/minecraft/team'
m=b/'mission/iter18'
a=argparse.ArgumentParser();g=a.add_mutually_exclusive_group(required=True);g.add_argument('--note');g.add_argument('--review');a.add_argument('--dispatch',action='store_true');v=a.parse_args()
label=v.note or v.review
if not re.fullmatch(r'[a-zA-Z0-9_-]+',label):raise SystemExit('invalid label')
body=sys.stdin.read().strip()+'\n'
if len(body)<3:raise SystemExit('empty body')
kind='note' if v.note else 'review'
p=m/(kind+'_'+label+'.md')
if p.exists():raise SystemExit('record exists; preserve history with a new label')
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
body=f'# Iteration18 {kind} {label} — {stamp}\n\n'+body
p.write_text(body)
assert p.read_text()==body
if v.review:
 (b/'REVIEW.md').write_text(body)
 assert (b/'REVIEW.md').read_text()==body
 with (b/'EVOLUTION_HISTORY.md').open('a') as f:f.write('\n'+body)
if v.dispatch:
 with (b/'PLAN.md').open('a') as f:f.write('\n'+body)
print(f'Checked {p.relative_to(b)} ({len(body)} characters); review={bool(v.review)}, dispatch={v.dispatch}')
