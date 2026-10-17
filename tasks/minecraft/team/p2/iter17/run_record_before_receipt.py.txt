#!/usr/bin/env python3
"""Run only p2 programs; preserve complete output and print concise postconditions."""
import argparse, datetime, os, pathlib, re, subprocess, sys
root=pathlib.Path(os.environ['EAT_ROOT'])
here=root/'tasks/minecraft/team/p2'
p=argparse.ArgumentParser();p.add_argument('program',nargs='?');p.add_argument('--timeout',type=int,default=90);p.add_argument('--observe',action='store_true');a=p.parse_args()
if a.observe:
    cmd=['python3','tools/mc_arena.py','status']
else:
    if not a.program:p.error('program required unless --observe')
    candidate=(root/a.program).resolve()
    if not candidate.is_relative_to(here.resolve()) or not candidate.is_file():p.error('program must be an existing p2 file')
    cmd=['python3','tools/mc_arena.py','run','--player','p2','--timeout',str(a.timeout),str(candidate)]
r=subprocess.run(cmd,cwd=root,capture_output=True,text=True)
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
(here/'raw').mkdir(exist_ok=True)
path=here/'raw'/f'{stamp}.txt';path.write_text(r.stdout+('\nSTDERR:\n'+r.stderr if r.stderr else ''))
(here/'LATEST_ARENA.txt').write_text(f'UTC {stamp}\ncommand {cmd}\nreturncode {r.returncode}\nraw {path.relative_to(root)}\n'+r.stdout+('\nSTDERR:\n'+r.stderr if r.stderr else ''))
print(f'FULL_RECORD {path.relative_to(root)} RETURN_CODE {r.returncode}')
if a.observe:
    lines=r.stdout.splitlines();i=next((i for i,s in enumerate(lines) if s.startswith('p2:')),None)
    print('\n'.join(lines[i:i+2]) if i is not None else r.stdout)
else:
    keys=re.compile(r'^(program #|VERTICAL_START|VERTICAL_ISSUE|VERTICAL_FINAL|CAVE_START|CAVE_ISSUE|CAVE_FINAL|RECOVERY_FAIL|OLD_ROOM_RESEALED|WINDOW_|FIGHT_|PEARL_|TARGET_|CRAFT_|TWO_PICKS_|--- p2 now:|.*Error:|.*FAIL)')
    selected=[s for s in r.stdout.splitlines() if keys.search(s)]
    if len(r.stdout)<=6000:
        print(r.stdout.rstrip())
    else:
        print('\n'.join(selected))
        print('FULL_POSTCONDITION_TAIL\n'+r.stdout[-3500:])
if r.stderr:print(r.stderr,file=sys.stderr)
sys.exit(r.returncode)
