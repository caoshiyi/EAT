from cage_search import *
cage=observed['cages'][0]
params=[(25.5,-25.5,float(a),.5,float(oz)) for a in np.arange(81.5,84.51,.1) for oz in np.arange(-1,1.51,.25)]
good,et,bt=assess(cage,params,jump=False);candidates=[p for p,g in zip(params,good) if g]
counts=np.zeros(len(candidates),dtype=int)
for x in [-.03,-.015,0,.015,.03]:
 for y in [-.015,0,.015]:
  for z in [-.03,-.015,0,.015,.03]:counts+=assess(cage,candidates,np.array([x,y,z]),jump=False)[0]
scored=sorted([{'params':p,'samples_clear':int(n),'total':75} for p,n in zip(candidates,counts)],key=lambda r:-r['samples_clear'])
result={'scope':'Computational screening on observed cage boxes only; widened arbitrary grid, NOT probability/bound; jumpFalse feet55','target':cage['target'],'tested':len(params),'nominal_clear':len(candidates),'top':scored[:25]}
print(json.dumps(result),flush=True);(root/'E2_SHORT_SEARCH.json').write_text(json.dumps(result,indent=2))
