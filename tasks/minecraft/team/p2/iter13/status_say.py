"""Publish a compact status from a verified fresh arena result, never hand-copy kit prose."""
import datetime,json,os,pathlib,subprocess,sys
root=pathlib.Path(os.environ['EAT_ROOT']);p=root/'tasks/minecraft/team/p2/iter13/latest_result.json';d=json.loads(p.read_text());age=(datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(d['observed_utc'])).total_seconds()
if age>15:raise SystemExit(f'Status older than 15s ({age:.1f}); run fresh_status.js first')
r=d['result'];items=r.get('inv',r.get('items',[]));kit=','.join(f'{i[0]}:{i[1]}' for i in items) or 'EMPTY';pos=','.join(f'{r["p"][k]:.2f}' for k in ['x','y','z']);msg=f'P2 observed#{d["program"]} ({pos}) {r.get("dim","world?")} HP{r["hp"]:.2f}/food{r.get("food","?")} inside={r.get("inside","?")} closed={r.get("closed","?")} kit={kit}; '+(' '.join(sys.argv[1:]))
print(msg);subprocess.run(['python3','tools/mc_arena.py','say','--player','p2',msg],cwd=root,check=True)
