from cage_search import *
results=[]
for cage in observed['cages']:
 T=cage['target']['p'];candidates=[]
 # Stationary source avoids inherited jump variability and spends fewer ticks aloft.
 for distance in [8,10,12,14,16,18,20]:
  params=[(T['x']-distance,T['z']+dz,float(deg),ox,oz) for dz in [-1,-.5,0,.5,1] for deg in np.arange(55,85,.5) for ox,oz in [(-.5,-.5),(-.5,.5),(.5,-.5),(.5,.5)]]
  good,et,bt=assess(cage,params,jump=False)
  candidates += [p for p,g in zip(params,good) if g]
 scored=[]
 for start in range(0,len(candidates),100):
  pp=candidates[start:start+100];counts=np.zeros(len(pp),dtype=int)
  for dx in [-.011,0,.011]:
   for dy in [-.011,0,.011]:
    for dz in [-.011,0,.011]:counts+=assess(cage,pp,np.array([dx,dy,dz]),jump=False)[0]
  scored.extend({'params':p,'noise_hits':int(n),'samples':27} for p,n in zip(pp,counts))
 scored.sort(key=lambda r:-r['noise_hits']);row={'target':cage['target'],'jump':False,'nominal_hits':len(candidates),'top':scored[:30]}
 print(json.dumps(row),flush=True);results.append(row)
(root/'E2_STATIONARY.json').write_text(json.dumps(results,indent=2))
