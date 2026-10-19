"""Summarize completed owned arena text; no world state claims from old files."""
import json,pathlib,sys
root=pathlib.Path('tasks/minecraft/team/p4/iter31').resolve()
for arg in sys.argv[1:]:
 p=pathlib.Path(arg).resolve()
 if not p.is_relative_to(root):raise SystemExit('owned records only')
 print(p.name)
 for line in p.read_text().splitlines():
  if line.startswith(('SOURCE ','UP ','ARRIVAL ','END ')):
   tag,raw=line.split(' ',1)
   try:d=json.loads(raw)
   except json.JSONDecodeError:continue
   print(tag,json.dumps({k:d[k] for k in ['at','p','hp','food','dim','ground','moved','elapsed','floor','dead','inv','hazards'] if k in d},separators=(',',':')))
  elif line.startswith(('FAIL ','--- error ---')):print(line)
