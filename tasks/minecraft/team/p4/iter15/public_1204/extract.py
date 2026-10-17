"""Public Mojang 1.20.4 client ONLY, in-memory archive; exact selected projectile classes."""
import urllib.request,json,hashlib,io,zipfile,pathlib
out=pathlib.Path(__file__).parent
provenance=json.loads(pathlib.Path('tasks/minecraft/team/p1/iter15/public_1204/version_provenance.json').read_text())
data={}
for kind in ['client_mappings','client']:
 d=provenance['downloads'][kind]
 blob=urllib.request.urlopen(d['url'],timeout=30).read()
 assert len(blob)==d['size'] and hashlib.sha1(blob).hexdigest()==d['sha1']
 data[kind]=blob
mapping=data['client_mappings'].decode();sections={};name=None
wanted={'net.minecraft.world.item.SnowballItem','net.minecraft.world.entity.projectile.Snowball','net.minecraft.world.entity.projectile.ThrowableProjectile','net.minecraft.world.entity.projectile.Projectile','net.minecraft.world.entity.boss.enderdragon.EndCrystal'}
for line in mapping.splitlines():
 if line and not line.startswith(' ') and not line.startswith('#'):
  name=line.split(' -> ')[0]
 if name in wanted:sections.setdefault(name,[]).append(line)
archive=zipfile.ZipFile(io.BytesIO(data['client']));selected={}
for name,lines in sections.items():
 obf=lines[0].split(' -> ')[1].rstrip(':');p=obf.replace('.','/')+'.class'
 (out/(obf+'.class')).write_bytes(archive.read(p));selected[name]=obf
(out/'projectile_mappings.txt').write_text('\n\n'.join('\n'.join(lines) for lines in sections.values()))
(out/'selected_classes.json').write_text(json.dumps(selected,indent=2));(out/'version_provenance.json').write_text(json.dumps(provenance,indent=2))
print(json.dumps({'publicExactVersion':'1.20.4','SHA1matched':True,'selected':selected,'fullArchiveRetained':False}))
