#!/usr/bin/env python3
"""P4-only arena run + one explicitly chosen immediate recovery on failed ending.
No server access. Reports are triggers, not proof of world safety or life continuity.
"""
import argparse, json, os, pathlib, subprocess, sys, time
ROOT = pathlib.Path(os.environ['EAT_ROOT']).resolve()
OWN = ROOT / 'tasks/minecraft/team/p4'
def owned(value):
    path = pathlib.Path(value)
    if not path.is_absolute(): path = ROOT / path
    path = path.resolve()
    if not path.is_relative_to(OWN) or not path.is_file(): raise ValueError('P4 existing source required')
    return path

def returned(output):
    marker = '--- returned ---\n'
    if marker not in output: return None
    data = output.split(marker, 1)[1].lstrip()
    try: return json.JSONDecoder().raw_decode(data)[0]
    except (ValueError, json.JSONDecodeError): return None

def run(source, timeout, log):
    command = [sys.executable, 'tools/mc_arena.py', 'run', '--player', 'p4', '--timeout', str(timeout), str(source)]
    before = time.time()
    result = subprocess.run(command, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    with open(log, 'a') as handle: handle.write(result.stdout)
    print(result.stdout, end='', flush=True)
    return result, returned(result.stdout), time.time() - before

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--fallback', required=True)
    parser.add_argument('--timeout', type=int, default=60)
    parser.add_argument('--fallback-timeout', type=int, default=30)
    parser.add_argument('--log', required=True)
    args = parser.parse_args()
    source, fallback = owned(args.source), owned(args.fallback)
    log = pathlib.Path(args.log).resolve()
    if not log.is_relative_to(OWN): raise ValueError('P4-owned log required')
    primary, data, elapsed = run(source, args.timeout, log)
    failed = primary.returncode != 0 or isinstance(data, dict) and data.get('protectedEnd') is False
    print('GUARD_PRIMARY', json.dumps({'elapsed':elapsed,'reportedFailedEnding':failed,'returned':data}), flush=True)
    if not failed: return
    # Avoid overlapping a still-active primary after a transport error.
    status = subprocess.run([sys.executable,'tools/mc_arena.py','status'],cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT).stdout
    p4line = next((line for line in status.splitlines() if line.startswith('p4:')), '')
    if not p4line or 'running program' in p4line:
        print('GUARD_UNRESOLVED primary completion unknown; no overlapping recovery: '+p4line, flush=True)
        return
    print('GUARD_FALLBACK immediate ONE owner-chosen attempt; fresh-body dispatch must be in source', flush=True)
    repair, final, seconds = run(fallback, args.fallback_timeout, log)
    verified = repair.returncode == 0 and isinstance(final,dict) and final.get('protectedEnd') is True
    print('GUARD_FINAL',json.dumps({'reportedProtected':verified,'fallbackSeconds':seconds,'returned':final,'limitation':'check body/life/world; a returned flag is not independent proof'}),flush=True)
    if not verified: print('GUARD_UNRESOLVED owner must inspect actual ending promptly',flush=True)
if __name__ == '__main__': main()
