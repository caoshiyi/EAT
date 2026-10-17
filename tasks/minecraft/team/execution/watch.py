"""Read-only bounded watcher for executed arena records. Never runs player code."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
from datetime import datetime, timezone

ROOT = Path(os.environ['EAT_ROOT']).resolve()
OUT = ROOT / 'tasks/minecraft/team/execution'
STATE = OUT / 'watch_state.json'

def summarize_return(raw):
    try:
        value = json.loads(raw)
    except (ValueError, TypeError):
        return raw[:1200]
    if not isinstance(value, dict):
        return value
    keys = ['p','actual','dimension','dim','hp','health','food','issue','error','phase',
            'full','closed','protected','protectedEnd','safe','floating','air','buried','recovered','lost','dead','died',
            'discontinuity','elapsed','ending','recoveryIssue','workIssue','qualified','entityId','caller','bodyInside','wetHead','wetAir','doorAir','wetReceipt','doorReceipt','selfAirPackets','otherAirPackets','delta','logDelta','retainedLogs','pearl','rod',
            'received','transition','gateClosed','ground','onGround','controls',
            'physicsListeners','deathListeners','selfAir','water','grounded',
            'target','aims','swings','hits','killed','pearlDelta','opened','platform','overhang','doors']
    brief = {k:value[k] for k in keys if k in value}
    for k in ['walked','path','steps','faces','enders','mobs','items','resources']:
        if k in value:
            brief[k+'_count'] = len(value[k]) if isinstance(value[k],list) else value[k]
    for k in ['inv','inventory']:
        if k in value and isinstance(value[k],list):
            items={}
            for entry in value[k]:
                if isinstance(entry,list) and len(entry)>=2:
                    items[entry[0]]=items.get(entry[0],0)+entry[1]
            brief['stock']=items
    return brief if brief else {'keys':list(value)}

def summarize_output(raw, kind):
    if kind == 'error':
        errors=[line for line in raw.splitlines() if re.match(r'^\w*Error:',line)]
        return errors[-1:] or [raw[-500:]]
    endings=[]
    issues=[]
    for line in raw.splitlines():
        if re.search(r'ISSUE|FAIL|HURT|TIMED OUT|RECEIPT|CONTROLLED_ABORT',line):
            issues.append(line[:250])
        if re.match(r'^[A-Z0-9_]*(?:END|END9|ACTUAL|STATE|OBSERVATION) ',line):
            opening=line.find('{')
            if opening>=0:
                try:
                    endings.append(summarize_return(line[opening:]))
                except Exception:
                    pass
    return {'issues':issues[-5:], 'endings':endings[-1:]} if issues or endings else raw.strip()[-180:]

def ending_alert(record):
    """Only actual JSON ending records; final outcome overrides earlier attempts."""
    parts = re.split(r'^-- (output|returned|error) --\s*$', record, flags=re.M)
    states = []
    for i in range(1, len(parts), 2):
        kind, raw = parts[i], parts[i+1].strip()
        candidates = [raw] if kind == 'returned' else [
            line[line.find('{'):] for line in raw.splitlines()
            if re.match(r'^[A-Z0-9_]*(?:END|END9|ACTUAL|STATE|OBSERVATION) ', line) and '{' in line
        ]
        for candidate in candidates:
            try:
                value = json.loads(candidate)
            except ValueError:
                continue
            if isinstance(value, dict) and ('p' in value or 'actual' in value):
                states.append(value)
    if not states:
        return None
    final = states[-1]
    health = final.get('hp', final.get('health', 0))
    exposed = any(final.get(k) is False for k in ('protected','protectedEnd','full','closed')) or final.get('ending') == 'UNRESOLVED'
    if final.get('lost') or final.get('dead') or final.get('died') or not isinstance(health, (int, float)) or isinstance(health, bool) or health <= 0:
        return None
    reported_failure = final.get('issue') or final.get('error') or final.get('floating') or final.get('recoveryIssue') or re.search(r'(?m)^(?:RECOVERY_ISSUE|RETURN_FAILED|ENDING_FAILED)\b', record)
    if not (exposed and reported_failure):
        return None
    alert = dict(summarize_return(json.dumps(final)))
    # Preserve explicit self-air observation immediately preceding final state.
    if 'selfAir' not in alert:
        for value in reversed(states):
            if 'selfAir' in value:
                alert['preceding_selfAir'] = value['selfAir']
                break
    return alert

def scan(last):
    # Fixed command vocabulary intentionally excludes run/say/status/evaluator.
    r = subprocess.run(['python3', 'tools/mc_arena.py', 'programs', '--last', str(last), '--full'],
                       cwd=ROOT, capture_output=True, text=True, timeout=15)
    if r.returncode:
        raise RuntimeError(r.stderr or r.stdout)
    before = json.loads(STATE.read_text()) if STATE.exists() else {}
    after = dict(before)
    changed = []
    for record in re.split(r'(?=^== #\d+ )', r.stdout, flags=re.M):
        m = re.match(r'== #(\d+) ([^\n]+)', record)
        if not m:
            continue
        key = m[1]
        digest = hashlib.sha256(record.encode()).hexdigest()
        if before.get(key) == digest:
            continue
        after[key] = digest
        (OUT / 'records').mkdir(exist_ok=True)
        (OUT / 'records' / f'{key}.txt').write_text(record)
        alert = ending_alert(record)
        if alert:
            receipt = {'observed_at':datetime.now(timezone.utc).isoformat(),
                       'program':int(key), 'header':m[2], 'ending':alert,
                       'limit':'Reported past ending only; flags may be stale or initialized. May be superseded; owner checks current world.'}
            with (OUT / 'ENDING_ALERTS.jsonl').open('a') as stream:
                stream.write(json.dumps(receipt)+'\n')
        parts = re.split(r'^-- (output|returned|error) --\s*$', record, flags=re.M)
        observations = []
        for i in range(1, len(parts), 2):
            observations.append({'kind':parts[i], 'data':summarize_return(parts[i+1].strip()) if parts[i]=='returned' else summarize_output(parts[i+1].strip(),parts[i])})
        changed.append({'id': int(key), 'header': m[2], 'observations': observations})
    STATE.write_text(json.dumps(after, sort_keys=True))
    return changed

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, default=0)
    ap.add_argument('--last', type=int, default=16)
    ap.add_argument('--until-run-deadline', action='store_true')
    args = ap.parse_args()
    duration = min(max(args.seconds, 0), 55)
    if args.until_run_deadline:
        duration = max(0, int(os.environ['CR_DEADLINE'])-time.time())
    until = time.monotonic() + duration
    while True:
        try:
            data = scan(args.last)
            if data or until-time.monotonic() <= 0:
                print(json.dumps({'time':datetime.now(timezone.utc).isoformat(), 'changes':data}), flush=True)
        except Exception as exc:
            print(json.dumps({'error':str(exc)}), flush=True)
            raise
        remaining = until-time.monotonic()
        if remaining <= 0:
            break
        time.sleep(min(15, remaining))
