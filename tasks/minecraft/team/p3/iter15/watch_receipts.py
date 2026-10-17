"""Read-only watcher of teammate-published receipts; writes only p3 memory."""
import argparse,datetime,json,pathlib,subprocess,time
ap=argparse.ArgumentParser();ap.add_argument('--seconds',type=float,default=120);ap.add_argument('--interval',type=float,default=10);a=ap.parse_args()
end=min(time.time()+a.seconds,1792250260);last=None;source=pathlib.Path('tasks/minecraft/team/p2/iter15/latest_result.json');journal=pathlib.Path('tasks/minecraft/team/p3/iter15/watch.jsonl')
while time.time()<end:
 try:
  r=json.loads(source.read_text())
  if r['program']!=last:
   p=subprocess.run(['python3','tasks/minecraft/team/p3/iter15/receipt.py'],capture_output=True,text=True,timeout=10,check=True);summary=json.loads(p.stdout);last=summary['program']
   with journal.open('a') as f:f.write(json.dumps(summary)+'\n')
   print(p.stdout.strip(),flush=True)
 except (json.JSONDecodeError,subprocess.SubprocessError,FileNotFoundError) as e:print(json.dumps({'watch_retry':type(e).__name__,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}),flush=True)
 time.sleep(min(a.interval,max(0,end-time.time())))
print(json.dumps({'watch_done':True,'last_program':last,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}),flush=True)
