import sys,pathlib,datetime,subprocess
p=pathlib.Path(__file__).resolve().parent
x,y,z=map(int,sys.argv[1:4]); cells=int(sys.argv[4]) if len(sys.argv)>4 else 30
if not 1<=cells<=30: raise SystemExit('cells 1..30')
s=(p/'tunnel20.js').read_text().replace('target=v(96,62,149)',f'target=v({x},{y},{z})').replace('floored().y!==62','floored().y!==target.y').replace('steps<20',f'steps<{cells}')
s=s.replace('for(let k=0;k<2;k++)for','for(let k=0;k<1;k++)for')
s=s.replace("Number(b.name.startsWith('stone_'))-Number(a.name.startsWith('stone_'))","Number(b.name.startsWith('stone_'))-Number(a.name.startsWith('stone_')) || (b.durabilityUsed||0)-(a.durabilityUsed||0)")
f=p/f'route_{x}_{y}_{z}_{datetime.datetime.now(datetime.timezone.utc):%H%M%S}.js';f.write_text(s)
sys.exit(subprocess.call([sys.executable,str(p/'op.py'),f.name,'60']))
