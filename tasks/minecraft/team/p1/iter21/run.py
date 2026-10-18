import pathlib,subprocess,sys,datetime
root=pathlib.Path.cwd();own=root/'tasks/minecraft/team/p1/iter21';p=pathlib.Path(sys.argv[1]);p=p if p.is_absolute() else own/p
if not p.is_relative_to(own) or p.suffix!='.js':raise SystemExit('own JS required')
r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(p)],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
pout=own/(p.stem+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out');pout.write_text(r.stdout);print(r.stdout);print('SAVED',pout.relative_to(root));raise SystemExit(r.returncode)
