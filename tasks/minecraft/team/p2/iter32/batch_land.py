#!/usr/bin/env python3
"""Two-leg first smoke by default. Stop on a failed/missing world postcondition.
While this caller is outstanding, do not launch another P2 live/SB/chat program.
Uses ordinary arena calls only; exact generated programs and receipts retained.
"""
import argparse,datetime,json,pathlib,subprocess,sys
p=argparse.ArgumentParser();p.add_argument('--legs',type=int,default=2);p.add_argument('--source',required=True);p.add_argument('--tag',required=True);a=p.parse_args();d=pathlib.Path('tasks/minecraft/team/p2/iter32')
r=json.loads(pathlib.Path(a.source).read_text());state=r['returned'];previous_z=state['p']['z'];previous_hp=state['hp'];ledger=[];last_observed=state
for i in range(a.legs):
    inv={}
    for item in state.get('inv',[]): inv[item[0]]=inv.get(item[0],0)+item[1]
    if state.get('dead') or state.get('dim')!='overworld' or state.get('hp',0)<12 or state.get('food',0)<17 or inv.get('sweet_berries',0)<6 or not all(inv.get(n,0)>=1 for n in ['stone_pickaxe','stone_sword','crafting_table']) or inv.get('snowball',0)<20:
        print('BATCH STOP current capability',json.dumps(state),flush=True);break
    tag=f'{a.tag}_{i:02}';target_z=min(2241,int(state['p']['z'])+80)
    cmd=[sys.executable,str(d/'advance.py'),'144',str(target_z),'--ms','26000','--tag',tag]
    print('BATCH LAUNCH',datetime.datetime.now(datetime.timezone.utc).isoformat(),tag,'actual source',state['p'],'goal',target_z,flush=True)
    result=subprocess.run(cmd)
    rec=json.loads((d/(tag+'.out.receipt.json')).read_text());new=rec.get('returned');last_observed=new or last_observed
    row={'tag':tag,'program_id':rec.get('program_id'),'actual':new,'cli':result.returncode};ledger.append(row);(d/(a.tag+'_ledger.json')).write_text(json.dumps(ledger,indent=2)+'\n')
    if result.returncode or rec.get('caller_failure_marker') or rec.get('output_truncated') or not new:
        print('BATCH STOP actual failure/error; inspect postconditions',flush=True);break
    faces=new.get('faces',[])
    if new.get('dead') or not new.get('ground') or new.get('dim')!='overworld' or len(faces)!=10 or not all(f.get('full') for f in faces) or new['p']['z']-previous_z<12 or previous_hp-new['hp']>4:
        print('BATCH STOP retained ending/progress/health requirement',json.dumps(new),flush=True);break
    print('BATCH RETAINED',tag,json.dumps(new),flush=True)
    state=new;previous_z=state['p']['z'];previous_hp=state['hp']
    if state['p']['z']>=2239: break
print('BATCH FINISHED CURRENT_OBSERVED',json.dumps(last_observed),'LAST_ACCEPTED',json.dumps(state),flush=True)
