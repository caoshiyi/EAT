"""p1 only: bounded, sequential arena runs; stop on failed retained ending or stalled progress."""
import json, os, pathlib, subprocess, sys, time
root=pathlib.Path(os.environ['EAT_ROOT']);folder=root/'tasks/minecraft/team/p1/iter8'
limit=int(sys.argv[1]) if len(sys.argv)>1 else 1
for k in range(limit):
    if time.time()>int(os.environ['CR_DEADLINE'])-90:
        print('STOP_CURRENT_DEADLINE',flush=True);break
    runstamp=time.strftime('%H%M%S',time.gmtime()); log=folder/f'travel_{runstamp}_{k}.log'
    p=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','75',str(folder/'travel.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=90)
    log.write_text(p.stdout); print('RUN_LOG',log.name,'code',p.returncode,flush=True)
    ends=[s.split('OVERLAND_END ',1)[1] for s in p.stdout.splitlines() if s.startswith('OVERLAND_END ')]
    results=[s.split('RESULT ',1)[1] for s in p.stdout.splitlines() if s.startswith('RESULT ')]
    if not ends: print('STOP_NO_END',p.stdout[-2500:],flush=True);break
    end=json.loads(ends[-1]); print('ACTUAL',json.dumps(end),flush=True)
    if results: print('RESULT',results[-1],flush=True)
    if p.returncode or end.get('lost') or not end.get('protected') or end['hp']<14 or end['food']<7:
        print('STOP_REASSESS',flush=True);break
    if results and json.loads(results[-1])['displacement']<12:
        print('STOP_STALLED',flush=True);break
    if abs(end['p']['x']-148)<8 and abs(end['p']['z']-2212)<8:
        print('STOP_NEAR_CANDIDATE',flush=True);break
