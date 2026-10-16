const {Vec3}=require('vec3');
let discontinuity=false,retreating=false;const stopBody=()=>{discontinuity=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};
bot.on('death',stopBody);bot.on('respawn',stopBody);
function check(){if(discontinuity||bot.health<(retreating?1:12)||bot.game.dimension!=='overworld')throw Error('unsafe/discontinuous body');}
async function go(x,y,z,r=.8,ms=4500){check();const m=new Movements(bot);m.canDig=false;m.allowParkour=false;m.allow1by1towers=false;m.scafoldingBlocks=[];m.maxDropDown=2;for(const n of['water','lava'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;const goal=new goals.GoalNear(x,y,z,r);let timer;try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('nav bound'));},ms))]);}catch(e){throw Error('nav '+[x,y,z]+' actual '+bot.entity.position+' : '+e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}await bot.waitForTicks(6);check();if(!goal.isEnd(bot.entity.position.floored()))throw Error('not arrived '+[x,y,z]);}
async function door(mode){check();bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const dp=new Vec3(6,67,81);let d=bot.blockAt(dp);if(!d.name.endsWith('_door'))throw Error('missing door');if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(4);}const s=bot.blockAt(dp).shapes[0];const tx=s[3]<.5?6+(s[3]+1)/2:s[0]>.5?6+s[0]/2:6.5;for(let i=0;i<16&&Math.abs(bot.entity.position.x-tx)>.035;i++){check();await bot.lookAt(bot.entity.position.offset(Math.sign(tx-bot.entity.position.x)*10,1.6,0),true);bot.setControlState('forward',true);await bot.waitForTicks(1);bot.setControlState('forward',false);await bot.waitForTicks(3);}await bot.lookAt(new Vec3(mode==='enter'?6.64:tx,bot.entity.position.y+1.62,mode==='enter'?85:76),true);if(mode==='enter'){const step=bot.blockAt(new Vec3(6,66,80));bot.setControlState('jump',!(step.name==='cobblestone_slab'&&step.getProperties().type==='bottom'));}bot.setControlState('forward',true);try{for(let i=0;i<25;i++){check();if(mode==='enter'?bot.entity.position.z>82.25:bot.entity.position.z<79.5)break;if(!bot.blockAt(dp).getProperties().open){bot.setControlState('forward',false);await bot.activateBlock(bot.blockAt(dp));await bot.waitForTicks(3);await bot.lookAt(new Vec3(mode==='enter'?6.64:tx,bot.entity.position.y+1.62,mode==='enter'?85:76),true);bot.setControlState('forward',true);}await bot.waitForTicks(2);}}finally{bot.clearControlStates();await bot.waitForTicks(4);const d=bot.blockAt(dp);if(d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(4);}}if(!(mode==='enter'?bot.entity.position.z>82.2:bot.entity.position.z<80))throw Error('door blocked '+mode);}
function isCampInside(){const p=bot.entity.position;return p.x>=6.3&&p.x<=7.7&&p.z>=82.3&&p.z<=83.7&&p.y>=67&&p.y<68;}
function isCampProtected(){return isCampInside()&&[6,7].every(x=>bot.blockAt(new Vec3(x,67,81))?.getProperties().open===false)&&[67,68,69].every(y=>bot.blockAt(new Vec3(8,y,83))?.boundingBox==='block');}
async function home(){retreating=true;if(discontinuity)return;if(!isCampInside()){await go(3,66,79,1.3,7000);await go(6,66,79,.8,6500);await door('enter');}for(const x of[6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(4);if(bot.blockAt(new Vec3(x,67,81)).getProperties().open)throw Error('door still open after close');}}await bot.waitForTicks(4);if(!isCampProtected())throw Error('not inside closed observed enclosure');console.log('PROTECTED XYZ+DOORS+EAST',bot.entity.position,bot.health);}

