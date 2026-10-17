"""Read only presenter for owned public-arena snapshots; raw evidence is retained."""
import argparse,json,pathlib,re
ap=argparse.ArgumentParser();ap.add_argument('--records',type=int,default=4);ap.add_argument('--chat',type=int,default=6);a=ap.parse_args()
p=pathlib.Path(__file__).parent/'snapshots'
health=[json.loads(x) for x in (p/'health.jsonl').read_text().splitlines()[-4:]]
print('Snapshot receipts:',json.dumps(health))
print((p/'latest_status.txt').read_text())
print('CHAT\n'+'\n'.join(((p/'latest_chat.txt').read_text().splitlines()[-a.chat:] if a.chat>0 else [])))
records=re.split(r'(?=^== #)',(p/'latest_programs.txt').read_text(),flags=re.M)
keys=['caller','issue','recoveryIssue','closed','full','protectedEnd','hp','health','food','lost','dead','all','banked','p','dim','elapsed','inv','kit','stock','bank','pearlNow','pearlDelta','wood','gain','harvests','innerRemoved','target','killed','swings','hurt','gazed','looted','pearlBefore','received','placed']
for r in records[-a.records:]:
 if not r.startswith('== #'):continue
 print(r.splitlines()[0])
 marker='-- returned --\n'
 if marker in r:
  try:
   value=json.loads(r.split(marker,1)[1].strip())
   print(json.dumps({k:value[k] for k in keys if k in value} if isinstance(value,dict) else value,ensure_ascii=False))
  except (ValueError,TypeError):print('Return schema not parsed; inspect raw snapshot.')
 if '-- error --' in r:
  err=r.split('-- error --',1)[1].strip();causes=[x for x in err.splitlines() if re.match(r'^(?:[A-Za-z]*Error):',x)]
  print('\n'.join(causes) if causes else err[-500:])
 if '-- output --' in r:
  out=r.split('-- output --',1)[1].split('-- returned --')[0].split('-- error --')[0]
  lines=[x for x in out.splitlines() if re.search(r'ISSUE|FAIL|RECEIPT|_END|COMPLETE|ACTUAL',x)]
  print('\n'.join(x[:600] for x in lines[-3:]))
