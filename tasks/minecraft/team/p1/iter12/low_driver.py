import argparse,datetime,json,os,pathlib,re,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--x',type=int,required=True);p.add_argument('--z',type=int,required=True);p.add_argument('--batches',type=int,default=1);p.add_argument('--dx',type=int,default=1);p.add_argument('--dz',type=int,default=0);p.add_argument('--steps',type=int,default=16);a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']);os.chdir(root);base=pathlib.Path('tasks/minecraft/team/p1/iter12');src=(base/'low_east16.js').read_text();deadline=int(os.environ['CR_DEADLINE'])
for n in range(a.batches):
 if time.time()>deadline-100:print('BATCH_STOP_DEADLINE_RESERVE');break
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');f=base/f'low_{stamp}.js'
 head=f"global.P1UMode='south';global.P1UDir=[{a.dx},0,{a.dz}];global.P1USteps={a.steps};global.P1UWorkMs=40000;\n"
 # Prefix in base overwrites controls, so replace its explicit settings before running.
 code=src.replace('global.P1UDir=[1,0,0]',f'global.P1UDir=[{a.dx},0,{a.dz}]').replace('global.P1USteps=16',f'global.P1USteps={a.steps}')
 code="if(bot.entity.position.floored().x!=="+str(a.x)+"||bot.entity.position.floored().z!=="+str(a.z)+"||Math.abs(bot.entity.position.y-8)>.1)throw Error('START_COORD');\n"+code
 f.write_text(code);r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','75',str(f)],capture_output=True,text=True,timeout=90);out=r.stdout+r.stderr;(base/f'low_{stamp}.out').write_text(out)
 found=re.findall(r'U_END (\{[^\n]*\})',out)
 if not found:print(out);print('BATCH_STOP_NO_RESULT');break
 state=json.loads(found[-1]);state.update(stamp=stamp,source=str(f),rc=r.returncode)
 with (base/'LOW_STAGES.jsonl').open('a') as log:log.write(json.dumps(state)+'\n')
 print(json.dumps(state),flush=True)
 if state['issue'] or not state['closed'] or state['lost'] or state['hp']<20:print('BATCH_STOP_ACTUAL_STATE',flush=True);break
 x,z=int(state['p']['x']//1),int(state['p']['z']//1)
 if abs(x-a.x)+abs(z-a.z)!=state['steps'] or x!=a.x+a.dx*state['steps'] or z!=a.z+a.dz*state['steps']:print('BATCH_STOP_DISPLACEMENT');break
 a.x,a.z=x,z
 if state['steps']<a.steps:print('BATCH_STOP_SHORT_PROGRESS');break
