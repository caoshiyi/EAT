#!/usr/bin/env python3
"""Read only this workstream's captured arena outputs into a canonical run index."""
import csv,json,pathlib,re
base=pathlib.Path(__file__).resolve().parent
rows=[]
for p in base.glob('*.out'):
 s=p.read_text();m=re.search(r'^(\[sandbox\] )?program #(\d+) on p2: ([\d.]+) s',s,re.M)
 if not m:continue
 own=s.split('--- chat since',1)[0];state=None
 try:state=json.loads(s.split('--- returned ---\n',1)[1].split('\n--- ',1)[0])
 except (ValueError,IndexError):pass
 endings=[]
 for line in own.splitlines():
  if line.startswith('ENDING '):
   try:endings.append(json.loads(line.split(' ',1)[1]))
   except ValueError:pass
 failures=[line.split(' ',1)[0] for line in own.splitlines() if re.match(r'^[A-Z_]*(?:FAILURE|FAILED)\b',line)]
 last=endings[-1] if endings else {};faces=last.get('faces',[])
 rows.append([('SB' if m[1] else 'LIVE'),int(m[2]),m[3],p.name,','.join(failures),len(endings),sum(x.get('full') is True for x in faces),json.dumps(state,separators=(',',':')) if state else ''])
with (base/'RUN_RECEIPTS.tsv').open('w') as f:
 w=csv.writer(f,delimiter='\t');w.writerow(['environment','program_id','duration_s','raw_file','caller_failures','ending_samples','last_full_faces','returned_state']);w.writerows(sorted(rows,key=lambda r:(r[0],r[1])))
print('INDEXED',len(rows),'exact headers; failed forward callers retained separately from successful recoveries')
