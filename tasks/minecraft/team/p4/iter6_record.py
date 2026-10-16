import datetime,json,pathlib,re,sys
b=pathlib.Path('tasks/minecraft/team/p4');p=pathlib.Path(sys.argv[1]);s=p.read_text();ls=[l for l in s.splitlines() if l.startswith('TRAIL_END ')]
if not ls:sys.exit('NO TRAIL_END: inspect program and actual world before continuing')
d=json.loads(ls[-1][10:]);m=re.search(r'program #(\d+)',s);d['program']=int(m[1]) if m else None;d['recorded_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();d['source']=sys.argv[2] if len(sys.argv)>2 else 'iter6_trail.js';(b/'LATEST_TRAIL.json').write_text(json.dumps(d,indent=2))
accepted=d.get('protectedEnd') and d.get('sealed') and not d.get('dead') and not d.get('lost') and not d.get('issue') and d.get('actualSteps',0)>0 and d['hp']>=17
with (b/'ITER6_LOG.md').open('a') as f:f.write(f'\n{d["recorded_at"]} #{d["program"]} accepted={accepted} index={d["index"]} stepsAttempt={d["actualSteps"]} issue={d["issue"]} actual={d["p"]} HP{d["hp"]}/food{d["food"]} full={d["sealed"]}. Evidence {p}.\n')
pathlib.Path('tasks/minecraft/team/P4.md').write_text(f'''# P4 — iteration6 — {d['recorded_at']}
- Current deadline CR_DEADLINE1792183777=20:49:37UTC. Active run; old deadlines discarded.
- Actual #{d['program']} {d['dim']} {d['p']}, HP{d['hp']}/food{d['food']}, sealed={d['sealed']}, dead={d['dead']}, lost={d['lost']}. Kit {d['inventory']}; offhand {d.get('offhand')} wear{d.get('offhandWear')}.
- ACTIVE NONE. Accepted route index{d['index']}, surface{d.get('surface')}, buried{d.get('buried')}. Attempt target{d['attempted']}/steps{d['actualSteps']}, accepted={accepted}, issue={d['issue']}. Rolled-back forward steps never count as retained progress.
- Objective opening dragon0/milestones5/deaths44; independent18:57 evaluator now6/12 (P2 retainedpearl), dragon0/deaths44. No own fortress or new asset claim. Current purpose delivery to P1 (2stonepicks + freshiron if useful + blocks), retaining own usablepick. Original19:12 receiptbudget MISSED; changed physicalframe tests retained679, new finite review19:18. Stage ends355 outside his continuouscells, no floorcuts inside. P1 notified, receipt not yet confirmed. No supplier mandate or duplicate final lead approach.
- Next: inspect actual result then useful bounded continuation if accepted; otherwise name unresolved assumption/change test. Current source p4/{d["source"]}; evidence {p}. Logs p4/ITER6_LOG.md.
- Shared route floors restored during burial/rise; peer footprint cuts vetoed within3m. No portal changes or item transfer. Globals intentional path/index/buried only; callbacks removed at end. Restart requires actual body match before restoring from LATEST_TRAIL/P4_COURIER_ROUTE.
''')
print(json.dumps({k:v for k,v in d.items() if k not in ['trace','inventory']},indent=2));print('ACCEPTED',accepted)
