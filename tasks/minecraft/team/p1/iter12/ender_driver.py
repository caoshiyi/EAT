import argparse,datetime,json,os,pathlib,re,subprocess,time
p=argparse.ArgumentParser();p.add_argument('--index',type=int,required=True);p.add_argument('--batches',type=int,default=1);a=p.parse_args();os.chdir(os.environ['EAT_ROOT']);base=pathlib.Path('tasks/minecraft/team/p1/iter12')
for n in range(a.batches):
 if time.time()>int(os.environ["CR_DEADLINE"])-70:print("STOP_BATCH_DEADLINE_RESERVE");break
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout','65',str(base/'ender_bore.js')],capture_output=True,text=True,timeout=80);out=r.stdout+r.stderr;(base/f'enderpath_{stamp}.out').write_text(out);m=re.search(r'--- returned ---\s*\n([\s\S]*?)\n--- chat',out)
 try:state=json.loads(m[1])
 except (ValueError,TypeError):print(out);print('STOP_PARSE');break
 state.update(stamp=stamp,rc=r.returncode,output=str(base/f'enderpath_{stamp}.out'))
 with (base/'ENDERPATH_STAGES.jsonl').open('a') as log:log.write(json.dumps(state)+'\n')
 shown={k:v for k,v in state.items() if k!='moved'};shown['moved_count']=len(state['moved']);print(json.dumps(shown),flush=True)
 if state['issue'] or not state['full'] or state['hp']<10 or state['lost'] or not state['moved'] or state.get('index')!=a.index+len(state['moved']):print('STOP_ACTUAL_STATE');break
 a.index=state['index']
 if a.index>=state.get('planSize',162):print('PLAN_COMPLETE_ACTUAL');break
