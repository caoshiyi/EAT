"""Narrow caged-crystal path search using public client-observed boxes, no world actions."""
import json,numpy as np
from pathlib import Path
root=Path(__file__).resolve().parent
observed=json.loads((root/'cages.json').read_text())

def hit(a,b,lo,hi):
 d=b-a
 with np.errstate(divide='ignore',invalid='ignore'):
  u=(np.array(lo)-a)/d;v=(np.array(hi)-a)/d
  near=np.minimum(u,v);far=np.maximum(u,v)
  parallel=np.abs(d)<1e-12
  outside=parallel&((a<lo)|(a>hi))
  near=np.where(parallel,-np.inf,near);far=np.where(parallel,np.inf,far)
  t0=np.maximum(0,near.max(axis=-1));t1=np.minimum(1,far.min(axis=-1))
  return np.where((t0<=t1)&~outside.any(axis=-1),t0,np.inf)

def assess(cage,params,noise=None,base=55,jump=True):
 target=cage['target']['p'];T=np.array(list(target.values()))
 origins=np.array([[x,base+(1.94 if jump else 1.52),z] for x,z,deg,ox,oz in params]);dest=np.array([[T[0]+ox,T[1],T[2]+oz] for x,z,deg,ox,oz in params])
 delta=dest-origins;delta[:,1]=0;delta/=np.linalg.norm(delta,axis=-1)[:,None]
 theta=np.deg2rad([p[2] for p in params]);vel=delta*(1.5*np.cos(theta))[:,None];vel[:,1]=1.5*np.sin(theta)+(.42 if jump else 0)
 if noise is not None:vel+=noise
 a=np.empty((len(params),100,3));b=a.copy();p=origins.copy()
 for t in range(100):a[:,t]=p;p=p+vel;b[:,t]=p;vel*=.99;vel[:,1]-=.03
 ent=hit(a,b,T+[-1,0,-1],T+[1,2,1])+np.arange(100);et=ent.min(axis=-1)
 bt=np.full(len(params),np.inf)
 for block in cage['blocks']:
  q=np.array(list(block['p'].values()))
  for shape in block['shapes']:
   lo=q+shape[:3];hi=q+shape[3:]
   if block['n']=='obsidian':lo[1]=0 # extend sampled bottom columns conservatively
   blocktick=(hit(a,b,lo,hi)+np.arange(100)).min(axis=-1)
   bt=np.minimum(bt,blocktick)
 return np.isfinite(et)&(et<bt),et,bt
