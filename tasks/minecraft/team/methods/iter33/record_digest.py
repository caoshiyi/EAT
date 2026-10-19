#!/usr/bin/env python3
"""Offline digest of arena programs plain text; source+output stay in input."""
import json,re,sys,hashlib
from pathlib import Path
raw=Path(sys.argv[1]).read_text()
for record in re.split(r"(?m)^== #",raw):
 if not record.strip(): continue
 lines=record.splitlines(); header=lines[0]
 source,sep,output=record.partition("-- output --")
 if not sep: print(json.dumps({"header":header,"output_available":False}));continue
 source=source.partition("\n")[2]
 observations=[]
 for line in output.splitlines():
  if line.startswith(("--","{")):continue
  tag,_,payload=line.partition(" ")
  try: value=json.loads(payload)
  except (ValueError,TypeError):
   if any(w in line.lower() for w in ["fail","error","timeout"]):observations.append({"text":line})
   continue
  if tag in ["CUT","WALK","UP","DIG_POST"]:continue
  if isinstance(value,dict):
   state=value.get("state",value);row={"tag":tag}
   for key in ["at","p","hp","food","inv","dead","reason","post","original","target","previous","current","oxygen"]:
    if key in value:row[key]=value[key]
    elif key in state:row[key]=state[key]
   if "faces" in value:row["full_faces"]=sum(bool(x.get("full")) for x in value["faces"]);row["faces_total"]=len(value["faces"])
   observations.append(row)
 print(json.dumps({"header":header,"source_sha256":hashlib.sha256(source.encode()).hexdigest(),"observations":observations}))
