"""Render a bounded p3 operation from explicit JSON; parse only, never play.
Usage: python3 .../build_job.py flat|shaft JOB.json OUTPUT.js
The JSON and output must both live directly in p3/. World safety is NOT certified.
"""
import json,os,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parent
if Path.cwd().resolve()!=Path(os.environ['EAT_ROOT']).resolve():raise SystemExit('run from EAT_ROOT')
if len(sys.argv)!=4:raise SystemExit(__doc__)
kind,src,dst=sys.argv[1:];source=Path(src).resolve();target=Path(dst).resolve()
if source.parent!=root or target.parent!=root or target.suffix!='.js':raise SystemExit('p3 direct files only')
job=json.loads(source.read_text())
def point(v):return isinstance(v,list) and len(v)==3 and all(type(n)is int for n in v)
if not point(job.get('origin')):raise SystemExit('integer origin required')
if kind=='flat':
 template='flat_mine_operation.js';nodes=job.get('nodes')
 if not isinstance(nodes,list) or not 1<=len(nodes)<=8:raise SystemExit('1..8 nodes required')
 prev=job['origin']
 for v in nodes:
  if not point(v) or v[1]!=prev[1] or abs(v[0]-prev[0])+abs(v[2]-prev[2])!=1:raise SystemExit('flat cardinal nodes required')
  prev=v
elif kind=='route':
 template='known_volume_operation.js'
 if not isinstance(job.get('volume'),list) or not 1<=len(job['volume'])<=16 or not all(point(v) for v in job['volume']):raise SystemExit('1..16 volume feet required')
 if not isinstance(job.get('cuts'),list) or len(job['cuts'])>16 or not all(point(v) for v in job['cuts']):raise SystemExit('0..16 cut positions required')
 if not isinstance(job.get('nodes'),list) or not 1<=len(job['nodes'])<=8:raise SystemExit('1..8 route nodes required')
 prev=job['origin']
 for v in job['nodes']:
  if not point(v) or v not in job['volume'] or abs(v[0]-prev[0])+abs(v[2]-prev[2])!=1 or abs(v[1]-prev[1])>1:raise SystemExit('route cardinal step and volume membership required')
  prev=v
elif kind in ['shaft','up']:
 template='shaft_down_operation.js' if kind=='shaft' else 'pillar_up_operation.js'
 if type(job.get('layers'))is not int or not 1<=job['layers']<=8:raise SystemExit('1..8 layers required')
else:raise SystemExit('unknown operation')
staged=root/(target.name+'.pending')
staged.write_text('const job='+json.dumps(job,separators=(',',':'))+';\n'+(root/template).read_text())
try:
 subprocess.run(['node',str(root/'check_program.cjs'),str(staged)],check=True)
 staged.replace(target)
finally:
 if staged.exists():staged.unlink()
print('RENDERED',kind,target.name,'PARSE ONLY; run p3 and verify actual endpoint separately.')
