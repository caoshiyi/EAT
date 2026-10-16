"""Summarize the coordinator's read-only collector; preserve full raw evidence."""
import json,pathlib,re,subprocess,sys

def summarize(s):
 lines=s.splitlines(); states=[]; results={}
 for line in lines:
  if re.match(r'p[1-4]:',line):states.append(line)
 for segment in re.split(r'(?=^== #)',s,flags=re.M):
  m=re.match(r'== #(\d+).* (p[1-4]) ',segment)
  if not m:continue
  relevant=[l for l in segment.splitlines()if re.match(r'([A-Z_]*FINAL |END |ROUTE_RESULT|ISSUE|RECOVERY_FAIL|\{"issue")',l)]
  if relevant:results[m[2]]='#'+m[1]+' '+relevant[-1][:260]
 events=[l for l in lines if l.startswith('EVENT')]
 chat=[l[:300]for l in lines if l.startswith('CHAT')and not re.search(r'_TICK |P1_THRESHOLD_LIVE',l)][-12:]
 score=[l for l in lines if re.match(r'(milestones|deaths|programs|dragon) =',l)]
 failures=[l for l in lines if l.startswith('QUERY_FAILED')]
 return {'time':lines[0]if lines else 'NO_OUTPUT','state':states,'new':results,'events':events,'chat':chat,'score':score,'failures':failures}

sample='UTC test\np1: (1, 2, 3), health20; active\n== #10 time p1 role=x\nISSUE bad\nFINAL retained\n== #9 time p3 role=y\n{"issue":null,"hp":20}\nEVENT death\nCHAT #5 text\ndragon = 0\n'
a=summarize(sample)
assert a['new']['p1']=='#10 FINAL retained' and a['new']['p3'].startswith('#9 ')and a['events']==['EVENT death']and a['score']==['dragon = 0']
if '--test' in sys.argv:
 print('fixture passed: full finals, returned JSON, out-of-order IDs, event, score');raise SystemExit
p=pathlib.Path(__file__).with_name('monitor.py')
r=subprocess.run([sys.executable,str(p),*sys.argv[1:]],text=True,capture_output=True,timeout=50)
if r.returncode: print('COLLECTOR_FAILED',r.returncode,r.stderr);raise SystemExit(r.returncode)
summary=summarize(r.stdout)
match=re.search(r'raw (\S+\.json)',r.stdout.splitlines()[0])
if match:
 raw=json.loads(p.with_name(match[1]).read_text())
 full=raw.get('status',{}).get('stdout','').splitlines();assets={}
 for idx,line in enumerate(full):
  role=re.match(r'(p[1-4]):',line)
  if role and idx+1<len(full): assets[role[1]]=full[idx+1].strip()
 summary['actual_inventory']=assets
pathlib.Path(__file__).with_name('LATEST_BRIEF.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,separators=(',',':')))