function cleanup(){bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',stopBody);bot.removeListener('respawn',stopBody);}
// Read-only surface target selection, not a navigation/path guarantee.
function observedFeet(x,z,preferredY){
 const {Vec3}=require('vec3');const hazards=new Set(['water','lava','fire','soul_fire','magma_block','cactus','sweet_berry_bush','cobweb','nether_portal','ice']);
 const pass=b=>b&&b.boundingBox==='empty'&&!hazards.has(b.name);
 const full=b=>b&&!hazards.has(b.name)&&b.shapes.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 for(const dy of[0,1,-1,2,-2]){const y=preferredY+dy,q=new Vec3(x,y,z),f=bot.blockAt(q.offset(0,-1,0));if(full(f)&&pass(bot.blockAt(q))&&pass(bot.blockAt(q.offset(0,1,0))))return{x,y,z,floor:f.name,feet:bot.blockAt(q).name};}
 return null;
}
// Concatenate into arena programs. Schema-tested, not a combat or LOS guarantee.
// Preconditions: entities from bot.entities, origin current Vec3, radius finite >=0.
// Output: nearby classified hazards including neutral mobs that can block/attack.
function p3Threats(entities, origin, radius){
 if(!origin||!Number.isFinite(radius)||radius<0)throw Error('invalid threat scan input');
 const names=new Set(['magma_cube','slime','ghast','blaze','wither_skeleton','skeleton','stray','spider','cave_spider','zombie','zombie_villager','husk','drowned','creeper','enderman','piglin','piglin_brute','zombified_piglin','hoglin','zoglin','witch','phantom','silverfish','endermite','guardian','elder_guardian','shulker','ravager','vindicator','evoker','pillager','vex','warden']);
 return Object.values(entities).filter(e=>e?.position&&e.type!=='player'&&(e.type==='hostile'||String(e.kind||'').toLowerCase().includes('hostile')||names.has(e.name))).map(e=>({id:e.id,name:e.name,type:e.type,kind:e.kind,distance:Math.hypot(e.position.x-origin.x,e.position.y-origin.y,e.position.z-origin.z),position:{x:e.position.x,y:e.position.y,z:e.position.z}})).filter(e=>e.distance<=radius).sort((a,b)=>a.distance-b.distance);
}

async function surface(x,z,y=66){const q=observedFeet(x,z,y);if(!q)throw Error('no cold feet '+[x,z]);await go(q.x,q.y,q.z,0,8500);}
let out=false;let issue=null;
try{
 check();if(!isCampProtected()||bot.health<18||bot.time.timeOfDay>12600)throw Error('start body/day');
 if(p3Threats(bot.entities,bot.entity.position,16).length||p3Threats(bot.entities,new Vec3(10,66,100),16).length)throw Error('hazards');
 const q=new Vec3(10,71,100);if(bot.blockAt(q)?.name!=='spruce_log')throw Error('target changed');
 const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));try{const a=c.containerItems().find(i=>i.name==='wooden_axe');if(!a)throw Error('axe absent');await c.withdraw(a.type,null,1);}finally{c.close();await bot.waitForTicks(5);}
 await door('exit');out=true;
 for(const [x,z,y] of [[3,88,67],[3,96,66],[9,99,66]]){if(p3Threats(bot.entities,bot.entity.position,12).length)throw Error('travel hazard');await surface(x,z,y);}
 if(p3Threats(bot.entities,bot.entity.position,12).length)throw Error('wood hazard');
 const b=bot.blockAt(q);console.log('STANCE',bot.entity.position,'target',b.name,bot.canDigBlock(b));
 await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_axe'),'hand');
 let timer;try{await Promise.race([bot.dig(b),new Promise((_,r)=>timer=setTimeout(()=>{bot.stopDigging();r(Error('dig limit'));},6000))]);}finally{clearTimeout(timer);}
 await bot.waitForTicks(20);check();console.log('REMOVED',bot.blockAt(q).name,'drops',Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>[e.position,e.getDroppedItem?.()?.name]));
 const drop=Object.values(bot.entities).find(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='spruce_log'&&e.position.distanceTo(bot.entity.position)<4);
 if(drop){const d=drop.position.floored();await surface(d.x,d.z,d.y);await bot.waitForTicks(12);}
 console.log('ACTUAL_WOOD',bot.inventory.items().map(i=>[i.name,i.count]));
}catch(e){issue=e.message;console.log('ISSUE',issue);}
finally{retreating=true;try{if(!discontinuity){if(out){await surface(3,96,66);await surface(4,88,67);}await home();}}finally{cleanup();}}
return {issue,protected:isCampProtected(),health:bot.health,wood:bot.inventory.items().filter(i=>i.name==='spruce_log').reduce((a,i)=>a+i.count,0)};
