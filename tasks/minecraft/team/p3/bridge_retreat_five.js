// Concatenate into arena programs. Schema-tested, not a combat or LOS guarantee.
// Preconditions: entities from bot.entities, origin current Vec3, radius finite >=0.
// Output: nearby classified hazards including neutral mobs that can block/attack.
function p3Threats(entities, origin, radius){
 if(!origin||!Number.isFinite(radius)||radius<0)throw Error('invalid threat scan input');
 const names=new Set(['magma_cube','slime','ghast','blaze','wither_skeleton','skeleton','stray','spider','cave_spider','zombie','zombie_villager','husk','drowned','creeper','enderman','piglin','piglin_brute','zombified_piglin','hoglin','zoglin','witch','phantom','silverfish','endermite','guardian','elder_guardian','shulker','ravager','vindicator','evoker','pillager','vex','warden']);
 return Object.values(entities).filter(e=>e?.position&&e.type!=='player'&&(e.type==='hostile'||String(e.kind||'').toLowerCase().includes('hostile')||names.has(e.name))).map(e=>({id:e.id,name:e.name,type:e.type,kind:e.kind,distance:Math.hypot(e.position.x-origin.x,e.position.y-origin.y,e.position.z-origin.z),position:{x:e.position.x,y:e.position.y,z:e.position.z}})).filter(e=>e.distance<=radius).sort((a,b)=>a.distance-b.distance);
}
// Read-only factory. Apply only after live landing-hostile preflight.
// Synthetic getMoveForward test #1041 proved blocksToAvoid(magma) alone DOES NOT reject a magma FLOOR.
// This helper has not yet been physically validated in the Nether.
function netherSafeMovements(bot,Movements){
 const {Vec3}=require('vec3');const m=new Movements(bot);
 m.canDig=false;m.allowParkour=false;m.allow1by1towers=false;m.scafoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
 for(const n of['fire','soul_fire','lava','magma_block'])if(bot.registry.blocksByName[n])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
 // Cardinal paths avoid diagonal corner clipping; still require actual position/health checks.
 m.getMoveDiagonal=()=>{};
 const old=m.getNeighbors.bind(m),hot=new Set(['fire','soul_fire','lava','magma_block']);
 m.getNeighbors=node=>old(node).filter(n=>{const q=new Vec3(n.x,n.y,n.z),f=bot.blockAt(q.offset(0,-1,0)),feet=bot.blockAt(q),head=bot.blockAt(q.offset(0,1,0));return f&&feet&&head&&!hot.has(f.name)&&!hot.has(feet.name)&&!hot.has(head.name)});
 return m;
}

const{Vec3}=require('vec3');let lost=false;const abort=()=>{lost=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',abort);bot.on('respawn',abort);const alive=()=>{if(lost||bot.health<1||bot.game.dimension!=='the_nether')throw Error('bodylost');};const m=netherSafeMovements(bot,Movements);m.allowSprinting=false;bot.pathfinder.setMovements(m);try{alive();console.log('START',bot.entity.position.toString(),bot.health);for(const a of[[-13,65,-22],[-12,65,-22],[-12,65,-21],[-11,65,-21],[-11,65,-20]]){alive();const q=new Vec3(...a),hot=['lava','fire','soul_fire','magma_block','nether_portal'];const bs=[bot.blockAt(q.offset(0,-1,0)),bot.blockAt(q),bot.blockAt(q.offset(0,1,0))];if(bs[0]?.boundingBox!=='block'||bs[1]?.boundingBox!=='empty'||bs[2]?.boundingBox!=='empty'||bs.some(b=>hot.includes(b?.name)))throw Error('terrainchanged');for(const e of p3Threats(bot.entities,bot.entity.position,8)){const targetDistance=Math.hypot(e.position.x-q.x-.5,e.position.y-q.y,e.position.z-q.z-.5);if(targetDistance<e.distance+.15)throw Error('not retreating fromhazard');}let timer;try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(...a)),new Promise((_,r)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('retreatbound'));},3000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}await bot.waitForTicks(6);alive();if(!bot.entity.onGround)throw Error('notsettled');console.log('AWAY_STEP',a,bot.entity.position.toString(),bot.health);}console.log('THREAT_ACTUAL',Object.values(bot.entities).filter(e=>e.name==='magma_cube'&&e.position.distanceTo(bot.entity.position)<20).map(e=>({id:e.id,p:e.position,height:e.height,width:e.width,hp:e.metadata?.[9],metadata:e.metadata})));}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',abort);bot.removeListener('respawn',abort);}
