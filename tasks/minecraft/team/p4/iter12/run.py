"""P4-only bounded arena caller. Compile first, preserve exact receipt, summarize actual return."""
import argparse,datetime,json,os,pathlib,re,subprocess,sys
root=pathlib.Path(os.environ['EAT_ROOT']).resolve(); owned=root/'tasks/minecraft/team/p4'; here=owned/'iter12'
def returned(s):
    marker='--- returned ---\n'
    if marker not in s:return None
    tail=s.split(marker,1)[1].lstrip()
    try:return json.JSONDecoder().raw_decode(tail)[0]
    except (ValueError,TypeError):return None
ap=argparse.ArgumentParser();ap.add_argument('file',nargs='?');ap.add_argument('--timeout',type=int,default=60);ap.add_argument('--smoke',action='store_true');ap.add_argument('--require-success',action='store_true',help='Reject a structured action issue even when the caller caught it');ap.add_argument('--verify-camp',action='store_true',help='After the program, require fresh world evidence of a protected camp ending');a=ap.parse_args()
if a.smoke:
    assert returned('--- returned ---\n{"hp":20}\n--- chat ---')=={'hp':20}
    assert returned('--- error ---\nSyntaxError') is None
    assert returned('--- returned ---\n(nothing)') is None
    print('parser smoke PASS');sys.exit()
p=pathlib.Path(a.file).resolve();assert p.is_relative_to(owned) and p.suffix=='.js';assert 1<=a.timeout<=240
syntax=subprocess.run(['node','-e','new (Object.getPrototypeOf(async function(){}).constructor)("bot","Movements","goals",require("fs").readFileSync(process.argv[1],"utf8"))',str(p)],cwd=root,capture_output=True,text=True)
if syntax.returncode:
    print('COMPILE_REFUSED; no arena program dispatched\n'+syntax.stderr);sys.exit(2)
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');dest=here/f'{p.stem}_{stamp}.out'
r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p4','--timeout',str(a.timeout),str(p)],cwd=root,capture_output=True,text=True,timeout=a.timeout+20)
s=r.stdout+r.stderr;dest.write_text(s);ret=returned(s);ids=re.findall(r'program #(\d+) on p4',s)
print(json.dumps({'program':ids[-1] if ids else None,'processExit':r.returncode,'actionIssue':ret.get('issue') if isinstance(ret,dict) else None,'receipt':str(dest.relative_to(root)),'returned':ret}))
if '--- error ---' in s or not ids: print(s[-5000:])
if '--- output ---\n' in s:print(s.split('--- output ---\n',1)[1].split('--- returned ---',1)[0].split('--- chat',1)[0].strip())

if a.verify_camp:
    from end_guard import camp_errors
    checkfile=here/'camp_end_probe.js'
    checkstamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
    checkdest=here/f'camp_end_probe_{checkstamp}.out'
    verify=subprocess.run(['python3','tools/mc_arena.py','run','--player','p4','--timeout','12',str(checkfile)],cwd=root,capture_output=True,text=True,timeout=25)
    raw=verify.stdout+verify.stderr;checkdest.write_text(raw)
    observed=returned(raw);problems=camp_errors(observed)
    print(json.dumps({'freshCampCheck':not problems,'errors':problems,'receipt':str(checkdest.relative_to(root)),'world':observed}))
    if problems:sys.exit(3)

# Preserve the action failure even if its subsequent personal ending is safe.
from end_guard import action_exit
code=action_exit(r.returncode,ret,a.require_success)
if code:sys.exit(code)
