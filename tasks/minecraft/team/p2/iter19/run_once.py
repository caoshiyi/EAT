#!/usr/bin/env python3
"""Fixed-p2 arena runner; preserve raw result and surface ending before other work."""
import argparse,datetime,json,os,re,subprocess,sys,time
from pathlib import Path
root=Path(__file__).resolve().parents[5]
owned=root/'tasks/minecraft/team/p2'
p=argparse.ArgumentParser()
p.add_argument('program',type=Path)
p.add_argument('--timeout',type=int,default=30)
p.add_argument('--label',default='run')
a=p.parse_args()
program=a.program.resolve()
if not program.is_relative_to(owned) or not program.is_file():
    p.error('Program must be an existing file under team/p2/')
if not 1<=a.timeout<=240:p.error('timeout must be1..240 seconds')
if not re.fullmatch(r'[A-Za-z0-9_-]+',a.label):p.error('label must be a simple name')
deadline=os.environ.get('CR_DEADLINE')
if deadline:
    try:remaining=int(float(deadline)-time.time()-2)
    except ValueError:p.error('Current runner deadline is invalid')
    if remaining<1:p.error('Current runner deadline reached; no program launched')
    a.timeout=min(a.timeout,remaining)
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
raw=owned/'iter19'/f'{stamp}_{a.label}.out'
cmd=[sys.executable,str(root/'tools/mc_arena.py'),'run','--player','p2','--timeout',str(a.timeout),str(program)]
try:
    done=subprocess.run(cmd,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=a.timeout+20)
    output=done.stdout
except subprocess.TimeoutExpired as e:
    output=e.stdout or ''
    if isinstance(output,bytes):output=output.decode(errors='replace')
    raw.write_text(output)
    print(json.dumps({'raw':str(raw),'canonical_result':False,'issue':'HOST_TIMEOUT: arena may still be active; inspect status before another program'}))
    sys.exit(2)
raw.write_text(output)
marker='--- returned ---\n'
summary={'raw':str(raw),'process_exit':done.returncode,'canonical_result':False}
header=re.search(r'program #(\d+) on p2: ([^\n]+)',output)
if header:summary['program_id']=int(header[1]);summary['duration']=header[2]
if marker in output:
    tail=output.split(marker,1)[1].lstrip()
    try:
        result,_=json.JSONDecoder().raw_decode(tail)
        summary['canonical_result']=True
        if isinstance(result,dict):
            keys=['at','now','issue','issueRoute','endingIssue','lost','reached','closed','currentCloud','hp','health','food','ground','p','pos','dimension','world','inventory','inv','controls','goal','cursor','window','retainedOriginal','visible','peerObserved','peers','wear','before','after','issued','gift']
            summary['ending']={k:result[k] for k in keys if k in result}
            summary['omitted_result_keys']=[k for k in result if k not in keys]
        else:summary['result']=result
    except json.JSONDecodeError:summary['issue']='No JSON canonical result; read raw/state, do not infer success'
else:summary['issue']='No canonical result marker; inspect raw/status before another program'
print(json.dumps(summary,indent=2))
sys.exit(done.returncode)
