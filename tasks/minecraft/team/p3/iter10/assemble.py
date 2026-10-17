"""Assemble one owned arena artifact; syntax-check before it may be played."""
import argparse,hashlib,pathlib,subprocess,sys
p=argparse.ArgumentParser();p.add_argument('body');p.add_argument('output');p.add_argument('--prefix',default='prefix.js');a=p.parse_args()
base=pathlib.Path(__file__).resolve().parent
paths=[(base/x).resolve() for x in [a.body,a.output]]
if any(not x.is_relative_to(base) for x in paths):sys.exit('owned iter10 paths only')
prefix=(base/a.prefix).resolve();body,out=paths
if not prefix.is_relative_to(base):sys.exit('prefix owned paths only')
if out in [prefix,body]:sys.exit('output cannot overwrite inputs')
source=prefix.read_text()+'\n'+body.read_text();out.write_text(source)
r=subprocess.run(['node',str(base.parent/'check_program.cjs'),str(out)],text=True,capture_output=True)
print(r.stdout+r.stderr,end='')
if r.returncode:out.unlink();sys.exit(r.returncode)
print('EXACT_ARTIFACT',out.name,'sha256',hashlib.sha256(source.encode()).hexdigest())
