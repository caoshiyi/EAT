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
 last=None;lastName=None;signals=[];boundaryLogs=[]
 for lineNumber,line in enumerate(chunk.splitlines(),1):
  token=line.split(" ",1)[0]
  if re.fullmatch(r"[A-Z][A-Z0-9_]*",token) and re.search(r"FAIL|ERROR|REFUS|PAUSED",token):
   signals.append({"marker":token,"lineNumber":lineNumber,"line":line[:600],"lineTruncated":len(line)>600})
  m=re.match(r'^([A-Z][A-Z0-9_]*) (\{.*\})$',line)
  if not m:continue
  try:v=json.loads(m[2])
  except json.JSONDecodeError:continue
  faces=v.get("faces",v.get("cells",v.get("shell"))) if isinstance(v,dict) else None
  if isinstance(faces,list) and faces and all(isinstance(w,dict) and ("full" in w or "unitFull" in w) for w in faces):
   boundaryLogs.append({"marker":m[1],"lineNumber":lineNumber,"at":(slim(v) or {}).get("at"),"p":(slim(v) or {}).get("p"),"hp":(slim(v) or {}).get("hp"),"count":len(faces),"trueFull":sum(w.get("full",w.get("unitFull")) is True for w in faces)})
  z=slim(v)
  if z and ('hp'in z or 'health'in z or 'p'in z):last=v;lastName=m[1]
 result={'input':str(f),'env':a.env,'generation':a.generation,'player':a.player,'recordId':int(h[1]),'exactHeader':h[0],'returnSectionPresent':bool(ret),'parsedReturnState':slim(parsed),'returnParseError':returnError,'lastStructuredLogMarker':lastName,'lastStructuredLogState':slim(last)}
 if isinstance(last,dict):
  faces=last.get('faces',last.get('cells',last.get('shell')))
  if isinstance(faces,list):result['lastLoggedBoundaries']={'count':len(faces),'trueFull':sum(v.get('full',v.get('unitFull')) is True for v in faces if isinstance(v,dict))}
 result["explicitOperationSignals"]=signals[:20]
 result["explicitOperationSignalCount"]=len(signals)
 result["boundaryLogRows"]=boundaryLogs[-10:]
 result["boundaryLogCount"]=len(boundaryLogs)
 if boundaryLogs:
  result["explicitSignalsAfterLastBoundary"]=[v["marker"] for v in signals if v["lineNumber"]>boundaryLogs[-1]["lineNumber"]]
  rp=(slim(parsed) or {}).get("p");bp=boundaryLogs[-1].get("p")
  if isinstance(rp,dict) and isinstance(bp,dict):
   result["lastBoundaryPositionMatchesReturn"]=all(isinstance(rp.get(k),(int,float)) and isinstance(bp.get(k),(int,float)) and abs(rp[k]-bp[k])<.001 for k in ["x","y","z"])

 result["interpretation"]="Exact printed signals and boundary logs only; a retained ending does not erase an earlier failed operation. No inferred gameplay ending."
 print(json.dumps(result,indent=2))
