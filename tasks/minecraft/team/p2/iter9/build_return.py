from pathlib import Path
import json,re
p2=Path('tasks/minecraft/team/p2')
route=[[-140,60,-430]]+list(reversed(json.loads((p2/'iter9/route_to_farm.json').read_text())['path']))
s=(p2/'iter9/to_farm_ack.js').read_text()
s,n=re.subn(r'path=\[.*?\]\.map\(a=>new Vec3\(\.\.\.a\)\)','path='+json.dumps(route,separators=(',',':'))+'.map(a=>new Vec3(...a))',s,count=1)
assert n==1
s=s.replace('endIndex=path.length-1','endIndex=Math.min(path.length-1,startIndex+200,startIndex<576?576:startIndex<676?676:path.length-1)')
s=s.replace('Date.now()-begin>55000','Date.now()-begin>65000')
s=s.replace("const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<125);","const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<129)||bot.inventory.items().find(i=>i.name==='wooden_pickaxe'&&i.durabilityUsed<57);")
s=s.replace("bot.heldItem?.name!=='stone_pickaxe'","bot.heldItem?.name!==it.name")
s=s.replace("const pick=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!pick||pick.durabilityUsed>51)throw Error('PICK_RESERVE');","if(!bot.inventory.items().some(i=>(i.name==='stone_pickaxe'&&i.durabilityUsed<129)||(i.name==='wooden_pickaxe'&&i.durabilityUsed<57)))throw Error('PICK_RESERVE');")
s=s.replace("async function ensure(q){if(native(q))return;","async function ensure(q){nextPoint=q;if(native(q))return;")
s=s.replace("for(const v of cells)if(!['air','cave_air'].includes(bot.blockAt(v)?.name)){","for(const v of cells)if(!['air','cave_air'].includes(bot.blockAt(v)?.name)){if([-221,-121].includes(v.x)&&v.z===-180&&[63,64].includes(v.y))throw Error('PRESERVE_P1_221');")
a=s.index('function p2Threat(e)');b=s.index('async function fastSegment(',a)
s=s[:a]+"""
let nextPoint=bot.entity.position.floored();
function coveredReturn(e){const cur=bot.entity.position.floored(),skip=new Set([cur,nextPoint].flatMap(q=>[q.toString(),q.offset(0,1,0).toString()]));for(const q of[cur,nextPoint])for(const h of[.5,1.62])for(const eh of[.3,1,1.5]){const eye=q.offset(.5,h,.5),v=e.position.offset(0,eh,0).minus(eye),hit=bot.world.raycast(eye,v.unit(),v.norm(),(b,it)=>!skip.has(b.position.toString())&&full(b.position)&&!!it.intersect(b.shapes,b.position));if(!hit)return false}return true}
function p2Threat(e){if(!['blaze','ghast','piglin','piglin_brute','hoglin','wither_skeleton','magma_cube','skeleton'].includes(e.name)||(e.metadata?.[9]??1)<=0)return false;const r=['blaze','ghast','skeleton'].includes(e.name)||(e.name==='piglin'&&e.equipment?.[0]?.name==='crossbow')?18:7;const d=Math.min(e.position.distanceTo(bot.entity.position),e.position.distanceTo(nextPoint.offset(.5,0,.5)));if(d>=r)return false;return !coveredReturn(e)}
""" +s[b:]
s=s.replace("async function fastSegment(from,to){const q0=","async function fastSegment(from,to){nextPoint=path[to];const q0=")
s=s.replace("surface:[q.x,q.y,q.z],index};","surface:[q.x,q.y,q.z],index,route:'RETURN_CHEST'};")
s=s.replace("state.kind!=='SURFACE_POD'||bot.health","state.kind!=='SURFACE_POD'||state.route!=='RETURN_CHEST'||bot.health")
a=s.index("bot.chat('P2 checkpoint01:10");b=s.index("console.log('FAST_STAGE_PLAN'",a)
s=s[:a]+s[b:]
s=s[:s.index("console.log('FORTRESS_SOURCE_LOADED")]+"\nconsole.log('RETURN_KIT',JSON.stringify(bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])));\n"
s=s.replace('const exit=path[startIndex+1];',(p2/'iter9/return_headroom396.inc.js').read_text()+'const exit=path[startIndex+1];',1)
(p2/'iter9/return_stage.js').write_text(s)
(p2/'iter9/return_route.json').write_text(json.dumps({'path':route,'note':'Start14060 reversedknownroute. Pause576(-22263-180), preserveP1old221; physicalbypassresume580(-21863-180). Secondpause676(-12263-180), preserveold121; physicalbypassresume680(-11863-180).'},separators=(',',':')))
print('RETURN_ROUTE',len(route),'P1_PAUSE',route[576],'RESUME',route[580])
