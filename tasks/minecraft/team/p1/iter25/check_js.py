import subprocess,sys
from pathlib import Path
for name in sys.argv[1:]:
 source=Path(name).read_text()
 r=subprocess.run(['node','--check','-'],input='async function playerProgram(bot,Movements,goals){\n'+source+'\n}\n',text=True,capture_output=True)
 print(name, 'SYNTAX_OK' if r.returncode==0 else r.stderr)
 if r.returncode:sys.exit(r.returncode)
