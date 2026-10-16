"""Bounded p3-only arena runner. No server access; every play uses mc_arena.py."""
import argparse, datetime, json, math, os, pathlib, re, subprocess, sys, time
root=pathlib.Path(os.environ['EAT_ROOT']).resolve()
owned=root/'tasks/minecraft/team/p3/iter6'
header=root/'tasks/minecraft/team/P3.md'
def parse(raw):
    section=raw.split('--- returned ---\n',1)[1].lstrip()
    obj,_=json.JSONDecoder().raw_decode(section)
    if not isinstance(obj,dict): raise ValueError('result is not an object')
    return obj
def stamp(): return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
def record(active, detail):
    old=header.read_text()
    old=re.sub(r'^# P3[^\n]*\n','',old,count=1)
    old=re.sub(r'<!-- P3_AUTO_STATE -->.*?<!-- /P3_AUTO_STATE -->\n','',old,flags=re.S)
    old=re.sub(r'^- Current deadline[^\n]*\n','',old,count=1)
    header.write_text(f'# P3 — iteration6, {stamp()}\n<!-- P3_AUTO_STATE -->\n- Deadline20:49:37UTC from current CR_DEADLINE1792183777. ACTIVE {active}. {detail}\n<!-- /P3_AUTO_STATE -->\n'+old.lstrip())
ap=argparse.ArgumentParser();ap.add_argument('file');ap.add_argument('--max-batches',type=int,default=1);ap.add_argument('--label',default='return');ap.add_argument('--parse-only',action='store_true');ap.add_argument('--contract',choices=['travel','any'],default='travel');ap.add_argument('--timeout',type=int,default=130);args=ap.parse_args()
source=pathlib.Path(args.file).resolve()
if not source.is_relative_to(owned): raise SystemExit('owned p3/iter6 file required')
if args.parse_only:
    d=parse(source.read_text());assert d['sealed'] and not d['lost'];print(json.dumps({'sealed':d['sealed'],'actual':d['actual'],'burial':d['burial']}));raise SystemExit
if not 1<=args.max_batches<=3: raise SystemExit('batch cap1..3')
for n in range(args.max_batches):
    if int(os.environ['CR_DEADLINE'])-time.time()<args.timeout+20: raise SystemExit('current runner deadline too near for130sec run')
    name=f'{args.label}_{datetime.datetime.now(datetime.timezone.utc).strftime("%H%M%S")}_{n+1}.log'
    log=owned/name
    record(source.name+f' timeout{args.timeout}',f'Submitting bounded p3 run; previous actual result in LATEST_TRAVEL.json. Log {name}.')
    print('START',stamp(),source.name,name,flush=True)
    p=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout',str(args.timeout),str(source)],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    log.write_text(p.stdout)
    try: d=parse(p.stdout)
    except Exception as e:
        record('NONE',f'Arena call/result parse failed ({e}); log {name}; inspect status before action.')
        print('STOP_PARSE',p.returncode,str(e),flush=True);break
    (owned/'LATEST_TRAVEL.json').write_text(json.dumps(d,indent=2)+'\n')
    programme=re.search(r'program #(\d+)',p.stdout)
    if args.contract=='any':
        (owned/'LATEST_RESULT.json').write_text(json.dumps(d,indent=2)+'\n')
        facts={k:d[k] for k in ('issue','lost','dead','protectedEnd','dimension','p','hp','food') if k in d}
        if isinstance(d.get('outcome'),dict): facts['outcome']={k:d['outcome'].get(k) for k in ('issue','lost','dead','protectedEnd','dimension','p','hp','food')}
        detail=f'Actual#{programme.group(1) if programme else "?"} RESULT_REQUIRES_REVIEW '+json.dumps(facts,separators=(',',':'))+f'; inventory/fullresult LATEST_RESULT.json; raw {name}.'
        record('NONE',detail)
        print('END_ANY',stamp(),detail,flush=True)
        break
    body=d.get('p');marker=d.get('burial');valid=bool(body and marker and tuple(math.floor(body[k])for k in ('x','y','z'))==tuple(marker['foot']))
    detail=f'Actual#{programme.group(1) if programme else "?"} body={json.dumps(body)} marker={json.dumps(marker)} HP{d.get("hp")} sealed={d.get("sealed")} lost={d.get("lost")} issue={d.get("issue")}; done{d.get("done")}. Raw {name}.'
    record('NONE',detail)
    print('END',stamp(),detail,flush=True)
    if p.returncode or d.get('issue') or d.get('lost') or not d.get('sealed') or not valid or not d.get('done'):
        print('STOP_CONTRACT',flush=True);break
