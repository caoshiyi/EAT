"""Bounded p4-only runner. Every next segment requires an observed accepted ending."""
import argparse,datetime,json,os,pathlib,re,subprocess,sys,time
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--segments',type=int,default=1);p.add_argument('--timeout',type=int,default=90);a=p.parse_args()
assert 1<=a.segments<=3 and 15<=a.timeout<=180
root=pathlib.Path(os.environ['EAT_ROOT']);b=root/'tasks/minecraft/team/p4';src=b/a.source
assert src.is_file() and src.parent==b
for n in range(a.segments):
 if time.time()+a.timeout+20>=int(os.environ['CR_DEADLINE']):sys.exit('STOP deadline reserve')
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');log=b/'iter6_logs'/f'{src.stem}_{stamp}.txt'
 h=root/'tasks/minecraft/team/P4.md';s=h.read_text();s=re.sub(r'(?m)^- ACTIVE.*$',f'- ACTIVE {a.source} p4 ONLY timeout{a.timeout}; batch{n+1}/{a.segments}. Await actual ending before next action.',s);h.write_text(s)
 r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p4','--timeout',str(a.timeout),str(src)],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=a.timeout+15);log.write_text(r.stdout)
 z=subprocess.run([sys.executable,str(b/'iter6_record.py'),str(log),a.source],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);print(z.stdout,flush=True)
 if r.returncode or z.returncode:sys.exit('STOP execution/record failure; inspect actual world')
 d=json.loads((b/'LATEST_TRAIL.json').read_text())
 if not(d.get('protectedEnd') and d.get('sealed') and not d.get('dead') and not d.get('lost') and not d.get('issue') and d.get('actualSteps',0)>0 and d['hp']>=17):sys.exit('STOP nonaccepted result; change test or fresh condition before more play')
