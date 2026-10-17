import json,pathlib,sys
for name in sys.argv[1:]:
 s=pathlib.Path(name).read_text()
 try:
  d=json.loads(s.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0])
 except (ValueError,IndexError) as e:
  print(name,'NO_COMPLETE_RESULT',str(e));continue
 out={k:d.get(k) for k in ['issue','endingIssue','lost','lifeId','p','hp','food','closed','currentCloud','controls','dry','issued','released','destroyed','beforeCrystals','afterCrystals','beforeArrow','afterArrow','dragon'] if k in d}
 rows=d.get('samples',[])
 if isinstance(rows,list) and rows:
  out['sampleCount']=len(rows);out['phases']=sorted(set(r[4] for r in rows if len(r)>4 and r[4] is not None))
  out['hpRange']=[min(r[3] for r in rows if isinstance(r[3],(int,float))),max(r[3] for r in rows if isinstance(r[3],(int,float)))]
  out['nearest']=min(rows,key=lambda r:r[5]);out['first']=rows[0];out['last']=rows[-1]
 print(s.splitlines()[0]);print(json.dumps(out,indent=1))
