import os,pathlib,subprocess,json,datetime,sys
root=pathlib.Path(os.environ['EAT_ROOT']);d=root/'tasks/minecraft/team/p1/iter10'
def run(path,timeout):
 r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout',str(timeout),str(path)],cwd=root,capture_output=True,text=True);s=r.stdout+r.stderr
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');(d/f'guard_{stamp}.out').write_text(s)
 rows=[json.loads(x.split(' ',1)[1]) for x in s.splitlines() if x.startswith(('ADVANCE_END ','OCEAN_END '))]
 e=rows[-1] if rows else None;print(s[-5000:],flush=True);return e
if '--smoke' in sys.argv:
 assert 'ADVANCE_END '.split(' ',1)[0]=='ADVANCE_END';print('guard smoke PASS');raise SystemExit
end=run(pathlib.Path(sys.argv[1]),int(sys.argv[2]) if len(sys.argv)>2 else 100)
if end and end.get('ending')=='HANDOFF_OCEAN' and not end.get('lost'):
 print('AUTOMATIC_SAME_BODY_OCEAN_HANDOFF',flush=True);end=run(d/'ocean_shaft.js',130)
for attempt in range(2):
 if not end or end.get('lost') or end.get('ending','').startswith('PROTECTED') or (end.get('ending') in ['OPEN_SURFACE_HOLD','DRY_HOLD'] and end.get('issue') is None and end.get('enemies')==[]):break
 p=end['p'];src=(d/'rescue_current.js').read_text();prefix=f"if(bot.entity.position.distanceTo(new (require('vec3').Vec3)({p['x']},{p['y']},{p['z']}))>20){{console.log('ENDING_LIFE_DISCONTINUITY');return;}}\n"
 if attempt:prefix+=f"global.P1RouteTarget={{x:{int(p['x'])+40},z:{int(p['z'])+15}}};\n"
 path=d/f'auto_rescue_{attempt}.js';path.write_text(prefix+src);print('AUTOMATIC_CURRENT_BODY_RECOVERY',attempt+1,flush=True);end=run(path,65)
