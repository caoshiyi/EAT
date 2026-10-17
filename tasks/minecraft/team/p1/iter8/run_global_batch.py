import json,os,pathlib,subprocess,sys,time
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter8'
for k in range(int(sys.argv[1]) if len(sys.argv)>1 else 1):
 if time.time()>int(os.environ['CR_DEADLINE'])-120:print('STOP_CURRENT_DEADLINE',flush=True);break
 stamp=time.strftime('%H%M%S',time.gmtime());log=folder/f'global_{stamp}_{k}.log'
 p=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','95',str(folder/'global_walk.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=110);log.write_text(p.stdout)
 ends=[t.split('OVERLAND_END ',1)[1] for t in p.stdout.splitlines() if t.startswith('OVERLAND_END ')]
 print('LOG',log.name,'code',p.returncode,flush=True)
 if not ends:print('STOP_NO_END',p.stdout[-1800:],flush=True);break
 e=json.loads(ends[-1]);print('ACTUAL',json.dumps(e),flush=True)
 results=[t.split('RESULT ',1)[1] for t in p.stdout.splitlines() if t.startswith('RESULT ')]
 if results and json.loads(results[-1]).get('displacement',0)<12:print('STOP_STALLED_CHANGE_ASSUMPTION',flush=True);break
 if e.get('lost') or e['hp']<18 or e['food']<9 or e['water'] or (not e['protected'] and (not e.get('grounded') or any(d<10 for n,d in e.get('foes',[])))):print('STOP_REASSESS',flush=True);break
 if abs(e['p']['x']-148)<6 and abs(e['p']['z']-2212)<6:print('STOP_CANDIDATE',flush=True);break
