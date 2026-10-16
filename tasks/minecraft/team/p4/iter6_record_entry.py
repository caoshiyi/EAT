import datetime,json,pathlib,re,sys
b=pathlib.Path('tasks/minecraft/team/p4');s=pathlib.Path(sys.argv[1]).read_text();ls=[l for l in s.splitlines()if l.startswith('ENTRY_END ')];assert ls,'ENTRY_END absent: inspect actualstate'
d=json.loads(ls[-1][10:]);m=re.search(r'program #(\d+)',s);d['program']=int(m[1])if m else None;d['at']=datetime.datetime.now(datetime.timezone.utc).isoformat();(b/'LATEST_CORRIDOR.json').write_text(json.dumps(d,indent=2))
with(b/'ITER6_LOG.md').open('a')as f:f.write(f'\n{d["at"]} ENTRY#{d["program"]} issue={d["issue"]}, entry={d["entryAccepted"]}, cap356restore={d["gateRestored"]}, actual={d["p"]} grounded={d["onGround"]} HP{d["hp"]}/{d["food"]}, corridorfull={d["protectedCorridor"]}, cells={d.get("cells")}. Source {sys.argv[1]}.\n')
pathlib.Path('tasks/minecraft/team/P4.md').write_text(f'''# P4 — iteration6 — {d['at']}
- Deadline current CR_DEADLINE1792183777=20:49:37UTC. Currentrun active.
- ACTUAL #{d['program']} Nether {d['p']}, onGround{d['onGround']} HP{d['hp']}/food{d['food']}, protectedCorridor={d['protectedCorridor']}, fullcomponentcells{d.get('cells')}, dead={d['dead']}/lost={d['lost']}. Kit {d['inventory']}.
- ACTIVE NONE after entry+walk. Accepted endpoint is P1 continuous component, NOT personal10facecage. Trailindex740/body58 below355 RETIRED as currentpose; global.p4Trail5 NULL deliberately. Do NOT replay trailprograms; global.p4Corridor6 and p4/LATEST_CORRIDOR.json describe actualcurrentstate.
- Cap356 actualrestored61/62, P1 independentACKchat1534. Old333/340 restored#2224. No floorcut or cage inside P1component. Corridor entry coordinated freshholdchat1531 after priorholdexpired; initial2245syntaxfailedbeforeexecution, corrected2250.
- Objective: dragon0/milestones6 lastofficial; no ownmilestone. Delivery19:12 and19:18review missed, NO transfer yet. Next proximity-gated handoff freshiron+2stone+48neth; own1stone/13blocks retained. Actual recipient delta still required.
- State evidence {sys.argv[1]}; corridor receipt/helper p4/iter6_handoff.js. Programs bounded, all movement/path goals/listeners cleared; shield raised intentionally. Check PLAN between batches.
''')
print(json.dumps({k:v for k,v in d.items() if k not in ['walked','inventory']},indent=2))
if d['issue'] or not d['entryAccepted'] or not d['gateRestored'] or not d['protectedCorridor'] or d['dead'] or d['lost'] or d['hp']<17:sys.exit('STOP nonaccepted entry; inspect actualworld')
