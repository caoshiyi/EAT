"""Run exactly one p1 arena program, retain raw output, immediately expose its actual ending."""
import sys,subprocess,json,re,datetime
from pathlib import Path
root=Path(__file__).resolve().parent
script=Path(sys.argv[1]).resolve()
if not script.is_relative_to(root.parent):
    raise SystemExit('p1 program path required')
timeout=int(sys.argv[2]) if len(sys.argv)>2 else 60
out=root/(sys.argv[3] if len(sys.argv)>3 else script.stem+'.out')
if out.parent != root: raise SystemExit('output must remain in iter19')
(root/'active.json').write_text(json.dumps({'status':'requested_completion_pending','player':'p1','script':str(script),'output':str(out),'timeout':timeout,'requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p1','--timeout',str(timeout),str(script)],capture_output=True,text=True)
raw=r.stdout+r.stderr
out.write_text(raw)
(root/'active.json').write_text(json.dumps({'status':'cli_returned','player':'p1','script':str(script),'output':str(out),'exit_code':r.returncode,'completed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2))
print(raw.splitlines()[0] if raw else 'EMPTY ARENA OUTPUT',flush=True)
mark='--- returned ---'
if mark not in raw:
    print(raw,flush=True)
    raise SystemExit(r.returncode or 2)
tail=raw.split(mark,1)[1].lstrip()
try: state=json.JSONDecoder().raw_decode(tail)[0]
except Exception:
    print(raw,flush=True)
    raise SystemExit(r.returncode or 2)
(root/(out.stem+'.json')).write_text(json.dumps(state,indent=2))
keys=['issued','minRange','initialHP','minimumHP','retreated','ordinaryCache','received','ready','before','issue','endingIssue','lost','world','dimension','p','hp','food','ground','closed','currentCloud','cursor','inventory','caps','callable','controls','entered','atGoal','moves','reached','attacked','removed','crystalBefore','crystalAfter','climbed','trialComplete','geometry','crystals','dragon']
print(json.dumps({k:state[k] for k in keys if k in state},indent=2),flush=True)
print('RAW',out,flush=True)
if '--- chat since' in raw: print('--- chat since'+raw.split('--- chat since',1)[1],flush=True)
if state.get('endingIssue') or state.get('currentCloud') or state.get('lost'):
    print('HANDLE CURRENT BODY NOW: ending requires inspection/action before unrelated work.',flush=True)
raise SystemExit(r.returncode)
