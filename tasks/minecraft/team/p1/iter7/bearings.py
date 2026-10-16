"""Pure two-ray intersection; input observation coordinates are never world proof."""
import math,json,sys

def intersect(a,b):
 den=a['dx']*b['dz']-a['dz']*b['dx']
 if abs(den)<1e-5:return {'error':'nearly parallel','denominator':den}
 x,z=b['x']-a['x'],b['z']-a['z'];t=(x*b['dz']-z*b['dx'])/den;s=(x*a['dz']-z*a['dx'])/den
 return {'x':a['x']+t*a['dx'],'z':a['z']+t*a['dz'],'forward_a':t,'forward_b':s,'denominator':den,'physical_stronghold':False}
if __name__=='__main__':
 if len(sys.argv)==1:
  d=intersect(dict(x=0,z=0,dx=1,dz=1),dict(x=10,z=0,dx=-1,dz=1));assert abs(d['x']-5)<1e-9 and abs(d['z']-5)<1e-9;print('bearing math smoke PASS')
 else:print(json.dumps(intersect(json.loads(sys.argv[1]),json.loads(sys.argv[2]))))
