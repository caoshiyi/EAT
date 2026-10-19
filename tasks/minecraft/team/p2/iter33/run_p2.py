#!/usr/bin/env python3
"""Serialize all p2 programs across LIVE/SB and retain exact arena output.
Only invokes the ordinary arena CLI, never server files or identity overrides.
"""
import argparse, datetime, fcntl, hashlib, json, os, pathlib, re, subprocess, sys
p=argparse.ArgumentParser(); p.add_argument('--sandbox',action='store_true');p.add_argument('--timeout',type=int,default=60);p.add_argument('--out',required=True);p.add_argument('--say');p.add_argument('file',nargs='?');a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']).resolve()
if pathlib.Path.cwd().resolve()!=root: raise SystemExit('must cd $EAT_ROOT')
if bool(a.file)==bool(a.say): raise SystemExit('provide exactly file or --say')
lockpath=root/'tasks/minecraft/team/p2/iter33/program.lock'
with lockpath.open('w') as lock:
    try: fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError: raise SystemExit('p2 caller already active; no overlap allowed')
    source = pathlib.Path(a.file).read_bytes() if a.file else a.say.encode()
    source_hash = hashlib.sha256(source).hexdigest()
    cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if a.sandbox else [])
    cmd+=['say','--player','p2',a.say] if a.say else ['run','--player','p2','--timeout',str(a.timeout),a.file]
    started_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    r=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    pathlib.Path(a.out).write_text(r.stdout)
    print(('SB' if a.sandbox else 'LIVE'),'exit',r.returncode,'output',a.out)
    lines=r.stdout.splitlines()
    for line in lines:
        if line.startswith(('program #','[sandbox] program #')) or re.match(r'^(?:FAILURE\b|RECOVERY_FAILURE(?:_|\b)|TRANSIT_FAILURE\b|FAILED\b|ERROR\b)',line) or line.startswith(('CRAFT ','GALLERY_RECEIPT','TRAVEL_END','TRANSITION','PORTAL_NEAR')):print(line)
    state=None
    try:
        returned=r.stdout.split('--- returned ---\n',1)[1].split('\n--- ',1)[0]
        state=json.loads(returned);print('RETURNED',json.dumps(state,separators=(',',':')))
    except (IndexError,ValueError): pass
    print('ending_audits',sum(line.startswith('ENDING ') for line in lines))
    own_output=r.stdout.split('--- chat since',1)[0]
    truncated='[output truncated]' in own_output
    failed=any(re.match(r'^(?:FAILURE\b|RECOVERY_FAILURE(?:_|\b)|TRANSIT_FAILURE\b|FAILED\b|ERROR\b)',line) for line in own_output.splitlines())
    if truncated: print('OUTPUT_TRUNCATED: missing failure markers/endings UNKNOWN; inspect actual postconditions')
    header=next((x for x in lines if re.match(r'(?:\[sandbox\] )?program #\d+ on p2:',x)),None)
    match=re.search(r'program #(\d+)',header or '')
    endings=[]
    for line in lines:
        if line.startswith('ENDING '):
            try: endings.append(json.loads(line.split(' ',1)[1]))
            except ValueError: pass
    receipt={'started_utc':started_utc,'source_sha256':source_hash,'player':'p2','environment':'SANDBOX' if a.sandbox else 'LIVE','program_id':int(match.group(1)) if match else None,'header':header,'source_file':a.file,'raw_output':a.out,'cli_exit':r.returncode,'caller_failure_marker':failed,'output_truncated':truncated,'returned':state,'ending_audits':len(endings),'last_ending':endings[-1] if endings else None,'native_pauses':sum(x.startswith('LOW_NATIVE_ATTEMPT_PAUSED ') for x in lines),'captured_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    pathlib.Path(a.out+'.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print('caller_failure_marker',failed,'(a retained recovery does not erase a failed forward operation)')
    sys.exit(r.returncode or (3 if failed else 0))
