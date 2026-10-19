"""Read canonical arena events in BOTH worlds; include idle deaths, never infer from runs.
Run from EAT_ROOT. No server/files/.work access; arena CLI is the only world interface.
"""
import argparse,collections,concurrent.futures,datetime,json,pathlib,re,subprocess,sys
ap=argparse.ArgumentParser();ap.add_argument('--since',default='2026-10-19T07:20:00');ap.add_argument('--output',default='death_audit_latest.json');args=ap.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter31').resolve();out=(root/args.output).resolve()
if not out.is_relative_to(root):raise SystemExit('owned output only')
def read(sb):
 cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if sb else [])+['events','--type','death','--last','10000']
 r=subprocess.run(cmd,text=True,capture_output=True,timeout=15)
 if r.returncode:raise RuntimeError(('SB' if sb else 'LIVE')+' incomplete: '+r.stdout+r.stderr)
 lines=[line for line in r.stdout.splitlines() if re.match(r'^\d{4}-\d\d-\d\dT',line) and line[:19]>=args.since]
 counts=collections.Counter()
 for line in lines:
  m=re.search(r'player=(p[1-4])\b',line)
  if not m:raise RuntimeError('unparsed canonical death: '+line)
  counts[m.group(1)]+=1
 return {'count':len(lines),'by_player':dict(counts),'events':lines}
with concurrent.futures.ThreadPoolExecutor(2) as pool:
 fs={name:pool.submit(read,sb) for name,sb in [('LIVE',False),('SANDBOX',True)]}
 result={name:f.result() for name,f in fs.items()}
result={'captured_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'since':args.since,'evidence':'canonical arena death events; includes idle deaths; does not establish current body',**result}
tmp=out.with_suffix('.tmp');tmp.write_text(json.dumps(result,indent=2)+'\n');tmp.replace(out)
for name in ['LIVE','SANDBOX']:
 d=result[name];print(name,d['count'],json.dumps(d['by_player'],sort_keys=True))
 for line in d['events']:print(line)
print('WROTE',out)
