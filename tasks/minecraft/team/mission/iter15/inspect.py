"""Show exact changed public observation text, with no world-state success inference."""
import json,pathlib,re
root=pathlib.Path(__file__).resolve().parent
receipt=json.loads((root/'observations/latest.json').read_text())
folder=pathlib.Path(receipt['path'])
statefile=root/'inspect_cursor.json';previous=json.loads(statefile.read_text()) if statefile.exists() else {'chat':5623,'status':'','events':''}
print('SNAPSHOT',receipt['utc'],'ERRORS', {k:v for k,v in receipt['results'].items() if v['exit_code'] or v['stderr']})
chat=(folder/'chat.txt').read_text();lines=[];last=previous['chat']
for line in chat.splitlines():
 m=re.match(r'#(\d+)',line)
 if m and int(m[1])>previous['chat']:lines.append(line)
 if m:last=max(last,int(m[1]))
print('\n'.join(lines) or 'No new chat in snapshot.')
status=(folder/'status.txt').read_text()
if status!=previous['status']:
 oldlines=previous['status'].splitlines();newlines=status.splitlines()
 for index,line in enumerate(newlines):
  if index>=len(oldlines) or oldlines[index]!=line:print(line)
else:print('Status text unchanged.')
events=(folder/'events.txt').read_text()
if events!=previous['events']:print('EVENTS',events)
statefile.write_text(json.dumps({'chat':last,'status':status,'events':events}))
