"""Owned arena wrapper: exact output saved; bounded batches stop on any issue."""
import argparse, datetime, json, os, pathlib, re, subprocess
ROOT=pathlib.Path(os.environ['EAT_ROOT']); HERE=ROOT/'tasks/minecraft/team/p1/iter10'
def parse(s):
    rows=[x[len('ADVANCE_END '):] for x in s.splitlines() if x.startswith('ADVANCE_END ')]
    return json.loads(rows[-1]) if rows else None
ap=argparse.ArgumentParser();ap.add_argument('--n',type=int,default=1);ap.add_argument('--target',nargs=2,type=int);ap.add_argument('--smoke',action='store_true');ap.add_argument('--work',type=int,choices=[20,40,60,90,120,180],default=40);a=ap.parse_args()
if a.smoke:
    assert parse('program #1\nADVANCE_END {"hp":20,"issue":null}')=={'hp':20,'issue':None}
    assert parse('error only') is None
    print('parser smoke PASS');raise SystemExit
assert 1<=a.n<=4
for i in range(a.n):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');src=(HERE/'advance.js').read_text()
    src=src.replace('began+40000',f'began+{a.work*1000}').replace('began+70000',f'began+{(a.work+30)*1000}')
    if a.target: src=f'global.P1RouteTarget={{x:{a.target[0]},z:{a.target[1]}}};\n'+src
    path=HERE/f'stage_{stamp}.js';path.write_text(src)
    r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout',str(a.work+40),str(path)],cwd=ROOT,capture_output=True,text=True)
    output=r.stdout+r.stderr;(HERE/f'stage_{stamp}.out').write_text(output)
    end=parse(output);ids=re.findall(r'program #(\d+) on p1',output)
    row={'at':stamp,'program':ids[-1] if ids else None,'exit':r.returncode,'end':end,'log':f'stage_{stamp}.out'}
    with (HERE/'STAGES.jsonl').open('a') as f:f.write(json.dumps(row)+'\n')
    print(json.dumps(row),flush=True)
    if not end or end.get('issue') is not None or end.get('lost') or end.get('hp',0)<18 or end.get('ending') not in ['PROTECTED_SHAFT','PROTECTED_BOX','DRY_HOLD','OPEN_SURFACE_HOLD']:
        print(output[-4000:],flush=True);break
