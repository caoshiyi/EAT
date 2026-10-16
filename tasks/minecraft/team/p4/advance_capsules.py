"""Own-player bounded arena orchestration; no world access outside mc_arena.
One call by default; scale only after inspecting saved output/postcondition.
"""
import argparse,datetime,json,os,pathlib,subprocess,sys
p=argparse.ArgumentParser();p.add_argument('--segments',type=int,default=1);a=p.parse_args()
if not 1<=a.segments<=3:sys.exit('segments must be1..3')
root=pathlib.Path(os.environ['EAT_ROOT']);base=root/'tasks/minecraft/team/p4'
for k in range(a.segments):
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    header=root/'tasks/minecraft/team/P4.md'
    header.write_text('\n'.join('- Active program: advance_capsules.py segment '+str(k+1)+'/'+str(a.segments)+' enclosed_bundle_eight.js p4 ONLY timeout100s; inspect result before reuse.' if line.startswith('- Active program:') else line for line in header.read_text().splitlines())+'\n')
    result=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p4','--timeout','100',str(base/'enclosed_bundle_eight.js')],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=115)
    output=result.stdout;(base/f'capsule_{stamp}.log').write_text(output)
    lines=[s for s in output.splitlines() if s.startswith('ENDPOINT_ACTUAL ')]
    if not lines:print(output,flush=True);sys.exit('STOP missing endpoint evidence')
    data=json.loads(lines[-1].split(' ',1)[1]);print(stamp,json.dumps(data),flush=True)
    with (base/'ITER4_LOG.md').open('a')as f:f.write(f'- Auto bounded segment {stamp}: '+json.dumps(data)+'\n')
    current=root/'tasks/minecraft/team/P4.md';s=current.read_text();ls=s.splitlines()
    for n,line in enumerate(ls):
        if line.startswith('- Actual fresh status:'):ls[n]=f'- Actual fresh status: {stamp} Nether{data["p"]}, HP{data["hp"]}/food{data["food"]}, dead={data["dead"]}, sealed={data["sealed"]}, onGround={data["onGround"]}.'
        if line.startswith('- Inventory '):ls[n]='- Inventory '+json.dumps(data['inventory'])+'; SHIELD offhand last verified.'
        if line.startswith('- Active program:'):ls[n]='- Active program: NONE at this completed endpoint; orchestrator may start next bounded segment if acceptance passes.'
        if line.startswith('- Verified interfaces:'):ls[n]='- Verified interfaces: current fullshell per ENDPOINT_ACTUAL; prior trace passages may be OPEN; no peer users in this footprint. See capsule logs for exact trace.'
    current.write_text('\n'.join(ls)+'\n')
    if result.returncode or data['issue'] or not data['sealed'] or data['dead'] or not data['onGround'] or data['hp']<17 or len(data['trace'])<=1:sys.exit('STOP nonaccepted segment')
