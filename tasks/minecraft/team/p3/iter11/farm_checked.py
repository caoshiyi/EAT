"""Run a bounded number of p3 cases, advancing only from completed world receipts."""
import argparse,datetime,json,os,pathlib,subprocess,time
BASE=pathlib.Path('tasks/minecraft/team/p3/iter11')
def receipt(s):
    marker=next((m for m in ['--- returned ---\n','-- returned --\n'] if m in s),None)
    if marker is None: raise ValueError('no completed receipt')
    return json.JSONDecoder().raw_decode(s.split(marker,1)[1].lstrip())[0]
def eligible(r):
    pending_drop=any(t and t[0]=='FRESH_PEARL' for t in r.get('trace',[])) and not r.get('looted')
    return r.get('issue') is None and r.get('killed') is True and r.get('full') is True and isinstance(r.get('hp'),(int,float)) and not isinstance(r.get('hp'),bool) and r['hp']>=20 and not r.get('lost') and not r.get('hurt') and not pending_drop
p=argparse.ArgumentParser();p.add_argument('--parse-only');p.add_argument('--count',type=int,default=1);a=p.parse_args()
if a.parse_only:
    r=receipt(pathlib.Path(a.parse_only).read_text());print(json.dumps({'parser_test':True,'eligible':eligible(r),'target':r.get('target'),'hp':r.get('hp'),'full':r.get('full'),'pearls':r.get('pearlNow')}));raise SystemExit
if not 1<=a.count<=4: raise SystemExit('count must be 1..4')
for i in range(a.count):
    deadline=float(os.environ.get('CR_DEADLINE','inf'))
    if time.time()+110>=deadline: print('STOP current runner deadline reserve',flush=True);break
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
    proc=subprocess.run(['python3','tools/mc_arena.py','run','--player','p3','--timeout','95',str(BASE/'native_axe_one.js')],text=True,capture_output=True,timeout=110)
    (BASE/('farm_'+stamp+'.log')).write_text(proc.stdout+proc.stderr)
    try:r=receipt(proc.stdout)
    except Exception as e: print(json.dumps({'case':i,'STOP':str(e),'returncode':proc.returncode,'tail':proc.stdout[-250:]}),flush=True);break
    summary={k:r.get(k) for k in ['issue','target','killed','swings','looted','pearlBefore','pearlNow','hp','food','full','hurt','lost','elapsed']};summary['case']=i;summary['continue_qualified']=eligible(r);summary['receipt_file']='farm_'+stamp+'.log';print(json.dumps(summary),flush=True)
    if not eligible(r):break
