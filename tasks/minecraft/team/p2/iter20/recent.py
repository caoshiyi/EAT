"""Fetch permitted arena records, preserve full raw text, print new records only.
Usage: python3 .../recent.py p1 4. No world actions, no server/files access.
"""
import pathlib, subprocess, sys, re
root = pathlib.Path('tasks/minecraft/team/p2/iter20')
player = sys.argv[1]
assert player in ('p1', 'p2', 'p4')
count = int(sys.argv[2]) if len(sys.argv) > 2 else 3
assert 1 <= count <= 10
r = subprocess.run([sys.executable, 'tools/mc_arena.py', 'programs', '--player', player, '--last', str(count), '--full'], capture_output=True, text=True, check=True)
parts = re.split(r'(?m)(?=^== #\d+ )', r.stdout)
for part in parts:
    m = re.match(r'== #(\d+) ', part)
    if not m: continue
    path = root / (player + '_program_' + m[1] + '.txt')
    if path.exists(): continue
    path.write_text(part)
    print(part if len(part) < 16000 else part[:11000] + '\n[DISPLAY SHORTENED; FULL RAW SAVED]\n' + part[-5000:])
