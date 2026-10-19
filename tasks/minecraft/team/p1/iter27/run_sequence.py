"""P1-only serial arena runs, confirmed closure, prompt token release; no outcome claims.

Use only after an explicit peer token grant. First use must be a small readonly smoke.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--grant', required=True, help='Actual peer grant receipt, recorded without inference')
parser.add_argument('--label', required=True)
parser.add_argument('--sandbox', action='store_true')
parser.add_argument('--timeout', type=int, default=15)
parser.add_argument('files', nargs='+')
args = parser.parse_args()
root = Path(__file__).resolve().parent
if not args.label.replace('_', '').replace('-', '').isalnum():
    raise SystemExit('Use a simple label')
arena = [sys.executable, 'tools/mc_arena.py']
ledger = {'grant': args.grant, 'start': datetime.now(timezone.utc).isoformat(), 'runs': []}


def idle(stage):
    receipts = []
    for sandbox in (False, True):
        result = subprocess.run(arena + (['--sandbox'] if sandbox else []) + ['status'], capture_output=True, text=True)
        receipts.append({'sandbox': sandbox, 'returncode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr})
        if result.returncode or 'running program #' in result.stdout:
            ledger[stage] = receipts
            raise RuntimeError('Global idle not confirmed; no new run/chat allowed')
    ledger[stage] = receipts


try:
    idle('before')
    for index, name in enumerate(args.files):
        if index:
            idle(f'between_{index}')
        result = subprocess.run(arena + (['--sandbox'] if args.sandbox else []) +
                                ['run', '--player', 'p1', '--timeout', str(args.timeout), name],
                                capture_output=True, text=True)
        path = root / f'{args.label}_{index + 1}.out'
        path.write_text(result.stdout + result.stderr)
        ledger['runs'].append({'file': name, 'returncode': result.returncode, 'raw': str(path),
                               'header': result.stdout.splitlines()[:1]})
        print(json.dumps(ledger['runs'][-1]), flush=True)
        if result.returncode:
            break  # Preserve exact error. Ownership refusals need one ordinary owner retry, never a bypass.
    idle('after')
    # This says only what the wrapper checked. Human/model still reviews actual outcome/postconditions.
    message = f'P1 sequence {args.label} arena calls ended; both world statuses confirm no running program. Shared RUN TOKEN RELEASED to P2/P4. Raw outputs saved p1/iter27; outcome pending actual review. No new P1 run queued.'
    release = subprocess.run(arena + ['say', '--player', 'p1', message], capture_output=True, text=True)
    (root / f'{args.label}_release.out').write_text(release.stdout + release.stderr)
    ledger['release_returncode'] = release.returncode
    print(release.stdout + release.stderr, flush=True)
except Exception as error:
    ledger['error'] = str(error)
    print('NO_AUTOMATIC_RELEASE', str(error), flush=True)
finally:
    ledger['end'] = datetime.now(timezone.utc).isoformat()
    (root / f'{args.label}_sequence.json').write_text(json.dumps(ledger, indent=2) + '\n')
