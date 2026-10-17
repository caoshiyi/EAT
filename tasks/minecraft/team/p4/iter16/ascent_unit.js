// One protected End ascent unit. Actual End use remains unqualified until world receipt.
bot.clearControlStates();bot.pathfinder.setGoal(null);
if(bot.game.dimension!=='the_end')return{issue:'END_REQUIRED_NO_ACTION',world:bot.game.dimension};
const{Vec3}=require('vec3'),self=bot.entity,origin=self.position.floored(),start=Date.now(),hp=bot.health;
const target=origin.offset(0,1,0),roof=origin.offset(0,2,0),dirs=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]],keys=['forward','back','left','right','jump','sprint','sneak'];
const native=q=>{const b=bot.blockAt(q);return b?.name==='end_stone'&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')},air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);
const faces=q=>[q.offset(0,-1,0),q.offset(0,2,0),...dirs.flatMap(([x,y,z])=>[q.offset(x,0,z),q.offset(x,1,z)])],shell=q=>faces(q).every(native);
const count=()=>bot.inventory.items().filter(i=>i.name==='end_stone').reduce((n,i)=>n+i.count,0),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)};
let issue=null,endingIssue=null,lost=false,mutated=false,completed=false,recovery=false,trace=[];
function discontinuity(){lost=true;stop();bot.stopDigging()}
for(const name of['death','respawn','end'])bot.on(name,discontinuity);
function check(){if(lost||self!==bot.entity||bot.game.dimension!=='the_end'||bot.health<=0)throw Error('DISCONTINUITY');if(Date.now()>1792257629000||Date.now()-start>(recovery?23000:14000))throw Error('TIME');if(!recovery&&bot.health<hp)throw Error('DAMAGE_STOP')}
async function ticks(n=1){check();await bot.waitForTicks(n);check()}
function centered(q){const p=bot.entity.position;return Math.hypot(p.x-q.x-.5,p.z-q.z-.5)<.12&&Math.abs(p.y-q.y)<.12&&self.onGround}
function occupied(q){return Object.values(bot.entities).some(e=>e.username&&e.id!==self.id&&e.position.x+.3>q.x&&e.position.x-.3<q.x+1&&e.position.z+.3>q.z&&e.position.z-.3<q.z+1&&e.position.y+(e.height||1.8)>q.y&&e.position.y<q.y+1)}
async function put(q){if(native(q))return;if(!air(q)||occupied(q))throw Error('CAP_KIND_OR_OCCUPIED');const item=bot.inventory.items().find(i=>i.name==='end_stone');if(!item)throw Error('CAP_STOCK');const d=[[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]].map(a=>new Vec3(...a)).find(d=>native(q.plus(d)));if(!d)throw Error('CAP_REFERENCE');const before=count();await bot.equip(item,'hand');bot.setControlState('sneak',true);await bot._placeBlockWithOptions(bot.blockAt(q.plus(d)),d.scaled(-1),{forceLook:true});await ticks(3);if(!native(q)||count()!==before-1)throw Error('CAP_ACK');trace.push(['CAP',q.toArray(),before,count()])}
try{
 check();if(hp<18||!centered(origin)||!air(origin)||!air(origin.offset(0,1,0))||!shell(origin))throw Error('NATIVE_ORIGIN');
 // Every target face is native already except its floor, which will be filled.
 if(!faces(target).filter(q=>!q.equals(origin)).every(native))throw Error('SURFACE_OR_UNKNOWN_STOP');
 if(occupied(origin)||occupied(target))throw Error('PEER');
 const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<=126);if(!pick)throw Error('PICK_RESERVE');
 // Jump needs standing pose and actual physics clearance, not a local height override.
 stop();for(let n=0;n<15&&(self.height!==1.8||self.metadata?.[6]===5);n++)await ticks();
 if(self.height!==1.8||bot.physics.playerHeight!==1.8||self.metadata?.[6]===5)throw Error('ACTUAL_STANDING');
 const before=count();await bot.equip(pick,'hand');mutated=true;await bot.dig(bot.blockAt(roof),true);await ticks(3);if(!air(roof))throw Error('CUT_ACK');
 for(let n=0;n<20&&count()<=before;n++)await ticks();if(count()!==before+1)throw Error('ORDINARY_NATIVE_DROP');trace.push(['CUT_RECEIPT',roof.toArray(),before,count()]);
 bot.setControlState('jump',true);for(let n=0;n<15&&self.position.y<origin.y+1.05;n++)await ticks();
 if(self.position.y<origin.y+1.05||Math.hypot(self.position.x-origin.x-.5,self.position.z-origin.z-.5)>.15)throw Error('JUMP_BOUND');
 await put(origin);stop();await ticks(8);if(!centered(target)||!air(target)||!air(target.offset(0,1,0))||!shell(target))throw Error('ASCENT_POSTCONDITION');completed=true;global.P4EndAscentProof={entityId:self.id,at:Date.now(),world:'the_end',column:[target.x,target.z],y:target.y};
}catch(e){issue=e.message;stop();recovery=true;
 if(!lost&&mutated)try{
   for(let n=0;n<15&&!self.onGround;n++)await ticks();
   if(centered(target)&&native(origin)){if(!shell(target))throw Error('UPPER_SHELL');trace.push(['RECOVERED_UPPER']);}
   else if(centered(origin)){if(air(roof))for(let n=0;n<25&&!count();n++)await ticks();await put(roof);if(!shell(origin))throw Error('ORIGIN_SHELL');trace.push(['RECOVERED_ORIGIN']);}
   else throw Error('UNRECOGNIZED_BODY');
 }catch(r){endingIssue=r.message;trace.push(['DANGEROUS_ENDING',endingIssue,self.position.clone(),bot.health])}
}finally{stop();for(const name of['death','respawn','end'])bot.removeListener(name,discontinuity)}
return{issue,endingIssue,completed,mutated,lost,p:self.position.clone(),hp:bot.health,food:bot.food,closed:!lost&&shell(self.position.floored()),trace,own:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)])),faces:faces(self.position.floored()).map(q=>[q.toArray(),bot.blockAt(q)?.name,native(q)])};
