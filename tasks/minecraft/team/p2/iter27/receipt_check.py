"""Read ordinary arena stdout; never infer omitted logs or objective success."""
import json,sys
from pathlib import Path
for name in sys.argv[1:]:
 text=Path(name).read_text();part=text.split('--- chat since',1)[0]
 rows={'file':name,'truncated':'[output truncated]' in part,'failures':[x for x in part.splitlines() if 'FAILURE' in x or 'FAILED' in x]}
 for prefix in ['RAPID_POST','OPERATION_GUARD','HAZARD_TRACE']:
  values=[]
  for line in part.splitlines():
   if line.startswith(prefix+' '):
    try:values.append(json.loads(line.split(' ',1)[1]))
    except ValueError:values.append({'parse_error':True})
  if values: rows[prefix]=values[-1]
 if '--- returned ---\n' in part:
  try:rows['returned']=json.loads(part.split('--- returned ---\n',1)[1].split('\n--- ',1)[0])
  except ValueError:rows['returned']='not JSON'
 print(json.dumps(rows,indent=2))
