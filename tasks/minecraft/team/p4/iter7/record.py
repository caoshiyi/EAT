"""Read only arena log text, retain observed endings; never infer gameplay success."""
import json,re,sys,pathlib,datetime
ROOT=pathlib.Path(__file__).resolve().parent

def parse(path):
 text=path.read_text();m=re.search(r'^program #(\d+) on p4:',text,re.M)
 if not m:raise ValueError('No completed p4 program header')
 records={}
 for line in text.splitlines():
  label,_,body=line.partition(' ')
  if body.startswith('{'):
   try:records[label]=json.loads(body)
   except json.JSONDecodeError:pass
 end=records.get('END',records.get('FINAL',{}))
 result=records.get('FARM_RESULT',records.get('HUNT_RESULT',{}))
 protected=end.get('full',end.get('cube')) is True
 continuous=end.get('lost') is False
 # FINAL small roof programs omit life guard; keep unknown instead of inferring it.
 r=result.get('rod');delta=r[1]-r[0] if isinstance(r,list) and len(r)==2 else r-result['initialRod'] if isinstance(r,int) and 'initialRod' in result else None
 return dict(program=int(m[1]),source=str(path.relative_to(ROOT)),recorded=datetime.datetime.now(datetime.timezone.utc).isoformat(),observed_end=end,operation=result,protected_observed=protected,life_continuous_observed=continuous,rod_delta_observed=delta,retained_rod_success=bool(delta is not None and delta>0 and protected and continuous),records=records)

def main():
 history=ROOT/'RESULTS.jsonl';seen={json.loads(s)['program'] for s in history.read_text().splitlines()} if history.exists() else set()
 for raw in sys.argv[1:]:
  p=pathlib.Path(raw).resolve();row=parse(p)
  if row['program'] not in seen:
   with history.open('a') as f:f.write(json.dumps(row)+'\n')
   seen.add(row['program'])
  (ROOT/'LATEST_RESULT.json').write_text(json.dumps(row,indent=2)+'\n')
  print(json.dumps({k:row[k] for k in ['program','protected_observed','life_continuous_observed','rod_delta_observed','retained_rod_success']}))
if __name__=='__main__':main()
