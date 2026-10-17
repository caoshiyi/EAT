from pathlib import Path
p=Path('tasks/minecraft/team/p2')
s=(p/'iter9/to_farm_ack.js').read_text()
s=s.replace("'netherrack','basalt','blackstone','nether_bricks'].includes(bot.blockAt(v)?.name)","'netherrack','basalt','blackstone','nether_bricks','cobblestone','dirt','crafting_table','spruce_planks'].includes(bot.blockAt(v)?.name)")
s=s.replace("'stone_pickaxe'&&i.durabilityUsed<125","'stone_pickaxe'&&i.durabilityUsed<128")
s=s.replace("['netherrack','basalt','blackstone','nether_bricks','dirt','cobblestone'].map", "['netherrack','basalt','blackstone','nether_bricks','dirt','cobblestone','snow_block','spruce_planks'].map")
s=s.replace("['netherrack','basalt','nether_bricks','dirt'].includes(i.name)","['netherrack','basalt','nether_bricks','blackstone','dirt','cobblestone','snow_block','spruce_planks'].includes(i.name)")
s=s.replace("const pick=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!pick||pick.durabilityUsed>51)throw Error('PICK_RESERVE');", "if(!bot.inventory.items().some(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128))throw Error('PICK_RESERVE');")
s=s.replace('endIndex=path.length-1','endIndex=Math.min(path.length-1,startIndex+160)')
a=s.index("bot.chat('P2 checkpoint01:10"); b=s.index("console.log('FAST_STAGE_PLAN'",a)
s=s[:a]+"bot.chat('P2 retainedfarmroute finite160nodes/work55+ending40s; currentbody/native/stock/life guards. No sharedwriter beyond currentcell.');"+s[b:]
s=s.replace("async function ensure(q){if(native(q))return;", "async function ensure(q){nextPoint=q;if(native(q))return;")
a=s.index('function p2Threat(e)');b=s.index('async function fastSegment(',a)
s=s[:a]+'''
let nextPoint=bot.entity.position.floored();
function coveredReturn(e){const cur=bot.entity.position.floored(),skip=new Set([cur,nextPoint].flatMap(q=>[q.toString(),q.offset(0,1,0).toString()]));for(const q of[cur,nextPoint])for(const h of[.5,1.62])for(const eh of[.3,1,1.5]){const eye=q.offset(.5,h,.5),v=e.position.offset(0,eh,0).minus(eye),hit=bot.world.raycast(eye,v.unit(),v.norm(),(b,it)=>!skip.has(b.position.toString())&&full(b.position)&&!!it.intersect(b.shapes,b.position));if(!hit)return false}return true}
function p2Threat(e){if(!['blaze','ghast','piglin','piglin_brute','hoglin','wither_skeleton','magma_cube','skeleton'].includes(e.name)||(e.metadata?.[9]??1)<=0)return false;const r=['blaze','ghast','skeleton'].includes(e.name)||(e.name==='piglin'&&e.equipment?.[0]?.name==='crossbow')?18:7;const d=Math.min(e.position.distanceTo(bot.entity.position),e.position.distanceTo(nextPoint.offset(.5,0,.5)));if(d>=r)return false;return !coveredReturn(e)}
const materialNames=['netherrack','basalt','blackstone','nether_bricks','dirt','cobblestone','snow_block','spruce_planks'];
const stock=()=>bot.inventory.items().filter(i=>materialNames.includes(i.name)).reduce((n,i)=>n+i.count,0);
function podNeed(q){if(!full(q.offset(0,-1,0)))return 999;let n=0;for(const [x,z]of[[1,0],[-1,0],[0,1],[0,-1]]){const needWall=[0,1].some(y=>!full(q.offset(x,y,z)));if(needWall&&!full(q.offset(x,-1,z))){if(!['air','cave_air'].includes(bot.blockAt(q.offset(x,-1,z))?.name))return 999;n++}for(const y of[0,1]){const p=q.offset(x,y,z);if(!full(p)){if(!['air','cave_air'].includes(bot.blockAt(p)?.name))return 999;n++}}}const roof=q.offset(0,2,0);if(!full(roof)){if(!['air','cave_air'].includes(bot.blockAt(roof)?.name))return 999;n++;if(![[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].some(d=>full(roof.offset(...d))))n++}return n}

''' +s[b:]
s=s.replace("async function fastSegment(from,to){const q0=", "async function fastSegment(from,to){nextPoint=path[to];const q0=")
s=s.replace("const base=path[currentIndex],first=path[currentIndex+1],delta=first.minus(base);await ensure(first);", "const base=path[currentIndex],first=path[currentIndex+1],delta=first.minus(base);if(podNeed(first)>stock())throw Error('NEXT_CLOSURE_NEED_'+podNeed(first)+'_HELD_'+stock());await ensure(first);")
s=s.replace("if(!q.minus(prev).equals(delta)||!native(q))break;", "if(!q.minus(prev).equals(delta)||!native(q)||podNeed(q)>stock())break;")
s=s.replace("const exit=path[startIndex+1];await ensure(exit);", "const exit=path[startIndex+1];if(podNeed(exit)>stock()+2)throw Error('EXIT_CLOSURE_STOCK');await ensure(exit);")
# all persistent movement is deliberate; source program removed all own transient callbacks at end.
s=s.replace("bot.on('death',die);", "bot.on('death',die);const initialDimension=bot.game.dimension;const resp=()=>{lost=true;bot.clearControlStates()};bot.on('respawn',resp);")
s=s.replace("bot.removeListener('death',die);console.log", "bot.removeListener('death',die);bot.removeListener('respawn',resp);console.log")
s=s.replace("if(lost||bot.health<=0||bot.game.dimension!=='the_nether')", "if(lost||bot.health<=0||bot.game.dimension!==initialDimension||initialDimension!=='the_nether')")
# explicit cleanup at ending; never inherit a goal's late steering
s=s.replace("bot.clearControlStates();bot.removeListener('death',die)", "bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',die)")
# Permit retained fallback wood tool while preserving last four uses.
s=s.replace("const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128);", "const it=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128)||bot.inventory.items().find(i=>i.name==='wooden_pickaxe'&&i.durabilityUsed<55);")
s=s.replace("bot.heldItem?.name!=='stone_pickaxe'", "bot.heldItem?.name!==it.name")
s=s.replace("if(!bot.inventory.items().some(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<128))", "if(!bot.inventory.items().some(i=>(i.name==='stone_pickaxe'&&i.durabilityUsed<128)||(i.name==='wooden_pickaxe'&&i.durabilityUsed<55)))")
# The same per-cut source keeps hand/wood receipts honest for dirt/table caps.
a=s.index("const wear=bot.heldItem.durabilityUsed;await bot.dig(bot.blockAt(v));")
b=s.index("console.log('ROUTE_SERVER_DIG_ACK'",a)
s=s[:a]+"""const wear=bot.heldItem.durabilityUsed;let rawAck=false;const raw=p=>{if(p.location&&p.location.x===v.x&&p.location.y===v.y&&p.location.z===v.z&&p.type===0)rawAck=true};bot._client.on('block_change',raw);try{if(Date.now()-begin+bot.digTime(bot.blockAt(v))>55000)throw Error('CUT_WORK_RESERVE');await bot.dig(bot.blockAt(v));await t(10)}finally{bot._client.removeListener('block_change',raw)}if(!['air','cave_air'].includes(bot.blockAt(v)?.name)||(!rawAck&&bot.heldItem?.durabilityUsed<=wear))throw Error('NO_SERVER_DIG_RECEIPT_'+v);"""+s[b:]
s=s.replace("if(!full(base)){if(bot.blockAt(base)?.name!=='air')", "if(!full(base)&&[0,1].some(y=>!full(q.offset(x,y,z)))){if(bot.blockAt(base)?.name!=='air')")
(p/'iter10/stage.js').write_text(s)
# First physical surface segment: target existing roof stop23. It can retreat along the same23native cells to the starting room with recovered original two DIRT caps.
a=s
s=s.replace('endIndex=Math.min(path.length-1,startIndex+160)', 'endIndex=23')
s=s.replace("if(podNeed(exit)>stock()+2)throw Error('EXIT_CLOSURE_STOCK');", "if(startIndex!==0||podNeed(path[endIndex])>stock()+2)throw Error('END_CLOSURE_STOCK');")
s=s.replace("if(podNeed(first)>stock())throw Error('NEXT_CLOSURE_NEED_'+podNeed(first)+'_HELD_'+stock());", "")
s=s.replace("||podNeed(q)>stock()", "")
s=s.replace("await pod(q,currentIndex);closed=true;", "if(podNeed(q)<=stock()){await pod(q,currentIndex);closed=true}else{console.log('CHOSEN_REVERSE_TO_START',currentIndex,stock());for(let i=currentIndex-1;i>=startIndex;i--){nextPoint=path[i];await go(path[i])}await pod(path[startIndex],startIndex);currentIndex=startIndex;closed=true}")
(p/'iter10/first23.js').write_text(s)
s=a
(p/'iter10/stage.js').write_text(s)
print('built stage',len(s))
