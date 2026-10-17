"""Read-only arena receipt collector. Never invokes run or say."""
import datetime,json,pathlib,re,subprocess
BASE=pathlib.Path(__file__).parent
KEEP=('at','issue','endingIssue','lost','dead','lifeId','dimension','p','hp','food','ground','closed','currentCloud','controls','cursor','inventory','inv','world','currentId','reached','issued','receipt','before','after','destroyed','beforeCrystals','afterCrystals','attack','attacks','kills','result','trialComplete','climbed','attacked','removed','crystalBefore','crystalAfter','entered','atGoal','callable','caps','ready','made','planks','wood','coff','giftPicks','phase','primaryProof','reserveProof','voidCommitted','deathObserved','respawnObserved','respawnValid','floorFull','roofFull','injuryEvents','lifeRetained','positionRetained','healthRetained','dimensionRetained','minRange','initialHP','minimumHP','retreated','stagePhase','launchProof','criticalProof','preparedGaps','dragon','crystals')
def parse(raw):
    result=[]
    for block in re.split(r'(?m)(?=^== #)',raw):
        if not block.startswith('== #'):continue
        row={'header':block.splitlines()[0]}
        if '-- returned --\n' in block:
            payload=block.split('-- returned --\n',1)[1]
            try:
                value=json.JSONDecoder().raw_decode(payload.lstrip())[0]
                row['returned']=value
            except ValueError as e:row['parse_error']=str(e)
        else:row['returned_missing']=True
        if '-- output --\n' in block:row['output']=block.split('-- output --\n',1)[1].split('-- returned --',1)[0]
        result.append(row)
    return result
def smoke():
    x=parse('== #1 example\n-- returned --\n{"closed":false,"issue":null}\n== #2 example\ncode\n')
    assert x[0]['returned']=={'closed':False,'issue':None} and 'lost' not in x[0]['returned']
    assert x[1]['returned_missing'] is True
    y=parse('== #4 case\n-- returned --\n{"attacked":false,"crystalAfter":null}')[0]['returned']
    assert y['attacked'] is False and y['crystalAfter'] is None and 'climbed' not in y
    assert parse('== #3\n-- returned --\nnull\n')[0]['returned'] is None
if __name__=='__main__':
    smoke()
    statefile=BASE/'observer_cursor.json'
    state=json.loads(statefile.read_text()) if statefile.exists() else {}
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    for action,args in [('programs',['--last','12','--full']),('status',[]),('chat',['--last','12']),('events',['--last','8'])]:
        p=subprocess.run(['python3','tools/mc_arena.py',action,*args],capture_output=True,text=True,timeout=30)
        (BASE/(stamp+'_'+action+'.txt')).write_text(p.stdout+p.stderr)
        if p.returncode:print(action,'ERROR',p.returncode,p.stderr);continue
        if action=='programs':
            rows=parse(p.stdout);(BASE/(stamp+'_receipts.json')).write_text(json.dumps(rows,indent=2))
            for row in rows:
                ident=row['header']
                if ident in state.get('program_headers',[]):continue
                state.setdefault('program_headers',[]).append(ident)
                view={k:v for k,v in row.items() if k not in ('returned','output')}
                if 'returned' in row:
                    val=row['returned']
                    view['returned']={k:val[k] for k in KEEP if k in val} if isinstance(val,dict) else val
                print(json.dumps(view))
        else:
            lines=p.stdout.splitlines()
            if action in ('chat','events'):
                fresh=[line for line in lines if line not in state.get(action,[])]
                state[action]=(state.get(action,[])+fresh)[-250:]
                if fresh:print(action+'\n'+'\n'.join(fresh))
            elif state.get(action)!=p.stdout:
                print(action+'\n'+p.stdout);state[action]=p.stdout
    statefile.write_text(json.dumps(state,indent=2))
