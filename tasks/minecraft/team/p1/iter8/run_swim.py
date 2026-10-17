import json,os,pathlib,subprocess,time,sys
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter8'
for k in range(int(sys.argv[1]) if len(sys.argv)>1 else 1):
 if time.time()>int(os.environ['CR_DEADLINE'])-120:print('STOP_CURRENT_DEADLINE',flush=True);break
 stamp=time.strftime('%H%M%S',time.gmtime());log=folder/f'swim_{stamp}_{k}.log'
 p=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','100',str(folder/'surface_swim.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=115);log.write_text(p.stdout)
 ends=[t.split('SWIM_END ',1)[1] for t in p.stdout.splitlines() if t.startswith('SWIM_END ')]
 print('LOG',log.name,'code',p.returncode,flush=True)
 if not ends:print('STOP_NO_END',p.stdout[-1800:],flush=True);break
 e=json.loads(ends[-1]);print('ACTUAL',json.dumps(e),flush=True)
 (folder/'LIVE.json').write_text(json.dumps({'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'mode':'SURFACE_SWIM','log':log.name,'actual':e},indent=2))
 if e['lost'] or e['hp']<18 or e['food']<9 or e['air']<18 or e['issue'] or e['delta']<12:print('STOP_REASSESS',flush=True);break
 if not e['protected'] and not(e['floating'] and e['jump'] and all(d>12 for n,d in e['foes'])):print('STOP_ENDING',flush=True);break
 if abs(e['p']['x']-148.5)<10 and abs(e['p']['z']-2212.5)<90:print('STOP_SURVEY_RANGE',flush=True);break
