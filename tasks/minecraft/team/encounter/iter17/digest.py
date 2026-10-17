"""Read-only parser of saved mc_arena programs --full output; never invokes arena."""
import json,re,sys
from pathlib import Path

def records(text):
    for chunk in re.split(r'(?=^== #)',text,flags=re.M):
        if not chunk.startswith('== #'): continue
        head=chunk.splitlines()[0]
        out={'header':head,'returned':False}
        marker='-- returned --\n'
        if marker in chunk:
            raw=chunk.split(marker,1)[1]
            try:
                data,_=json.JSONDecoder().raw_decode(raw.lstrip())
                out['returned']=True
                if isinstance(data,dict):
                    keys=['at','now','issue','endingIssue','lost','world','p','hp','health','food','closed','attacks','recoveryIssue','cuts','receipt','recovered','attempted','clouds','dragon']
                    out.update({k:data[k] for k in keys if k in data})
                    samples=data.get('samples',[])
                    if samples:
                        out['sample_count']=len(samples)
                        if all(isinstance(a,list) and len(a)==7 and isinstance(a[1],int) and isinstance(a[2],dict) and isinstance(a[5],(int,float)) for a in samples):
                            out['sample_schema']='time,id,position,hp,phase,distance,self_hp';out['minimum_sample']=min(samples,key=lambda a:a[5]);out['sampled_ids']=sorted(set(a[1] for a in samples));out['sampled_hp']=sorted(set(a[3] for a in samples));out['sampled_phases']=sorted(set(a[4] for a in samples))
                        elif all(isinstance(a,list) and len(a)==6 and isinstance(a[1],dict) and isinstance(a[4],(int,float)) for a in samples):
                            out['sample_schema']='time,position,hp,phase,distance,self_hp';out['minimum_sample']=min(samples,key=lambda a:a[4]);out['sampled_hp']=sorted(set(a[2] for a in samples));out['sampled_phases']=sorted(set(a[3] for a in samples))
                        else: out['sample_schema']='UNKNOWN; no inferred minimum'
                    out['trace_events']=len(data.get('trace',[]))
                else: out['value']=data
            except (ValueError,TypeError) as e: out['parse_error']=str(e)
        yield out

if __name__=='__main__':
    for filename in sys.argv[1:]:
        for record in records(Path(filename).read_text()): print(json.dumps(record))
