# Small static projection along an East->West segment; no Minecraft world effect.
import json
lo,hi=-131.625,-131.375
out=[]
for center in [-131.93,-132.23,-132.7]:
    physical=center+.3;expanded=center+.6
    row=dict(center=center,physicalEast=physical,expandedEast=expanded,gateEast=hi,gateWest=lo,physicalBehindGate=physical<=lo,expandedAheadOfGate=expanded>hi,expandedFullyBehindGate=expanded<=lo)
    out.append(row)
assert out[0]['physicalBehindGate'] and out[0]['expandedAheadOfGate']
assert all(r['expandedFullyBehindGate'] for r in out[1:])
print(json.dumps(out,indent=2))
