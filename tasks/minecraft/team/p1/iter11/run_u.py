import argparse,datetime,json,os,pathlib,re,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--mode',choices=['entry','down','south'],default='south');p.add_argument('--n',type=int,default=1);p.add_argument('--steps',type=int,default=16);p.add_argument('--y',type=int,default=40);p.add_argument('--dx',type=int,default=0);p.add_argument('--dz',type=int,default=1);a=p.parse_args()
base=pathlib.Path('tasks/minecraft/team/p1/iter11');source=(base/'underground.js').read_text();deadline=int(os.environ['CR_DEADLINE'])
for n in range(a.n):
 if time.time()>deadline-85:break
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
 code=f'global.P1UMode={json.dumps(a.mode)};global.P1USteps={a.steps};global.P1UGoalY={a.y};global.P1UDir=[{a.dx},0,{a.dz}];\n'+source
 f=base/('u_'+stamp+'.js');f.write_text(code)
 r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','75',str(f)],text=True,capture_output=True,timeout=85)
 out=r.stdout+r.stderr;(base/('u_'+stamp+'.out')).write_text(out);print(out,flush=True)
 found=re.findall(r'U_END (\{[^\n]*\})',out)
 if not found:print('STOP_NO_END',flush=True);break
 state=json.loads(found[-1]);state.update(stamp=stamp,mode=a.mode,returncode=r.returncode)
 with (base/'STAGES.jsonl').open('a') as log:log.write(json.dumps(state)+'\n')
 if state['issue'] or not state['closed'] or state['lost'] or state['hp']<19:print('STOP_STATE',flush=True);break
 if a.mode=='down' and state['p']['y']<=a.y+.1:break
