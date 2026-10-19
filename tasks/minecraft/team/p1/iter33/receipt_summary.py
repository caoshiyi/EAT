"""Summarize observed capsule samples; never convert CLI success into world success."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('file');p.add_argument('--require-capsule',action='store_true');a=p.parse_args();raw=pathlib.Path(a.file).read_text()
def samples(tag):
 out=[]
 for line in raw.splitlines():
  if line.startswith(tag+' '):
   try: out.append(json.loads(line[len(tag)+1:]))
   except json.JSONDecodeError: pass
 return out
sources=samples('SOURCE');ends=samples('ENDING');last=ends[-1] if ends else None
m=re.search(r'program #(\d+) on p1:',raw)
r={'program':int(m.group(1)) if m else None,'end_samples':len(ends),'final':None,'world_success':'NOT_INFERRED'}
if last:
 faces=last.get('faces',[]);r['final']={k:last.get(k) for k in ['at','p','hp','food','ground','inv']};r['final']['full_faces']=sum(bool(x.get('full')) for x in faces);r['final']['face_count']=len(faces);r['final']['all_recorded_endings_full']=all(len(e.get('faces',[]))==10 and all(f.get('full') for f in e['faces']) for e in ends)
 if sources:r['hp_delta']=last.get('hp',0)-sources[0].get('hp',0)
print(json.dumps(r,indent=2))
if a.require_capsule and (not last or len(last.get('faces',[]))!=10 or not all(f.get('full') for f in last['faces'])):raise SystemExit(1)
