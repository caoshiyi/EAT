"""Record actual arena completion only; never treats dispatch labels as world truth."""
import argparse,json,re,datetime
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('log');a=ap.parse_args();p=Path(__file__).parent;f=p/a.log;s=f.read_text();records=re.findall(r'^FINAL (\{.*\})$',s,re.M)
if not records:raise SystemExit('No actual FINAL snapshot; header unchanged')
d=json.loads(records[-1]);prog=re.search(r'program #(\d+)',s);issues=re.findall(r'^(?:ISSUE|RECOVERY_FAIL|ROUTE_RESULT) (.*)$',s,re.M);now=datetime.datetime.now(datetime.timezone.utc).isoformat();r={'time':now,'program':prog[1] if prog else None,'actual':d,'issues':issues,'log':a.log}
with (p/'PROGRESS.jsonl').open('a') as out:out.write(json.dumps(r)+'\n')
f=p.parent.parent/'P1.md';old=f.read_text();block='<!-- P1_LIVE -->\n- Fresh actual '+now+' #'+str(r['program'])+': '+json.dumps({k:d.get(k) for k in ['p','hp','food','dead','lost','full','mats','kit']},separators=(',',':'))+'\n- ACTIVE NONE; completedlog '+a.log+'; issues '+json.dumps(issues)+'. Controls/goals cleared, own listeners removed in finally; offhand shield intentionallyheld ifalive.\n<!-- /P1_LIVE -->'
if '<!-- P1_LIVE -->' in old:old=re.sub(r'<!-- P1_LIVE -->.*?<!-- /P1_LIVE -->',lambda m:block,old,flags=re.S)
else:old=old.split('\n',1)[0]+'\n'+block+'\n'+old.split('\n',1)[1]
f.write_text(old);print(json.dumps({k:r[k] for k in ['program','issues','log']}));print(json.dumps({k:d.get(k) for k in ['p','hp','food','full','dead','lost']}))
