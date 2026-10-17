// Actual selected source interface only: P2's verified 3-high BASE60 -> TLOW61.
// Source owner may execute as its own p2. Never run this on p1/other bodies.
const {Vec3}=require('vec3'),q=new Vec3(-134,60,-431),self=bot.entity,start=Date.now(),hp0=bot.health;
bot.clearControlStates();bot.pathfinder.setGoal(null);
let issue=null,lost=false,placed=false,completed=false;
const full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=p=>['air','cave_air'].includes(bot.blockAt(p)?.name),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)},die=()=>{lost=true;stop()};
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='the_nether'||bot.health<=0||bot.health<hp0||Date.now()-start>9000||Date.now()>1792250255000)throw Error('LIFE_TIME');}
async function tick(){check();await bot.waitForTicks(1);check()}
const sides=(n)=>[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>Array.from({length:n},(_,y)=>q.offset(x,y,z)));
for(const e of ['death','respawn','end'])bot.on(e,die);
try{
 check();if(bot.username!=='p2'||!self.position.floored().equals(q)||!self.onGround||hp0<5)throw Error('ACTUAL_P2_BASE60_REQUIRED');
 if(!full(q.offset(0,-1,0))||!full(q.offset(0,3,0))||!sides(3).every(full)||![0,1,2].every(y=>air(q.offset(0,y,0))))throw Error('ACTUAL_THREE_HIGH_ENCLOSURE_REQUIRED');
 // Center before the jump to avoid the old support-overlap problem.
 for(let n=0;n<30&&Math.hypot(self.position.x-q.x-.5,self.position.z-q.z-.5)>.08;n++){
  await bot.lookAt(q.offset(.5,1.2,.5),true);bot.setControlState('forward',true);bot.setControlState('sneak',true);await tick();stop();
 }
 if(Math.hypot(self.position.x-q.x-.5,self.position.z-q.z-.5)>.12)throw Error('CENTER_REQUIRED');
 for(let n=0;n<15&&(self.height!==1.8||self.metadata?.[6]===5);n++)await tick();
 if(self.height!==1.8||bot.physics.playerHeight!==1.8||self.metadata?.[6]===5)throw Error('ACTUAL_STANDING_REQUIRED');
 const item=bot.inventory.items().find(i=>i.name==='nether_bricks');if(!item)throw Error('ONE_HELD_BRICK_REQUIRED');
 await bot.equip(item,'hand');bot.setControlState('jump',true);
 for(let n=0;n<15&&self.position.y<q.y+1.05;n++)await tick();
 if(self.position.y<q.y+1.05)throw Error('JUMP_INSUFFICIENT');
 await bot._placeBlockWithOptions(bot.blockAt(q.offset(0,-1,0)),new Vec3(0,1,0),{forceLook:true});placed=full(q);if(!placed)throw Error('FLOOR_PLACE_UNCONFIRMED');
 stop();for(let n=0;n<12;n++)await tick();
 const top=q.offset(0,1,0),faces=[top.offset(0,-1,0),top.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[top.offset(x,0,z),top.offset(x,1,z)])];
 completed=self.position.floored().equals(top)&&self.onGround&&faces.every(full);if(!completed)throw Error('TLOW61_ENDING_UNCONFIRMED');
}catch(e){issue=e.message}finally{stop();for(const e of ['death','respawn','end'])bot.removeListener(e,die)}
return{issue,placed,completed,lost,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,rods:bot.inventory.items().filter(i=>i.name==='blaze_rod').reduce((n,i)=>n+i.count,0),inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};
