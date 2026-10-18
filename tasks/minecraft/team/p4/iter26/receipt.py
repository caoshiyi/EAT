"""Extract exact arena IDs/returns from saved allowed records; never infer missing outcomes."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('record');p.add_argument('--env',choices=['live','sandbox'],required=True);p.add_argument('--generation',required=True);p.add_argument('--player',choices=['p1','p2','p3','p4'],required=True);a=p.parse_args()
f=pathlib.Path(a.record);root=pathlib.Path('tasks/minecraft/team').resolve()
if not f.resolve().is_relative_to(root):raise SystemExit('Use an allowed team record.')
s=f.read_text();chunks=re.split(r'(?m)^== #',s)
if len(chunks)>1:chunks=['== #'+x for x in chunks[1:]]
else:chunks=[s]
def slim(x):
 if not isinstance(x,dict):return None
 for k in ['state','s','after']:
  if isinstance(x.get(k),dict):x=x[k];break
 keys=['at','p','hp','health','food','dim','dimension','ground','grounded','controls','flags','goal','window','cursor','inv','inventory','fullCount']
 return{k:x[k] for k in keys if k in x}
for chunk in chunks:
 h=re.search(r'(?m)^(?:== #|(?:\[sandbox\] )?program #)(\d+)([^\n]*)',chunk)
 if not h:continue
 ret=re.search(r'\n-{2,3} returned -{2,3}\n',chunk);parsed=None;returnError=None
 if ret:
  t=chunk[ret.end():].lstrip()
  if t.startswith(('{','[')):
   try:parsed=json.JSONDecoder().raw_decode(t)[0]
   except json.JSONDecodeError as e:returnError=str(e)
 last=None;lastName=None
 for line in chunk.splitlines():
  m=re.match(r'^([A-Z][A-Z0-9_]*) (\{.*\})$',line)
  if not m:continue
  try:v=json.loads(m[2])
  except json.JSONDecodeError:continue
  z=slim(v)
  if z and ('hp'in z or 'health'in z or 'p'in z):last=v;lastName=m[1]
 result={'input':str(f),'env':a.env,'generation':a.generation,'player':a.player,'recordId':int(h[1]),'exactHeader':h[0],'returnSectionPresent':bool(ret),'parsedReturnState':slim(parsed),'returnParseError':returnError,'lastStructuredLogMarker':lastName,'lastStructuredLogState':slim(last)}
 if isinstance(last,dict):
  faces=last.get('faces',last.get('cells',last.get('shell')))
  if isinstance(faces,list):result['lastLoggedBoundaries']={'count':len(faces),'trueFull':sum(v.get('full',v.get('unitFull')) is True for v in faces if isinstance(v,dict))}
 print(json.dumps(result,indent=2))
