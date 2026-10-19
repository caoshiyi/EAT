"""Index retained p2 arena receipts; no success inference from process exit."""
import csv,json,pathlib
base=pathlib.Path(__file__).resolve().parent
rows=[]
for p in base.glob('*.receipt.json'):
 r=json.loads(p.read_text());s=r.get('returned') or {};s=s if isinstance(s,dict) else {}
 rows.append([r.get('program_id',''),r.get('environment',''),p.name.removesuffix('.receipt.json'),r.get('cli_exit'),r.get('caller_failure_marker'),r.get('output_truncated'),s.get('at',''),s.get('hp',''),json.dumps(s.get('p')),json.dumps(s.get('inv',s.get('inventory'))),'terminal observation only; inspect events for later deaths'])
rows.sort(key=lambda r:(str(r[1]),int(r[0] or 0)))
with (base/'results.tsv').open('w') as f:
 w=csv.writer(f,delimiter='\t');w.writerow(['program','environment','raw','cli_exit','failure_marker','truncated','terminal_utc','terminal_hp','terminal_position','terminal_inventory','limit']);w.writerows(rows)
print(len(rows),'receipts indexed')
