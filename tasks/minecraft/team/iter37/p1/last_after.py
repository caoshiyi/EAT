"""One-use deadline continuation; only healthy clean low endings qualify."""
from pathlib import Path
import datetime,json,re,subprocess,sys,time
root=Path(__file__).resolve().parent
def outcome(path):
    return next((json.loads(s[len('OUTCOME '):]) for s in path.read_text().splitlines() if s.startswith('OUTCOME ')),{})
def eligible(r):
    return r.get('full') is True and r.get('ownHP')==20 and r.get('finalBoss',0)>0 and not r.get('issue') and not r.get('errors') and abs(r.get('p',{}).get('y',999)-50)<.05
if len(sys.argv)>1:
    print('CHECK_ONLY',eligible(outcome(root/sys.argv[1])));sys.exit()
path=root/'LIVE_live_finish_weapon_214227.out'
now=lambda:datetime.datetime.now(datetime.timezone.utc)
earliest=datetime.datetime.fromisoformat('2026-10-19T21:47:40+00:00')
latest=datetime.datetime.fromisoformat('2026-10-19T21:48:02+00:00')
while now()<latest and (now()<earliest or not path.exists()):time.sleep(.2)
if not path.exists() or now()>=latest or not eligible(outcome(path)):
    print('NO_CONTINUATION: deadline or ending not eligible');sys.exit()
status=subprocess.run(['python3','tools/mc_arena.py','status'],capture_output=True,text=True).stdout
p1=next((x for x in status.splitlines() if x.startswith('p1:')),'')
print('CONTINUATION_NATIVE_CHECK',p1,flush=True)
if 'running program' in p1 or 'in the_end, health 20/20' not in p1 or not re.search(r'^p1: \(-2\.\d+, 50, 4\.\d+\)',p1):
    print('NO_CONTINUATION: fresh body mismatch');sys.exit()
remaining=int((datetime.datetime.fromisoformat('2026-10-19T21:48:17+00:00')-now()).total_seconds())
if remaining<8: print('NO_CONTINUATION: cleanup budget');sys.exit()
subprocess.run(['python3',str(root/'run.py'),'live_last_window.js',str(min(40,remaining))],check=False)
