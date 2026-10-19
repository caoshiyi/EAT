"""Summarize saved public arena records; never runs player programs or reads server data."""
import json, pathlib, re, sys
program=None
for path in sys.argv[1:]:
    program=None
    for line in pathlib.Path(path).read_text().splitlines():
        if m:=re.match(r'(?:== #|program #)(\d+)',line): program=int(m.group(1))
        if line.startswith(('FAIL ','RETREATFAIL')):
            print(json.dumps({'source':path,'program':program,'failure':line[:900]}))
        if not line.startswith('RESULT '): continue
        try: r=json.loads(line[7:])
        except ValueError: continue
        if 'attacks' not in r: continue
        before=(r.get('dragonBefore') or {}).get('hp')
        after=(r.get('dragonAfter') or {}).get('hp')
        state=r.get('state') or {}
        inv=state.get('inv') or []
        tools=[item for item in inv if any(kind in item[0] for kind in ('pickaxe','sword'))]
        summary={'source':path,'program':program,'environment':r.get('environment','not reported'),
                 'player':r.get('player','not reported'),'attacks':r['attacks'],
                 'recorded_hits':len(r['hits']) if isinstance(r.get('hits'),list) else None,
                 'before_hp':before,'after_hp':after,'damage':before-after if before is not None and after is not None else None,
                 'ending':{'at':state.get('at'),'position':state.get('p'),'hp':state.get('hp'),'food':state.get('food'),
                           'full_faces':sum(bool(x.get('full')) for x in r.get('faces',[])),
                           'face_count':len(r.get('faces',[])),'tools':tools}}
        print(json.dumps(summary))
