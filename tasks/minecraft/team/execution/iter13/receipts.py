"""Summarize archived public receipts; never invokes the arena or player code."""
import argparse,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'records'
def inspect(raw):
    header=raw.splitlines()[0]
    sections=re.split(r'^-- (output|returned|error) --\s*$',raw,flags=re.M)
    values=[]
    for i in range(1,len(sections),2):
        kind,body=sections[i],sections[i+1].strip()
        if kind=='returned':
            try: value=json.loads(body)
            except ValueError: values.append({'kind':'unparsed_return','raw':body[:300]});continue
            if not isinstance(value,dict):values.append({'kind':'non_object_return','value':value});continue
            keys=('at','entity','entityId','world','dim','dimension','issue','error','endIssue','recoveryIssue','start','target','current','index','closed','protectedEnd','full','hp','health','food','p','elapsed','controls','received','pearlDelta','rod','hurts','lost','dead')
            brief={k:value[k] for k in keys if k in value}
            for k in ('inv','inventory','items','own'):
                if k in value:
                    # Preserve stack boundaries and wear: same type need not be same tool.
                    brief[k]=value[k]
            for k in ('hits','combatTrace','walked','placements'):
                if isinstance(value.get(k),list):brief[k+'_count']=len(value[k]);brief[k+'_last']=value[k][-2:]
            values.append({'kind':'returned','data':brief,'other_keys':[k for k in value if k not in brief]})
        elif kind=='output':
            for line in body.splitlines():
                if line.startswith('ALL_FRAME_ACCESS_ACTUAL '):
                    try: frames=json.loads(line.split(' ',1)[1])
                    except ValueError:continue
                    needed=[f for f in frames if f.get('eye') is False]
                    values.append({'kind':'frame_probe','needed':len(needed),'reachable_visible':sum(f.get('visible') is True and f.get('d',999)<=4.5 for f in needed),'needed_details':needed,'units':'distance meters; observation during caller, possibly subsequently recapped'})
                elif re.search(r'ISSUE|FAIL|THREAT|RECEIPT',line): values.append({'kind':'output','line':line[:600]})
        elif kind=='error': values.append({'kind':'error','raw':body[:500]})
    return {'header':header,'observations':values,'limits':'Archived past receipt, not current world; source labels are not independent certification.'}
if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('ids',nargs='+',type=int);v=a.parse_args()
    for number in v.ids:
        p=ROOT/f'{number}.txt'
        print(json.dumps({'source':str(p),'receipt':inspect(p.read_text())},separators=(',',':')))
