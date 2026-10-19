"""Index own arena receipts, never infer an objective effect from CLI return."""
import csv,json,pathlib
root=pathlib.Path(__file__).parent
def parse(p):
 r=json.loads(p.read_text()); s=r.get('returned'); s=s if isinstance(s,dict) else {}
 status=f"cli={r.get('cli_exit')};failure_marker={r.get('caller_failure_marker')};truncated={r.get('output_truncated')}"
 return [str(r.get('program_id')),r.get('environment','?'),str(r.get('source_file') or 'chat'),"NOT_ASSESSED_AUTOMATICALLY",json.dumps({k:s.get(k) for k in ('at','p','hp','food','dim')},separators=(',',':')),status,pathlib.Path(r['raw_output']).name]
# Small trust checks on an actual retained case and an actual live failure.
a=parse(root/'G8_crystal_slab.out.receipt.json')
b=parse(root/'LIVE_crystal_slab.out.receipt.json')
assert a[0]=='286' and '"hp":9' in a[4] and 'failure_marker=False' in a[5]
assert b[0]=='11803' and 'failure_marker=True' in b[5]
assert a[3]==b[3]=='NOT_ASSESSED_AUTOMATICALLY'
rows=[parse(p) for p in root.glob('*.out.receipt.json')]
rows.sort(key=lambda r:(r[1],int(r[0]) if r[0].isdigit() else -1))
with (root/'run_index.tsv').open('w') as f:
 w=csv.writer(f,delimiter='\t');w.writerow(['program','env','source','objective_effect','returned_snapshot','receipt_metadata','raw']);w.writerows(rows)
existing=list(csv.reader((root/'results.tsv').open(),delimiter='\t'))
seen={(r[0],r[6]) for r in existing[1:] if len(r)==7}
with (root/'results.tsv').open('a') as f:
 w=csv.writer(f,delimiter='\t')
 for row in rows:
  if (row[0],row[6]) not in seen:w.writerow(row)
print(f'Indexed {len(rows)} own receipts; manual effect claims retained; no world-success inference.')
