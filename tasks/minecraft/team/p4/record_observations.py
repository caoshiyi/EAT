"""Read-only arena records -> own memory JSONL. Never runs a player program."""
import argparse,json,re,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--last',type=int,default=25);a=p.parse_args()
base=Path('tasks/minecraft/team/p4');dest=base/'observations.jsonl'
old=[json.loads(x) for x in dest.read_text().splitlines() if x] if dest.exists() else []
keys={(x['program'],x['kind']) for x in old}
r=subprocess.run(['python3','tools/mc_arena.py','programs','--player','p4','--last',str(a.last),'--full'],capture_output=True,text=True,check=True)
program=None;added=[]
for line in r.stdout.splitlines():
 m=re.match(r'^== #(\d+)\s+(\S+)',line)
 if m:program=int(m[1]);time=m[2];continue
 m=re.match(r'^(BRIDGE_POST|QUARRY_POST_JSON|ANCHOR_POST|SUPPORT_POST|P4_TUNNEL_POST_JSON|GAP_POST_JSON|ANCHOR_ACTUAL_JSON|P4_SHELF_ANCHOR_JSON|ENDPOINT_ACTUAL|ROOF_BRIDGE_POST) (\{.*\})$',line)
 if not m or program is None:continue
 key=(program,m[1])
 if key in keys:continue
 row={'program':program,'timestamp':time,'kind':m[1],'actual':json.loads(m[2])}
 keys.add(key);old.append(row);added.append(row)
dest.write_text(''.join(json.dumps(x,separators=(',',':'))+'\n' for x in old))
print(json.dumps({'added':len(added),'total':len(old),'programs':[x['program'] for x in added]}))
