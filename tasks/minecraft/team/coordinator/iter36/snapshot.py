"""Read-only arena evidence collector; no run/say/reset or player programs."""
import datetime, json, pathlib, re, subprocess, sys
base=pathlib.Path('tasks/minecraft/team/coordinator/iter36')
cursor=base/'cursor.json'
old=json.loads(cursor.read_text()) if cursor.exists() else {'chat':13166}
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
commands={'chat':['chat','--since',str(old['chat'])], 'events':['events','--last','12']}
if '--review' in sys.argv: commands['programs']=['programs','--last','12','--full']
for label,args in commands.items():
    result=subprocess.run([sys.executable,'tools/mc_arena.py',*args],text=True,capture_output=True)
    output=result.stdout+result.stderr
    (base/f'{stamp}_{label}.txt').write_text(output)
    if result.returncode: print(label,'FAILED',result.returncode,output[:1000]); continue
    if label=='chat':
        lines=[line for line in output.splitlines() if not (m:=re.match(r'#(\d+) ',line)) or int(m.group(1))>old['chat']]
        print('\n'.join(lines) if lines else 'No new chat')
        ids=[int(x) for x in re.findall(r'^#(\d+) ',output,re.M)]
        if ids: old['chat']=max(old['chat'],*ids)
    elif label=='events':
        if output!=old.get('events'): print('EVENTS',output[-2500:])
        old['events']=output
    else: print('Program evidence saved:',base/f'{stamp}_{label}.txt')
cursor.write_text(json.dumps(old))
print('Captured',stamp,'UTC; chat cursor',old['chat'])
