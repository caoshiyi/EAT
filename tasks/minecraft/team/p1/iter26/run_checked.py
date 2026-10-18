"""Sequential arena CLI runner; stop on failed caller or unverified terminal shelter."""
import argparse, json, pathlib, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('script');p.add_argument('--label',required=True);p.add_argument('--count',type=int,default=1);p.add_argument('--timeout',type=int,default=60);p.add_argument('--min-hp',type=float,default=20);a=p.parse_args()
root=pathlib.Path('tasks/minecraft/team/p1/iter26')
pre=subprocess.run(['node','-e','const fs=require("fs"),A=Object.getPrototypeOf(async function(){}).constructor;new A("bot","Movements","goals",fs.readFileSync(0,"utf8"));'],input=pathlib.Path(a.script).read_text(),capture_output=True,text=True)
if pre.returncode: print('LOCAL_SYNTAX_REJECT',pre.stderr,flush=True);sys.exit(1)
for i in range(a.count):
    r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p1','--timeout',str(a.timeout),a.script],capture_output=True,text=True)
    out=r.stdout+r.stderr;body=out.split('--- output ---',1)[-1].split('--- returned ---',1)[0];(root/f'{a.label}_{i+1}.out').write_text(out)
    lines=[x[len('TERMINAL '):] for x in out.splitlines() if x.startswith('TERMINAL ')]
    try:
        t=json.loads(lines[-1]);s=t['state'];starts=[json.loads(x[len('START '):]) for x in out.splitlines() if x.startswith('START ')];start_hp=starts[0]['hp'] if starts else a.min_hp;valid=r.returncode==0 and 'FAIL' not in body and s['hp']>=max(a.min_hp,start_hp) and s['ground'] and not s['goal'] and not any(s['controls'].values()) and all(x['full'] for x in t['shell'])
    except Exception as e:
        print('REJECT unparsed',repr(e),out[-1500:],flush=True);sys.exit(1)
    errors=[l for l in body.splitlines() if l.startswith(('FAIL ','CLOSE_FAIL ','PRIMARY_FAILURE ','RETENTION_FAILURE '))]
    print(json.dumps({'errors':errors,'program':out.splitlines()[0] if out else None,'i':i+1,'accepted':valid,'state':s}),flush=True)
    if not valid: print(out[-3000:],flush=True);sys.exit(1)
