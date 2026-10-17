import json,pathlib,re
base=pathlib.Path('tasks/minecraft/team/p1/iter12');groups={}
for f in sorted(base.glob('*.out')):
 if not (f.name.startswith('detour_') or f.name.startswith('follow_detour')):continue
 m=re.search(r'--- returned ---\s*\n([\s\S]*?)\n--- chat',f.read_text())
 try:s=json.loads(m[1])
 except (ValueError,TypeError):continue
 if 'index' not in s or not s.get('full') or s.get('lost') or not s.get('moved'):continue
 origin=tuple(s.get('planOrigin',[18,8,86]));g=groups.setdefault(origin,dict(nodes={},conflicts=[],sources=[]));begin=s['index']-len(s['moved']);g['sources'].append(str(f))
 for k,q in enumerate(s['moved'],begin):
  if k in g['nodes'] and g['nodes'][k]!=q:g['conflicts'].append([k,g['nodes'][k],q])
  g['nodes'][k]=q
plans=[]
for origin,g in sorted(groups.items()):
 path=[]
 while len(path) in g['nodes']:path.append(g['nodes'][len(path)])
 plans.append(dict(origin=list(origin),path=path,actual_contiguous_cells=len(path),endpoint=path[-1] if path else None,conflicts=g['conflicts'],sources=g['sources']))
state=dict(plans=plans,note='Only recorded physical moved cells. Closing caps exist at batch boundaries; use fresh block/life/mob checks. No future geometry/safety guarantee.')
(base/'DETOUR_ACTUAL.json').write_text(json.dumps(state,indent=2)+'\n');print(json.dumps(dict(plans=[{k:v for k,v in p.items() if k not in ['path','sources']} for p in plans],note=state['note'])))
