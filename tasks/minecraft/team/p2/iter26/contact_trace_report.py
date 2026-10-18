"""Summarize public contact records without equating a box model to legal reach."""
import argparse,json,pathlib
p=argparse.ArgumentParser();p.add_argument('record');a=p.parse_args()
lines=pathlib.Path(a.record).read_text().splitlines();closest=[];samples=[];admissions=[];attacks=[]
for line in lines:
 for prefix,dest in [('PUBLIC_CLOSEST_MODEL ',closest),('PUBLIC_DRAGON_WAIT ',samples),('CONTACT_LEGAL_ADMISSION ',admissions)]:
  if line.startswith(prefix):dest.append(json.loads(line[len(prefix):]))
 if line.startswith('ORDINARY_REAL_DRAGON_ATTACK_RETURNED '):attacks.append(line)
report={'record':a.record,'sample_batches':len(samples),'empty_batches':sum(not x for x in samples),'continuous_closest_records':len(closest),'closest_model':min(closest,key=lambda r:r['modelDistance']) if closest else None,'actual_admissions':admissions,'returned_attacks':len(attacks),'failure_markers':[l for l in lines if l.startswith(('CONTACT_CAPSULE_FAILURE','CONTACT_CAPSULE_ENDING_FAILURE'))],'limits':'A public box model is only a trigger. No legal hit, damage or immunity follows without current cursor, physical rays and actual consequence.'}
print(json.dumps(report,indent=2))
