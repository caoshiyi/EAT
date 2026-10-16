"""Refresh only P1's three live lines from a verified owned program log."""
import argparse,json,re
from pathlib import Path
from datetime import datetime,timezone
p=argparse.ArgumentParser();p.add_argument('log',type=Path);p.add_argument('--active',default='NONE');p.add_argument('--next',required=True);p.add_argument('--write',action='store_true');a=p.parse_args()
root=Path('tasks/minecraft/team/p1').resolve();log=a.log.resolve()
if not log.is_relative_to(root):p.error('owned logs only')
t=log.read_text();matches=re.findall(r'COVERED_ENDPOINT_VERIFIED (\{[^\n]*\})',t)
if not matches or not re.search(r'FINAL .*dead false adopted true',t):p.error('no verified adoption; do not overwrite live state')
r=json.loads(matches[-1]);pid=re.search(r'program #(\d+) on p1',t).group(1);now=datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
lines=[f'Actual lastcompleted #{pid}: Nether feet{tuple(r["origin"])}, HP{r["hp"]} food{r["food"]}, FULLSHELL/adoptedtrue/deadfalse; constructionmats{r["mats"]}. Actual body last FINAL in p1/{log.name}.',f'Back lastverified {tuple(r["back"])} lower+head CLOSED. Earlier route plugs require fresh inspection; no blind reverse.',f'Active {a.active}. Next: {a.next}']
print('\n'.join(lines))
if a.write:
 f=Path('tasks/minecraft/team/P1.md');s=f.read_text();s=re.sub(r'^# P1 live.*$',f'# P1 live — {now}',s,flags=re.M)
 for prefix,line in zip(['Actual lastcompleted','Back','Active'],lines):s=re.sub('^'+prefix+r'.*$',line,s,count=1,flags=re.M)
 f.write_text(s)
