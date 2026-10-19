"""Summarize retained arena receipts without treating dispatch as success."""
from pathlib import Path
import json,sys
for arg in sys.argv[1:]:
 print('FILE',arg)
 for line in Path(arg).read_text().splitlines():
  tag,_,raw=line.partition(' ')
  if tag not in {'RESULT','SOURCE','END','LOW50','PREPARED52','FIELD','MODEL','ATTACK','OPEN_TRIGGER','OPEN_ACTUAL','FAIL','RETREATFAIL','TOOL_USED'}:continue
  try:d=json.loads(raw)
  except ValueError:
   if tag in {'FAIL','RETREATFAIL','TOOL_USED'}:print(line)
   continue
  if isinstance(d,dict):
   d={k:v for k,v in d.items() if k not in {'rows','trace'}}
   if 'faces' in d:d['faces_full']=sum(bool(v.get('full')) for v in d.pop('faces'))
   if isinstance(d.get('state'),dict):d['state']={k:v for k,v in d['state'].items() if k in {'at','p','hp','food','ground','inv','controls','goal'}}
  print(tag,json.dumps(d,separators=(',',':')))
