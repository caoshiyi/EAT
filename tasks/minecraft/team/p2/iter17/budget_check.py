"""One-shot timestamp arithmetic; no gameplay, watcher, action or inferred success."""
import argparse,datetime,json,os,pathlib
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--start',required=True);p.add_argument('--seconds',required=True,type=float);p.add_argument('--end');p.add_argument('--evidence',required=True);p.add_argument('--save')
a=p.parse_args()
def parse(v):
 if v=='now':return datetime.datetime.now(datetime.timezone.utc)
 d=datetime.datetime.fromisoformat(v.replace('Z','+00:00'))
 if d.tzinfo is None:p.error('timestamp must include timezone; never infer historical date')
 return d.astimezone(datetime.timezone.utc)
start=parse(a.start);end=parse(a.end or 'now');now=datetime.datetime.now(datetime.timezone.utc)
if a.seconds<=0 or end<start or end>now+datetime.timedelta(seconds=1):p.error('positive budget, chronological actual end not future required')
deadline=start+datetime.timedelta(seconds=a.seconds);elapsed=(end-start).total_seconds();overrun=max(0,elapsed-a.seconds)
r={'iteration':os.environ.get('EAT_ITER'),'start_utc':start.isoformat(),'deadline_utc':deadline.isoformat(),'actual_end_utc':end.isoformat(),'budget_seconds':a.seconds,'elapsed_seconds':elapsed,'overrun_seconds':overrun,'status':'MISSED' if overrun>0 else 'WITHIN','evidence':a.evidence,'objective_acceptance':'NOT_INFERRED_FROM_TIME','runner_deadline_utc':datetime.datetime.fromtimestamp(int(os.environ['CR_DEADLINE']),datetime.timezone.utc).isoformat()}
if a.save:
 name=pathlib.Path(a.save)
 if name.name!=a.save or name.suffix!='.json':p.error('save accepts an owned JSON basename only')
 path=pathlib.Path(__file__).resolve().parent/'budgets';path.mkdir(exist_ok=True);target=path/name
 if target.exists():p.error('refuse overwrite of budget evidence')
 target.write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps(r,separators=(',',':')))
