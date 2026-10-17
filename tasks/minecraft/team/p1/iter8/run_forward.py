import json,os,pathlib,subprocess,time,sys
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter8'
for k in range(int(sys.argv[1]) if len(sys.argv)>1 else 2):
 if time.time()>int(os.environ['CR_DEADLINE'])-125: print('STOP_CURRENT_DEADLINE',flush=True);break
 stamp=time.strftime('%H%M%S',time.gmtime());log=folder/f'forward_{stamp}_{k}.log'
 p=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','110',str(folder/'forward_route.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=125);log.write_text(p.stdout)
 ends=[t.split('OVERLAND_END ',1)[1] for t in p.stdout.splitlines() if t.startswith('OVERLAND_END ')]
 print('LOG',log.name,'code',p.returncode,flush=True)
 if not ends:print('STOP_NO_END',p.stdout[-1800:],flush=True);break
 e=json.loads(ends[-1]);print('ACTUAL',json.dumps(e),flush=True)
 (folder/'LIVE.json').write_text(json.dumps({'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'log':str(log.name),'actual':e},indent=2))
 ds=[float(t.split('CANOPY_DELTA ',1)[1]) for t in p.stdout.splitlines() if t.startswith('CANOPY_DELTA ')]
 if not ds or ds[-1]<12:print('STOP_STALLED_CHANGE_ASSUMPTION',flush=True);break
 if e.get('lost') or e['hp']<18 or e['food']<9 or e['water'] or not e['protected']:print('STOP_REASSESS',flush=True);break
 if abs(e['p']['x']-148)<6 and abs(e['p']['z']-2212)<6:print('STOP_CANDIDATE',flush=True);break
