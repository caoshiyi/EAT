#!/usr/bin/env python3
"""One-shot canonical receipt, not a watcher or player program. All world reads use arena CLI."""
import argparse,datetime,json,pathlib,re,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parent
FIELDS=['at','world','dimension','lifeId','currentId','p','hp','food','ground','currentCloud','closed','height','pose','lost','issue','endingIssue','retreatIssue','returnIssue','attack','destroyed','before','receipt','inv','inventory','crystals','spawnItems','observed','received','targetId','attacks','arrow0','arrow','activated','released','ammoSpent','after','spawn','gone','cursor','controls','dragon','dragons','boss','bossBefore','bossAfter','beforeCrystals','afterCrystals','target','arrowSpent']
def parse(raw):
    records=[]
    for part in re.split(r'(?=^== #)',raw,flags=re.M):
        if not part.startswith('== #'):continue
        header=part.splitlines()[0];m=re.match(r'== #(\d+|None)\b',header)
        if not m:continue
        row={'program':int(m[1]) if m[1]!='None' else None,'header':header,'result':None}
        if '-- returned --\n' in part:
            try:row['result'],_=json.JSONDecoder().raw_decode(part.split('-- returned --\n',1)[1].lstrip())
            except json.JSONDecodeError:pass
        records.append(row)
    return records
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--player',choices=['p1','p2','p3','p4'],required=True);p.add_argument('--id',type=int);p.add_argument('--last',type=int,default=8);p.add_argument('--live',action='store_true');p.add_argument('--save',action='store_true');a=p.parse_args()
raw=subprocess.check_output(['python3','tools/mc_arena.py','programs','--player',a.player,'--last',str(a.last),'--full'],text=True,timeout=15)
rows=parse(raw);wanted=next((r for r in rows if r['program']==a.id),None) if a.id is not None else next((r for r in reversed(rows) if isinstance(r['result'],dict)),None)
out={'scope':'completed canonical receipt; not current body or physical-effect inference','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'player':a.player,'requested_id':a.id,'available_programs':[r['program'] for r in rows]}
if wanted is None:
    out['headers']=[r['header'] for r in rows]
    out['error']='requested ID absent from bounded records' if a.id is not None else 'no dictionary return in bounded records'
    print(json.dumps(out,separators=(',',':')));sys.exit(2)
r=wanted['result'];out.update(program=wanted['program'],header=wanted['header'],result_is_dictionary=isinstance(r,dict),latest_program=rows[-1]['program'] if rows else None,state_lags_latest=bool(rows and wanted['program']!=rows[-1]['program']))
if isinstance(r,dict):
    out['returned_fields']={k:r[k] for k in FIELDS if k in r};out['available_fields']=list(r)
    out['inventory_field_types']={k:type(r[k]).__name__ for k in ['before','receipt','inv','inventory'] if k in r}
    hp_tags={'STEP':2,'ASCENT':2,'ACTUAL_STAIR_UP':2,'ACTUAL_RETAINED_LOW':2,'OBSERVED_MOVE':4,'ESCAPE_BODY':3}
    actor_hp=[]
    for row in r.get('trace',[]):
        if not isinstance(row,list) or not row:continue
        idx=hp_tags.get(row[0])
        if idx is None or len(row)<=idx:continue
        value=row[idx]
        if isinstance(value,(int,float)) and not isinstance(value,bool) and 0<=value<=20:actor_hp.append((row[0],value))
    if actor_hp:out['actor_hp_in_known_movement_samples']={'min':min(v for _,v in actor_hp),'samples':len(actor_hp),'tags':sorted(set(t for t,_ in actor_hp)),'scope':'verified movement trace schemas only; not complete damage log; target-health attack samples excluded'}
    if a.save:
        dest=ROOT/('receipt_'+str(wanted['program'])+'.json')
        if not dest.exists():dest.write_text(json.dumps(r,indent=2)+'\n')
if a.live:
    status=subprocess.check_output(['python3','tools/mc_arena.py','status'],text=True,timeout=15)
    deaths=subprocess.check_output(['python3','tools/mc_arena.py','events','--type','death','--last','16'],text=True,timeout=15)
    lines=status.splitlines();body_index=next((n for n,s in enumerate(lines) if s.startswith(a.player+': ')),None)
    inventory_line=lines[body_index+1].strip() if body_index is not None and body_index+1<len(lines) and lines[body_index+1].lstrip().startswith('held:') else None
    out['separate_live_read']={'inventory_line':inventory_line,'scope':'later separate non-atomic read; same entity ID can persist across respawn','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'body_line':next((s for s in status.splitlines() if s.startswith(a.player+': ')),None),'last_death':next((s for s in reversed(deaths.splitlines()) if 'player='+a.player+' ' in s),None)}
print(json.dumps(out,separators=(',',':')))
