"""Read one canonical completed carrier receipt; never play or infer live state."""
import datetime,json,pathlib,re,subprocess,sys
ROOT=pathlib.Path('tasks/minecraft/team/p3/iter16')
def parse(raw):
    m=re.search(r'^== #(\d+|None) ([^\n]+)',raw,re.M)
    if not m: raise ValueError('No canonical program header')
    marker='-- returned --\n'
    if marker not in raw: return {'program':int(m[1]) if m[1]!='None' else None,'header':m[2],'result':None,'result_present':False}
    tail=raw.split(marker,1)[1].lstrip()
    try: result,_=json.JSONDecoder().raw_decode(tail)
    except json.JSONDecodeError: return {'program':int(m[1]) if m[1]!='None' else None,'header':m[2],'result':None,'result_present':False}
    return {'program':int(m[1]) if m[1]!='None' else None,'header':m[2],'result':result,'result_present':True}
def live_line(raw,player):
    return next((line for line in raw.splitlines() if line.startswith(player+': ')),None)
def live_observation(player):
    status=subprocess.run(['python3','tools/mc_arena.py','status'],check=True,text=True,capture_output=True,timeout=15).stdout
    deaths=subprocess.run(['python3','tools/mc_arena.py','events','--type','death','--last','12'],check=True,text=True,capture_output=True,timeout=15).stdout
    own=[line for line in deaths.splitlines() if re.search(r'player='+player+r'(?:\s|$)',line)]
    return {'scope':'separate fresh arena reads after completed receipt; not atomic','observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'player_line':live_line(status,player),'last_known_death':own[-1] if own else None}
if __name__=='__main__':
    if '--smoke' in sys.argv:
        r=parse('== #7 2026-10-17T15:00:00 p2 role=carrier_owner iter=16 1 s\n-- output --\nnoise\n-- returned --\n{"issue":null,"closed":false,"inv":[["blaze_rod",5,null]]}\n')
        assert r['program']==7 and r['result']['closed'] is False
        assert parse('== #8 p2\nno return\n')['result_present'] is False
        rs=[parse(x) for x in re.split(r'(?=^== #)','== #9 p2\n-- returned --\n(nothing)\n== #8 p2\n-- returned --\n{"closed":false}\n',flags=re.M) if x.startswith('== #')]
        assert rs[0]['result_present'] is False and rs[1]['result']['closed'] is False
        assert parse('== #None p2 REFUSED\n')['program'] is None
        assert live_line('p1: (146.5, -36, 2241.5) in overworld, health 20/20\np2: elsewhere','p1').startswith('p1: (146.5')
        assert live_line('p2: elsewhere','p1') is None
        print('parser smoke PASS: false/missing/refused results, fresh live-body line and absent player')
    else:
        player=sys.argv[sys.argv.index('--player')+1] if '--player' in sys.argv else 'p2'
        if player not in ['p1','p2','p3','p4']:raise ValueError('Unknown fixed player')
        raw=subprocess.run(['python3','tools/mc_arena.py','programs','--player',player,'--last','4','--full'],check=True,text=True,capture_output=True,timeout=15).stdout
        records=[parse(x) for x in re.split(r'(?=^== #)',raw,flags=re.M) if x.startswith('== #')];latest=next(v for v in reversed(records) if v['program'] is not None);r=next((v for v in reversed(records) if isinstance(v['result'],dict)),latest);r['player']=player;r['latest_completed_program']=latest['program'];r['state_lags_latest']=r['program']!=latest['program'];r['observed_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();r['scope']='latest completed canonical receipt; NOT current live body';r['live_observation']=live_observation(player)
        dest=ROOT/'receipts';dest.mkdir(exist_ok=True);p=dest/(str(r['program'])+'.json')
        if not p.exists():p.write_text(json.dumps(r,indent=2)+'\n')
        (ROOT/('latest_receipt.json' if player=='p2' else 'latest_'+player+'_receipt.json')).write_text(json.dumps(r,indent=2)+'\n')
        s=r['result'] if isinstance(r['result'],dict) else {}
        print(json.dumps({k:r[k] for k in ['player','program','header','observed_utc','scope','result_present','latest_completed_program','state_lags_latest','live_observation']}|{'returned_fields':{k:s[k] for k in ['p','world','hp','food','issue','closed','lost','rodAfter','rodPreserved','inv','inventory','recovered','attempted','atGoal','entered','endingIssue','down','steps','controls','rod','powder','eye','actualReceipt','world'] if k in s}},separators=(',',':')))
