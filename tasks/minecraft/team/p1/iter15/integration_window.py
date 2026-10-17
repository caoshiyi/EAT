"""Bounded read-only p1 input window; never plays or changes the world."""
import datetime, os, re, subprocess, sys, time
from pathlib import Path
seconds = min(300, max(1, int(sys.argv[1]) if len(sys.argv)>1 else 300))
interval = min(15, seconds)
start = time.time(); end = min(start+seconds, int(os.environ['CR_DEADLINE']))
since = int(sys.argv[2]) if len(sys.argv)>2 else 0
log = Path('tasks/minecraft/team/p1/iter15/integration_windows.log')
def emit(kind, value):
    line = datetime.datetime.now(datetime.timezone.utc).isoformat()+' '+kind+' '+value
    print(line,flush=True)
    with log.open('a') as f: f.write(line+'\n')
def arena(*args):
    p = subprocess.run([sys.executable,'tools/mc_arena.py',*args],text=True,capture_output=True,timeout=12)
    if p.returncode: raise RuntimeError(p.stderr or p.stdout)
    return p.stdout
last = None
while True:
    raw=arena('status'); section=raw.split('p2:',1)[0].strip()
    if section != last: emit('P1',section.replace('\n',' | ')); last=section
    messages=arena('chat','--since',str(since+1),'--last','40')
    ids=[int(x) for x in re.findall(r'^#(\d+)',messages,re.M)]
    if ids: since=max(ids); emit('CHAT',messages.strip())
    source=raw.split('p2:',1)[1].split('p3:',1)[0] if 'p2:' in raw else ''
    source_rods=re.search(r'\bblaze_rod x(\d+)',source)
    if source_rods and int(source_rods.group(1))>=5:
        emit('SOURCE_INPUT_VISIBLE',source.strip().replace('\n',' | ')); emit('END','P2_WHOLE_INPUT_FIVE_RODS_VISIBLE; protected retention/delivery NOT inferred');break
    if re.search(r'\b(?:blaze_rod|blaze_powder|ender_eye) x[1-9]',section):
        emit('END','USABLE_INPUT_IN_P1_STATUS; actual ordinary inventory adoption still requires next p1 caller');break
    m=re.search(r'health ([0-9.]+)/20',section)
    if not m or float(m.group(1))<16 or 'alive' not in section:
        emit('END','BODY_REQUIRES_IMMEDIATE_INSPECTION');break
    remaining=end-time.time()
    if remaining<=0: emit('END','BOUNDED_WINDOW_FINISHED since='+str(since));break
    time.sleep(min(interval,remaining))
