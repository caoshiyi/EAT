"""Capture authorized read-only arena evidence. Never calls run/say or accesses server paths."""
import argparse, datetime, json, pathlib, re, subprocess
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('label')
p.add_argument('--last', type=int, default=12)
p.add_argument('--eval', action='store_true')
a = p.parse_args()
if not re.fullmatch(r'[A-Za-z0-9_-]+', a.label) or not 1 <= a.last <= 200:
    p.error('label must be simple; last must be 1..200')
root = pathlib.Path(__file__).resolve().parents[5]
owned = pathlib.Path(__file__).resolve().parent / 'captures' / a.label
owned.mkdir(parents=True, exist_ok=False)
commands = [('status', ['tools/mc_arena.py', 'status']),
            ('events', ['tools/mc_arena.py', 'events', '--last', str(a.last)]),
            ('chat', ['tools/mc_arena.py', 'chat', '--last', str(a.last)]),
            ('programs', ['tools/mc_arena.py', 'programs', '--last', str(a.last), '--full'])]
if a.eval:
    commands.append(('eval', ['tools/eval_minecraft.py']))
meta = {'capture_start': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'commands': []}
for name, args in commands:
    item = {'name': name, 'started': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        r = subprocess.run(['python3', *args], cwd=root, capture_output=True, text=True, timeout=30)
        output = r.stdout + ('\nSTDERR:\n' + r.stderr if r.stderr else '')
        item['returncode'] = r.returncode
    except subprocess.TimeoutExpired as e:
        def decode(x): return x.decode(errors='replace') if isinstance(x, bytes) else (x or '')
        output = decode(e.stdout) + decode(e.stderr)
        item['error'] = 'capture timed out at 30s; result incomplete'
    (owned / (name + '.txt')).write_text(output)
    item['finished'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if name == 'programs': item['ids'] = re.findall(r'^== #(\d+)', output, re.M)
    if name == 'eval': item['save_failed'] = 'save-all failed' in output
    meta['commands'].append(item)
    print(json.dumps(item), flush=True)
meta['capture_end'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
(owned / 'meta.json').write_text(json.dumps(meta, indent=2) + '\n')
print(owned)
