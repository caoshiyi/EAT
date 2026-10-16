"""Compile an owned arena script before running it only as p1; retain exact arena output."""
import argparse
from pathlib import Path
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('program', type=Path)
parser.add_argument('--timeout', type=int, default=60)
parser.add_argument('--log', type=Path, required=True)
args = parser.parse_args()
owned = (Path.cwd() / 'tasks/minecraft/team/p1').resolve()
program, log = args.program.resolve(), args.log.resolve()
if not program.is_relative_to(owned) or not log.is_relative_to(owned):
    parser.error('program and log must be inside team/p1')
compile_js = "const fs=require('fs'),A=Object.getPrototypeOf(async function(){}).constructor;new A('bot','Movements','goals',fs.readFileSync(process.argv[1],'utf8'));"
compiled = subprocess.run(['node', '-e', compile_js, str(program)], capture_output=True, text=True)
if compiled.returncode:
    print('COMPILE_FAILED; arena was not invoked\n' + compiled.stderr)
    sys.exit(2)
print('COMPILE_OK ' + program.name, flush=True)
with log.open('w') as output:
    run = subprocess.run(['python3', 'tools/mc_arena.py', 'run', '--player', 'p1', '--timeout', str(args.timeout), str(program)], stdout=output, stderr=subprocess.STDOUT)
lines = log.read_text().splitlines()
if lines:
    print(lines[0])
    print('\n'.join(lines[-60:]))
print('ARENA_RC', run.returncode, 'EXACT_LOG', log)
sys.exit(run.returncode)
