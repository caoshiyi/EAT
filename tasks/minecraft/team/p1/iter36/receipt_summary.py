"""Read owned arena receipts; retain measured ACKs, explicit timeout and actual ending."""
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parent
for name in sys.argv[1:]:
 p=(root/name).resolve()
 assert p.parent==root and p.suffix=='.out'
 lines=p.read_text().splitlines()
 labels={}
 for line in lines:
  label,_,raw=line.partition(' ')
  if label in ['SOURCE','HIT_ACK','BATCH_SUMMARY','RESULT','APERTURE_ACK','REPAIR_PENDING']:
   try: labels.setdefault(label,[]).append(json.loads(raw))
   except json.JSONDecodeError: pass
 hits=labels.get('HIT_ACK',[])
 print(json.dumps({'receipt':p.name,'header':lines[0] if lines else None,
   'ackCount':len(hits),'firstACK':hits[0] if hits else None,'lastACK':hits[-1] if hits else None,
   'summary':labels.get('BATCH_SUMMARY',[]),'repairACK':labels.get('APERTURE_ACK',[]),
   'failures':[x for x in lines if x.startswith(('FAIL ','RETREATFAIL ','NO_EFFECT'))],
   'nativeFinal':[x for x in lines if x.startswith('--- p1 now:')],
   'warning':'ACK count may be truncated. No RESULT after timeout means ending unverified; use native final and current status.'},separators=(',',':')))
