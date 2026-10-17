"""Compact coordinator view; observe.py retains every complete raw snapshot."""
import subprocess,re
r=subprocess.run(['python3','tasks/minecraft/team/mission/iter14/observe.py'],capture_output=True,text=True,timeout=90)
if r.returncode: print(r.stdout,r.stderr);raise SystemExit(r.returncode)
s=r.stdout;latest={};talk={};faults=[];actor=None;count=0
for line in s.splitlines():
 if line.startswith('UTC'):print(line)
 elif re.match(r'p[1-4]:',line):
  m=re.match(r'(p\d): (.*?) in (.*?), health (.*?), food (.*?), alive;(.*)',line)
  if m:print(m.group(1),m.group(2),'HP'+m.group(4),'food'+m.group(5),re.search(r'running program #[^\n]*',line).group(0) if 'running program #' in line else '')
  else:print(line)
 elif line.startswith('== #'):
  count+=1; ident=re.match(r'== #(\d+).*? (p\d) role=',line);actor=ident.group(2) if ident else None;number=ident.group(1) if ident else '?'
 elif line.startswith('RESULT') and actor:
  if '"issue":null' in line or '"issue":' in line or any(k in line for k in ['"rods":','"pearl":','"pearlNow":']):latest[actor]='#'+number+' '+line[:320]
  fault=re.search(r'"issue":"([^"]+)"',line)
  if fault:faults.append(actor+'#'+number+':'+fault.group(1))
 elif line.startswith('CHAT/SOURCE ONLY') and actor:talk[actor]='#'+number+' '+line[17:][:180]
 elif line.startswith('events') and line!='events ':print(line)
print('NEW',count,'FAILURES', '; '.join(faults)[-650:])
for actor,line in latest.items():print(actor,line)
for actor,line in talk.items():print(actor,'INTENT',line)

from pathlib import Path
f=sorted(Path("tasks/minecraft/team/mission/iter14/observations").glob("*_status.txt"))[-1]
owner=None; stock=[]
for line in f.read_text().splitlines():
 if re.match(r"p[1-4]:",line):owner=line[:2]
 elif "inventory:" in line:
  vals=re.findall(r"(blaze_rod|ender_pearl|sweet_berries|snowball|arrow) x(\d+)",line.split("inventory:",1)[1])
  if vals:stock.append(owner+":"+",".join(k+"="+v for k,v in vals))
print("CARRIED", "; ".join(stock) if stock else "no rods/pearls/berries/snowballs")
