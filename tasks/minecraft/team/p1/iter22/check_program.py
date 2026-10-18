#!/usr/bin/env python3
"""Parse (never execute) arena program bodies using the local JS parser."""
import argparse
import pathlib
import subprocess
import sys


def check(source):
    wrapper = '(async function(bot, Movements, goals, require, console) {\n' + source + '\n})\n'
    return subprocess.run(['node', '--check', '-'], input=wrapper, text=True, capture_output=True)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--self-test', action='store_true')
parser.add_argument('files', nargs='*', type=pathlib.Path)
args = parser.parse_args()
if args.self_test:
    positive = check('await bot.waitForTicks(1); return {ok:true};')
    negative = check('try { await bot.waitForTicks(1); catch(e) {}')
    ok = positive.returncode == 0 and negative.returncode != 0
    print(f'parser self-test: valid accepted={positive.returncode == 0}, malformed rejected={negative.returncode != 0}')
    if not ok:
        sys.exit(1)
team = pathlib.Path('tasks/minecraft/team').resolve()
failed = False
for path in args.files:
    resolved = path.resolve()
    if team not in resolved.parents:
        parser.error('only team-memory programs may be checked')
    result = check(resolved.read_text())
    print(f'{path}: {"PARSE_OK" if result.returncode == 0 else "PARSE_FAILED"}')
    if result.returncode:
        failed = True
        print(result.stderr, end='')
sys.exit(1 if failed else 0)
