import urllib.request,hashlib,json,io,zipfile,pathlib,concurrent.futures,re,subprocess,datetime
root=pathlib.Path('tasks/minecraft/team/p3/iter15/public_1204');root.mkdir(exist_ok=True)
p=json.loads(pathlib.Path('tasks/minecraft/team/p1/iter15/public_1204/version_provenance.json').read_text())
def get(k):
 d=p['downloads'][k]; b=urllib.request.urlopen(d['url'],timeout=40).read();assert hashlib.sha1(b).hexdigest()==d['sha1'];return b
with concurrent.futures.ThreadPoolExecutor() as ex:
 a=ex.submit(get,'client');b=ex.submit(get,'client_mappings');jar,maps=a.result(),b.result().decode()
need={'net.minecraft.world.entity.LivingEntity','net.minecraft.server.level.ServerPlayer','net.minecraft.server.network.ServerGamePacketListenerImpl','net.minecraft.server.level.ServerPlayerGameMode','net.minecraft.world.entity.player.Player','net.minecraft.world.entity.projectile.Fireball','net.minecraft.world.entity.projectile.ProjectileUtil','net.minecraft.world.entity.projectile.AbstractHurtingProjectile','net.minecraft.world.entity.projectile.SmallFireball','net.minecraft.world.level.block.FenceGateBlock','net.minecraft.world.level.ClipContext','net.minecraft.world.level.ClipContext$Block','net.minecraft.world.entity.monster.Blaze$BlazeAttackGoal'}
sections=[]
for section in re.split(r'(?m)(?=^[^ #\t].+ -> .+:$)',maps):
 h=section.splitlines()[0] if section else ''
 name=h.split(' -> ')[0]
 if name in need:
  obf=h.split(' -> ')[1][:-1];sections.append((name,obf));(root/(obf+'.class')).write_bytes(zipfile.ZipFile(io.BytesIO(jar)).read(obf+'.class'));(root/(obf+'_bytecode.txt')).write_text(subprocess.check_output(['javap','-c','-p',str(root/(obf+'.class'))],text=True));(root/(obf+'_mapping.txt')).write_text(section)
(root/'provenance.json').write_text(json.dumps({'observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'official':p,'selected':sections},indent=2));print(json.dumps(sections))
