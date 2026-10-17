import json,os,pathlib,subprocess,sys,time
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter8'
for k in range(int(sys.argv[1]) if len(sys.argv)>1 else 1):
 if time.time()>int(os.environ['CR_DEADLINE'])-90:print('STOP_DEADLINE',flush=True);break
 log=folder/f'tunnel_{time.strftime("%H%M%S",time.gmtime())}_{k}.log'
 p=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','90',str(folder/'tunnel_next.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=105);log.write_text(p.stdout)
 print('LOG',log.name,'return',p.returncode,flush=True);ends=[s.split('TUNNEL_END ',1)[1] for s in p.stdout.splitlines() if s.startswith('TUNNEL_END ')];timings=[s.split('TIMING ',1)[1] for s in p.stdout.splitlines() if s.startswith('TIMING ')]
 if not ends:print('STOP_NO_END',p.stdout[-1500:],flush=True);break
 e=json.loads(ends[-1]);print('ACTUAL',json.dumps(e),flush=True)
 if p.returncode or e['lost'] or e['hp']<18 or not e['hull']['ok'] or (timings and json.loads(timings[-1])['edges']==0):print('STOP_REASSESS',flush=True);break
 if e['p']['z']>=97:print('STOP_ASCENT_ENDPOINT',flush=True);break
