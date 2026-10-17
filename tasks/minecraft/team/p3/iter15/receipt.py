"""Summarize published source receipts; does not play or infer current live state."""
import json,pathlib,datetime,sys,collections
root=pathlib.Path('tasks/minecraft/team/p3/iter15')
p=pathlib.Path('tasks/minecraft/team/p2/iter15/latest_result.json')
r=json.loads(p.read_text());s=r['result']
def plain(v):return isinstance(v,(int,float)) and not isinstance(v,bool)
damage=[]
for row in s.get('trace',[]):
 if isinstance(row,list) and len(row)>=4 and row[0]=='ACTUAL_HIT' and isinstance(row[2],dict):
  b,a=row[2].get('hp'),row[3]
  if plain(b) and plain(a):damage.append({'target':row[2].get('id'),'before':b,'after':a,'delta':round(b-a,6)})
normal=[]
for row in s.get('hitLog',[]):
 if isinstance(row,list) and len(row)>=3 and plain(row[1]) and plain(row[2]):normal.append({'target':row[0],'before':row[1],'after':row[2],'delta':round(row[1]-row[2],6)})
summary={'program':r['program'],'source':r['source'],'receipt_utc':r['observed_utc'],'observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'last published receipt, not live body','issue':s.get('issue'),'ending_issue':s.get('endingIssue'),'hp':s.get('hp'),'position':s.get('p'),'back_full':s.get('backFull'),'high_full':s.get('highFull'),'gate_closed':s.get('gateClosed'),'ordinary_rods':sum(i[1] for i in s['inv'] if isinstance(i,list) and len(i)>1 and i[0]=='blaze_rod') if isinstance(s.get('inv'),list) else s.get('rods') if isinstance(s.get('rods'),(int,float)) else None,'source_rods_field':s.get('rods'),'ending_checks':{k:s[k] for k in ['backFull','northFull','highFull','frontProtected','collectionFull','sealed','closed','enclosed','lowered'] if k in s},'hits_events':len(s.get('hits',[])),'dead_attacked_ids':s.get('dead',[]),'damage_receipts':damage,'normal_hitlog_damage':normal,'kill_events':s.get('kills',[]),'damage_parser_scope':'ACTUAL_HIT trace plus separately normal_hitlog_damage; other schemas remain in raw record; null postHP is not assumed kill','own_hurt_events':s.get('hurts',[]),'projectile_samples':len(s.get('projectiles',[])),'drops':s.get('drops',[]),'inventory':s.get('inv')}
output=dict(summary)
if '--brief' in sys.argv:
 totals=collections.defaultdict(lambda:{'hits':0,'damage':0})
 for row in normal:
  totals[row['target']]['hits']+=1;totals[row['target']]['damage']+=row['delta']
 output['normal_hitlog_damage']={'count':len(normal),'by_target':dict(totals)}
print(json.dumps(output,separators=(',',':')))
archive=root/'receipts';archive.mkdir(exist_ok=True)
f=archive/(str(r['program'])+'.json')
if not f.exists():f.write_text(json.dumps({'summary':summary,'published_record':r},indent=2))
