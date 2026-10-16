"""Own p4 only: bounded, observed trail batches. Stops on any nonaccepted ending."""
import argparse,datetime,json,os,pathlib,re,subprocess,sys,time
p=argparse.ArgumentParser();p.add_argument('--segments',type=int,default=1);p.add_argument('--vertical',action='store_true');p.add_argument('--frontier',action='store_true');p.add_argument('--timeout',type=int,choices=[60,90,180],default=180);a=p.parse_args()
if not 1<=a.segments<=3:sys.exit('segments must be 1..3')
root=pathlib.Path(os.environ['EAT_ROOT']);base=root/'tasks/minecraft/team/p4';logs=base/'iter5_logs';logs.mkdir(exist_ok=True)
for k in range(a.segments):
    if time.time()+a.timeout+15>int(os.environ['CR_DEADLINE']):sys.exit('STOP before actual deadline: use shorter manual action')
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    h=root/'tasks/minecraft/team/P4.md';s=h.read_text();s=re.sub(r'(?m)^- ACTIVE.*$',f'- ACTIVE trail_driver.py {k+1}/{a.segments}: iter5_trail_buried.js p4 ONLY, timeout{a.timeout}s; inspect actual TRAIL_END before next batch.',s);h.write_text(s)
    r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p4','--timeout',str(a.timeout),str(base/('iter5_trail_frontier.js' if a.frontier else 'iter5_trail_vertical.js' if a.vertical else 'iter5_trail_buried.js'))],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=a.timeout+15)
    out=r.stdout;(logs/f'trail_{stamp}.txt').write_text(out)
    lines=[l for l in out.splitlines()if l.startswith('TRAIL_END ')]
    if not lines:print(out,flush=True);sys.exit('STOP missing actual ending')
    d=json.loads(lines[-1].split(' ',1)[1]);pid=re.search(r'program #(\d+)',out);d['program']=int(pid[1])if pid else None;d['recorded_at']=stamp;d['source']='iter5_trail_frontier.js' if a.frontier else 'iter5_trail_vertical.js' if a.vertical else 'iter5_trail_buried.js'
    (base/'LATEST_TRAIL.json').write_text(json.dumps(d,indent=2));print(json.dumps({k:v for k,v in d.items() if k!='trace'}),flush=True)
    accepted=r.returncode==0 and d.get('protectedEnd')and d.get('sealed')and not d.get('dead')and not d.get('lost')and not d.get('issue')and d.get('actualSteps',0)>0 and d['hp']>=17
    with(base/'ITER5_LOG.md').open('a')as f:f.write(f'\n- DRIVER {stamp} accepted={accepted} program={d["program"]} index={d["index"]} p={d["p"]} hp={d["hp"]} food={d["food"]} issue={d["issue"]}; full evidence {logs.name}/trail_{stamp}.txt\n')
    summary=f'''# P4 current — {stamp}, iteration5
- ACTUAL #{d['program']}: {d['dim']} {d['p']}, HP{d['hp']}/food{d['food']}, sealed={d['sealed']}, dead={d['dead']}, lost={d['lost']}; trailindex{d['index']}, routeSurface={d.get('surface')}, buried={d.get('buried')}. Kit {d['inventory']}; offhand={d.get('offhand')} wear={d.get('offhandWear')}.
- ACTIVE NONE after completed batch {k+1}/{a.segments}; driver may continue ONLY if accepted={accepted}. Source {d['source']} timeout{a.timeout}s p4only; global p4Trail5 path/index/buried intentional, no persistent callbacks after end.
- Outcome: {d['endpoint']}; actualSteps={d['actualSteps']}, issue={d['issue']}. Beneficiary OWN fortress approach from lead(-269,57,-429), no supplier mandate/peer dependency. First aboveground23-node endpoint passed2039; buried normalcycle passed2042/2043. This is physical retained positioning, NOT fortress/rods/pearls.
- Shared route ORIGINAL FLOOR is restored as each underground endpoint's roof, then restored again during next rise. No support hole claimed safe. Actual cap/surface and state in p4/LATEST_TRAIL.json; historical path still requires fresh floors/headspace every step. P3west5,65/66,2COBclosed, North5,66,1COB, ownSouth3/4,64,4PLANK; portalframe preserved.
- One death16:58:18 remains, recovered1995 then retainedmetal->shield/ironpick2018. Safeportalroundtrip2031, secondstonecycle2033+8net usedownfieldcaps2034/2039. No laterdeath accepted. P3still20/20laststatus, peersinactive/uncontrolled.
- Next: continue actual route toward fortress; 724 historicalnodes reconstructedfromarena; ownunexecutedextension882 avoidsP1body beforebricklead. No approval gate. ACTUALdeadline18:46:15UTC CR_DEADLINE1792176375; evaluatorlast5/12dragon0deaths44. Ownfiles P4.md+p4/ONLY. Full history ITER5_LOG.md and iter5_logs/.
'''
    h.write_text(summary)
    if not accepted:sys.exit('STOP nonaccepted world result; inspect before more play')
