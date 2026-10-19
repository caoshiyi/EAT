"""Summarize actual arena RESULT records without crediting requested actions."""
import json,sys
from pathlib import Path
for name in sys.argv[1:]:
 for line in Path(name).read_text().splitlines():
  if line.startswith(('RESULT ','SB_RESULT ')):
   r=json.loads(line.split(' ',1)[1]);hits=r.get('hits',[])
   print(json.dumps({'file':name,'scope':r.get('scope',r.get('environment')),'attacks':r.get('attacks'),'acknowledgments':len(hits),'immediateAckHPdrops':[[h.get('beforeHP'),h.get('afterHP')] for h in hits if isinstance(h.get('afterHP'),(int,float)) and h.get('beforeHP',0)>h['afterHP']],'initialBossHP':(r.get('dragonBefore') or {}).get('hp'),'finalBossHP':(r.get('dragonAfter') or {}).get('hp'),'endpointBossHPdrop':((r.get('dragonBefore') or {}).get('hp',0)-(r.get('dragonAfter') or {}).get('hp',0)) if r.get('dragonBefore') and r.get('dragonAfter') else None,'issue':r.get('issue'),'min':r.get('min'),'rootMin':r.get('minRoot',r.get('rootMin')),'injured':r.get('injured'),'state':r.get('state'),'full':all(x.get('full') for x in r.get('faces',[])) if r.get('faces') else None}, separators=(',',':')))
