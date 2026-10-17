import json,sys,pathlib
for arg in sys.argv[1:]:
 p=pathlib.Path(arg);s=p.read_text();print(p.name)
 try:
  pre,rest=s.split('--- returned ---\n',1); v,tail=rest.split('\n--- ',1);d=json.loads(v)
  print(pre[-5000:]);print(json.dumps(d,separators=(',',':')));print('--- '+tail)
 except Exception as e:print(s[-5000:])
