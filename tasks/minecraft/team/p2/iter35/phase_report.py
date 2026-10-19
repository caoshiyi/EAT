import json,sys,collections,pathlib
f=pathlib.Path(sys.argv[1]); rows=[]; flags=[]
for s in f.read_text().splitlines():
 if s.startswith('SAMPLE '):rows.append(json.loads(s.split(' ',1)[1]))
 if s.startswith(('FAIL','RETURN55','RETREAT_FAIL','RETREAT_START','--- p2 now')):flags.append(s)
out={'record':str(f),'samples':len(rows),'groups':{},'flags':flags}
for tag in dict.fromkeys(x['tag'] for x in rows):
 a=[x for x in rows if x['tag']==tag];out['groups'][tag]={'n':len(a),'visible':sum(x['visible'] for x in a),'phases':dict(collections.Counter(str(x['dragon']['phase']) if x['dragon'] else 'absent' for x in a)),'HP':[min(x['hp'] for x in a),max(x['hp'] for x in a)],'closest':min((x['dragon']['distance'] for x in a if x['dragon']),default=None),'hazards':sorted({(y['id'],y['n']) for x in a for y in x['hazards']})}
print(json.dumps(out,indent=2))
