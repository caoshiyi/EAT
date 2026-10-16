"""Append literal review evidence to owned memory; never executes arena/player code."""
import argparse,datetime,os,pathlib,sys
p=argparse.ArgumentParser();p.add_argument('--history',action='store_true');a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT'])/'tasks/minecraft/team'
body=sys.stdin.read().strip()
if not body:raise SystemExit('empty note refused')
now=datetime.datetime.now(datetime.timezone.utc).strftime('%H:%M:%S UTC')
paths=['REVIEW.md','mission/ITER5_LEDGER.md']+(['EVOLUTION_HISTORY.md']if a.history else [])
for name in paths:
 with (root/name).open('a')as f:f.write('\n'+now+': '+body+'\n')
print('appended',now,','.join(paths))
