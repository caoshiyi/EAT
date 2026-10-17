"""Reproduce observed Eye packet coordinates; public vanilla code, no seed/worldfiles."""
from eye_model import *
rnd=lambda x:math.floor(x+.5)
def quant(o,v):return tuple(o[i]+(rnd(v[i]*4096)-rnd(o[i]*4096))/4096 for i in range(3))
def test():
 assert rnd(0.5)==1 and rnd(-.5)==0
 assert quant((.123,.456,.789),(.123,.456,.789))==(.123,.456,.789)
 assert abs(atan(1,0)-math.pi/2)<.001
 # A synthetic flight through encoder must recover its target among distinct nearby hypotheses.
 o=(6.448666502213281,67.89999997615814,81.5125);a=model(o,(144,2208));b=model(o,(176,2704))
 assert any(quant(o,a[n])!=quant(o,b[n]) for n in range(4,77,4))
 print('SMOKE_PASS Java round/codec identity/atan axis/synthetic distinguishability')
def main():
 test();raw=(D.parent.parent/'p1/iter7/eye_first.log').read_text();e=json.loads(re.search(r'ACTUAL_EYE_EVIDENCE (.*)',raw).group(1));ps=e['flights']['11635']['points'];o=tuple(ps[0][k] for k in ['x','y','z']);ray=e['rays'][0];result=[]
 # Timing first15samples pins update cadence t-4; delayed two finalsamples correspond72,76 via y-position.
 ns=list(range(4,65,4))+[72,76]
 assert len(ns)==len(ps)-1
 for z in range(16,26001,16):
  x=round((o[0]+(z-o[2])*ray['dx']/ray['dz'])/16)*16
  err=abs((x-o[0])*ray['dz']-(z-o[2])*ray['dx'])
  # Broad .001rad allowance is >4x actual first-ring endpoint residual.
  if err>.001*math.hypot(x-o[0],z-o[2]):continue
  m=model(o,(x,z));errors=[]
  for p,n in zip(ps[1:],ns):
   encoded=quant(o,m[n]);errors.append([round((p[k]-encoded[i])*4096,6) for i,k in enumerate(['x','y','z'])])
  exact=sum(all(v==0 for v in es) for es in errors);sse=sum(v*v for es in errors for v in es)
  result.append(dict(target=[x,z],exact=exact,total=len(ns),packet_units_sse=sse,errors=errors))
 result.sort(key=lambda r:(r['packet_units_sse'],-r['exact']));out={'search':'chunkcorner16 lattice z16..26000; nearest x each z, .001rad generous observedray envelope','source':'MCFireworkDev/MinecraftDeobfuscated-Mojang branch1.20.4, public code only','observed':'P1 program2800 eye_first.log','tested':len(result),'results':result[:12]};(D/'eye_packet_results.json').write_text(json.dumps(out,indent=2));print('TESTED',len(result));print(json.dumps([{k:v for k,v in r.items() if k!='errors'} for r in result[:6]],indent=2))
if __name__=='__main__':main()
