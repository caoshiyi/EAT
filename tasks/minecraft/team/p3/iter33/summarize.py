"""Summarize owned arena receipts; never interprets CLI success as world success."""
import json,re,sys
from pathlib import Path
for name in sys.argv[1:]:
    p=Path(name); raw=p.read_text(); m=re.search(r'program #(\d+) on (p\d)',raw)
    result={'file':str(p),'id':int(m[1]) if m else None,'player':m[2] if m else None,'source':None,'last_ending':None,'effects':[],'failures':[]}
    for line in raw.splitlines():
        if line.startswith(('FAIL','--- error','Error:','REFUSAL','RECOVERY_FAILURE')):result['failures'].append(line[:400])
        tag,_,val=line.partition(' ')
        if tag in ('SOURCE','ENDING','RECEIPT','RECOVERY_RECEIPT','HARVEST_EFFECT','RESULT') and val.startswith('{'):
            try:s=json.JSONDecoder().raw_decode(val)[0]
            except json.JSONDecodeError:continue
            if tag=='SOURCE':result['source']=s
            elif tag=='ENDING':
                result['last_ending']={k:s.get(k) for k in ('at','p','hp','food','ground','inv')}
                result['last_ending']['full_faces']=sum(x.get('full',False) for x in s.get('faces',[]))
            else:result['effects'].append({'tag':tag,'data':s})
    print(json.dumps(result,separators=(',',':')))
