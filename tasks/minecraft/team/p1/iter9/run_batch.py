raise SystemExit('RETIRED: #4103 batch stopped but wet player died. travel.js disabled; see TOOL_STATUS.md')
import pathlib,subprocess,json,time,os,sys
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter9'
for k in range(int(sys.argv[1]) if len(sys.argv)>1 else 1):
 if time.time()>int(os.environ['CR_DEADLINE'])-150: print('STOP_DEADLINE',flush=True);break
 stamp=time.strftime('%H%M%S',time.gmtime());log=folder/f'travel_{stamp}_{k}.log'
 r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','100',str(folder/'travel.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=115)
 log.write_text(r.stdout);ends=[x.split('STAGE_END ',1)[1] for x in r.stdout.splitlines() if x.startswith('STAGE_END ')]
 if not ends: print('STOP_NO_END',r.stdout[-2500:],flush=True);break
 e=json.loads(ends[-1]);print(log.name,json.dumps(e),flush=True)
 if r.returncode or e['lost'] or e['issue'] or e['hp']<18 or e['food']<9 or e['floating'] or not e['protected'] or e['delta']<12: print('STOP_REASSESS',flush=True);break
 if abs(e['p']['z']-2212)<8: print('STOP_NEAR_ROOT',flush=True);break
