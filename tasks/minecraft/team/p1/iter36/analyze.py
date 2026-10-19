import json,sys,math
from pathlib import Path
p=Path(sys.argv[1]);s=p.read_text();d=json.loads(next(x[4:] for x in s.splitlines() if x.startswith('OBS ')));r=[x for x in d['rows'] if x.get('p')]
print('rows',len(r),'phases',sorted(set(x['phase'] for x in r)),'rootY',min(x['p']['y'] for x in r),max(x['p']['y'] for x in r),'hp',d['hp'],'faces',all(x['full'] for x in d['faces']))
def dist(p,e):return math.sqrt(sum(max(lo-a,0,a-hi)**2 for a,lo,hi in [(p[0],e['x']-1.95,e['x']+1.95),(p[1]+1.62,e['y']+.05,e['y']+2.95),(p[2],e['z']-1.95,e['z']+1.95)]))
out=[]
for y in range(51,59):
 for x in range(-20,21,2):
  for z in range(-20,31,2):
   ds=[dist((x+.5,y,z+.5),a['p']) for a in r];n=sum(t<=3 for t in ds)
   if n:out.append({'feet':[x+.5,y,z+.5],'n':n,'min':min(ds),'root':r[ds.index(min(ds))]})
print('current_source_min',min(dist((10.5,51,25.5),a['p']) for a in r))
for y in range(51,59):
 a=sorted([x for x in out if x['feet'][1]==y],key=lambda a:(-a['n'],a['min']));print('best',y,json.dumps(a[:3]))
Path(str(p)+'.analysis.json').write_text(json.dumps(out,indent=2))
