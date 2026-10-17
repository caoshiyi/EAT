import pathlib,subprocess,sys
for name in sys.argv[1:]:
 s=pathlib.Path(name).read_text()
 r=subprocess.run(['node','--check'],input='async function arena(bot) {\n'+s+'\n}\n',text=True,capture_output=True)
 print(name, 'SYNTAX_PASS' if r.returncode==0 else r.stderr)
 if r.returncode: sys.exit(r.returncode)
