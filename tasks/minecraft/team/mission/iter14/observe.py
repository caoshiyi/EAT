"""Read-only arena receipts, with full raw snapshots and late-completion detection."""
import subprocess, pathlib, datetime, json, re, hashlib
base=pathlib.Path('tasks/minecraft/team/mission/iter14'); snapshots=base/'observations';snapshots.mkdir(exist_ok=True)
statefile=base/'observer_state.json';state=json.loads(statefile.read_text()) if statefile.exists() else {}
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
print('UTC',datetime.datetime.now(datetime.timezone.utc).isoformat())
for name,args in [('status',['status']),('programs',['programs','--last','80','--full']),('chat',['chat','--last','35']),('events',['events','--last','8'])]:
    result=subprocess.run(['python3','tools/mc_arena.py',*args],capture_output=True,text=True,timeout=20)
    raw=result.stdout+result.stderr;(snapshots/f'{stamp}_{name}.txt').write_text(raw)
    if result.returncode: print(name,'FAILED',result.returncode,raw[:1000]);continue
    if name=='programs':
        for part in re.split(r'(?=^== #)',raw,flags=re.M):
            match=re.match(r'== #(\d+)[^\n]*',part)
            if not match:continue
            ident=match.group(1)
            if 'iter=14' not in match.group(0): continue
            h=hashlib.sha256(part.encode()).hexdigest()
            if state.get('program'+ident)==h:continue
            state['program'+ident]=h
            print(match.group(0))
            sections=re.split(r'(^-- (?:output|returned|error) --\s*$)',part,flags=re.M)
            if len(sections)>1:
                returned=part.split('-- returned --')[-1].strip() if '-- returned --' in part else ''
                try:
                    obj=json.loads(returned)
                    if isinstance(obj,dict):
                        keys=['issue','phase','closed','lost','dead','p','hp','food','elapsed','rod','rods','pearl','pearls','gaze','swings','hits','killed','kills','pearlBefore','pearlNow','gazes','deadIds','bank','error']
                        obj={k:obj[k] for k in keys if k in obj}
                    summary=json.dumps(obj,separators=(',',':'))
                except Exception: summary=returned
                lines=part.split('-- output --')[-1].split('-- returned --')[0].splitlines() if '-- output --' in part else []
                noteworthy=[x for x in lines if any(w in x.upper() for w in ['FAIL','ISSUE','ERROR','ROD','PEARL','KILL','CONTACT','HIT','ENDING','DEATH'])]
                print('RESULT',summary[:350], 'EVIDENCE', '; '.join(noteworthy[-2:])[:280])
            else:
                chats=re.findall(r'bot\.chat\(([^\n]+)',part)
                print('CHAT/SOURCE ONLY',('\n'.join(chats))[:2000])
    elif name in ('chat','events'):
        old=set(state.get(name,[]));lines=raw.splitlines()
        print(name, '\n'.join(x for x in lines if x not in old));state[name]=lines
    else:print('\n'.join(x for x in raw.splitlines() if x.startswith(('p1:', 'p2:', 'p3:', 'p4:'))))
statefile.write_text(json.dumps(state))
