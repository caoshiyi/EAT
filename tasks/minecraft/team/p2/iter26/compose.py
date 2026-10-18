#!/usr/bin/env python3
"""Compose a current helper core with a small explicit Minecraft caller body.
Syntax checks an AsyncFunction without executing it; no network/world access.
"""
import pathlib, subprocess, sys
base=pathlib.Path(__file__).resolve().parent
if len(sys.argv)!=3:raise SystemExit('compose.py BODY.js OUTPUT.js')
body=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2])
source=(base/'core.js').read_text()+'\n// CALLER BODY: '+body.name+'\n'+body.read_text()
out.write_text(source)
checker='const fs=require("fs"); const A=Object.getPrototypeOf(async function(){}).constructor;new A("bot","Movements","goals",fs.readFileSync(process.argv[1],"utf8"));'
r=subprocess.run(['node','-e',checker,str(out)],text=True,capture_output=True)
if r.returncode:print(r.stderr);raise SystemExit(r.returncode)
print('SYNTAX_ONLY_OK',out,'bytes',len(source))
