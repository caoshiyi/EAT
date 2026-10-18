"""Send p1 coordination only after independently checking that its body is idle."""
import subprocess,sys
base=[sys.executable,'tools/mc_arena.py']
r=subprocess.run(base+['status'],capture_output=True,text=True,check=True)
line=next((x for x in r.stdout.splitlines() if x.startswith('p1:')),None)
if line is None or 'running program' in line:
    print('LOCAL GUARD: no message sent;',line)
    raise SystemExit(2)
if not sys.argv[1:]:
    print('IDLE CHECK ONLY:',line)
else:
    raise SystemExit(subprocess.run(base+['say','--player','p1',' '.join(sys.argv[1:])]).returncode)
