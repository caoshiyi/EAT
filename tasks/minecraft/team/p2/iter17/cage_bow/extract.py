"""Exact public Mojang1.20.4 common classes; no server access; full archive in memory only."""
import pathlib,json,hashlib,urllib.request,io,zipfile,subprocess,concurrent.futures
out=pathlib.Path(__file__).parent
wanted={"net.minecraft.world.level.block.IronBarsBlock","net.minecraft.world.level.block.CrossCollisionBlock"}
def sections(text,names):
 result={};name=None
 for line in text.splitlines():
  if line and not line.startswith((' ','#')):name=line.split(' -> ')[0]
  if name in names:result.setdefault(name,[]).append(line)
 return result
assert sections('foo -> a:\n    int x -> a\nbar -> b:\n',{'foo'})=={'foo':['foo -> a:','    int x -> a']}
p=json.loads(pathlib.Path('tasks/minecraft/team/p4/iter15/public_1204/version_provenance.json').read_text())
def get(kind):
 d=p['downloads'][kind];b=urllib.request.urlopen(d['url'],timeout=25).read();assert len(b)==d['size'] and hashlib.sha1(b).hexdigest()==d['sha1'];return kind,b
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex: blobs=dict(ex.map(get,['client_mappings','client']))
ss=sections(blobs['client_mappings'].decode(),wanted);assert set(ss)==wanted
z=zipfile.ZipFile(io.BytesIO(blobs['client']));selected={}
for name,lines in ss.items():
 obf=lines[0].split(' -> ')[1].rstrip(':');target=out/(obf+'.class');target.write_bytes(z.read(obf.replace('.','/')+'.class'));selected[name]=obf
 (out/(name.rsplit('.',1)[1]+'_mapping.txt')).write_text('\n'.join(lines)+'\n')
 r=subprocess.run(['javap','-c','-p',str(target)],capture_output=True,text=True,check=True);(out/(name.rsplit('.',1)[1]+'_bytecode.txt')).write_text(r.stdout)
(out/'provenance.json').write_text(json.dumps(p,indent=2)+'\n');(out/'selected.json').write_text(json.dumps(selected,indent=2)+'\n');print(json.dumps({'mapping_parser_smoke':'PASS','public_version':'1.20.4','SHA1matched':True,'selected':selected,'full_archive_retained':False}))
