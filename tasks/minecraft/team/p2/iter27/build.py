"""Compose only named, permitted local helper files and syntax check before run."""
from pathlib import Path
import subprocess,sys
base=Path(__file__).resolve().parent
out=base/sys.argv[1]
sources=[base/x for x in sys.argv[2:]]
out.write_text('\n'.join(p.read_text() for p in sources))
subprocess.run(['node','-e','new (Object.getPrototypeOf(async function(){}).constructor)("bot","Movements","goals",require("fs").readFileSync(process.argv[1],"utf8"))',str(out)],check=True)
print('Syntax verified:',out)
