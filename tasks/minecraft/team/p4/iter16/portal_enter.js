// First entrant/platform ending must be read from actual arena records before dispatch.
bot.clearControlStates();bot.pathfinder.setGoal(null);
const{Vec3}=require('vec3'),o=new Vec3(132,-36,2276),next=new Vec3(133,-36,2276),self=bot.entity,began=Date.now(),hp=bot.health;
let issue=null,entered=false,changed=false,lost=false,closed=false;const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name),shell=p=>[p.offset(0,-1,0),p.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[p.offset(x,0,z),p.offset(x,1,z)])].every(full),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)};
function death(){lost=true;stop()}bot.on('death',death);bot.on('end',death);
function live(){if(bot.game.dimension==='the_end'){entered=true;stop();return false}if(lost||bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<=0||Date.now()-began>18000||Date.now()>1792257629000)throw Error('LIFE_BOUND');if(bot.health<hp)throw Error('DAMAGE_END');return true}
async function t(n){if(!live())return;await bot.waitForTicks(n);live()}
const allowed=['basalt','cobbled_deepslate','stone_bricks','mossy_stone_bricks','cracked_stone_bricks'];
async function cut(q){if(air(q))return;if(!allowed.includes(bot.blockAt(q)?.name))throw Error('CAP_KIND_'+bot.blockAt(q)?.name);const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<126);if(!pick)throw Error('TOOL');await bot.equip(pick,'hand');await bot.dig(bot.blockAt(q),true);changed=true;await t(1);if(!entered&&!air(q))throw Error('CUT_ACK')}
async function put(q){if(full(q))return;const item=bot.inventory.items().find(i=>allowed.includes(i.name));if(!item)throw Error('ENDING_STOCK');const dirs=[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].map(a=>new Vec3(...a)),d=dirs.find(d=>full(q.plus(d)));if(!d)throw Error('ENDING_REF');await bot.equip(item,'hand');await bot._placeBlockWithOptions(bot.blockAt(q.plus(d)),d.scaled(-1),{forceLook:true});await t(2);if(!full(q))throw Error('ENDING_ACK')}
try{
if(!live())throw Error('ALREADY_END');if(!self.position.floored().equals(o)||hp<18||!shell(o))throw Error('STAGE_FULL');
for(let x=133;x<=135;x++)for(let z=2275;z<=2277;z++)if(bot.blockAt(new Vec3(x,-38,z))?.name!=='end_portal')throw Error('ACTUAL_PORTAL9_REQUIRED');
if(Object.values(bot.entities).some(e=>e.username&&e.id!==self.id&&e.position.distanceTo(next)<1.2))throw Error('PEER_ENTRY_CELL');
await cut(next.offset(0,1,0));await cut(next);if(!air(next.offset(0,-1,0)))await cut(next.offset(0,-1,0));
for(let k=0;k<100&&!entered;k++){if(!live())break;await bot.lookAt(next.offset(.5,1,.5),true);bot.setControlState('forward',true);await t(1)}
if(!entered)throw Error('END_ARRIVAL_UNCONFIRMED');
}catch(e){issue=e.message}
finally{stop();if(changed&&!lost&&!entered&&bot.entity===self&&bot.game.dimension==='overworld'&&bot.entity.position.distanceTo(o.offset(.5,0,.5))<.25){try{await put(next);await put(next.offset(0,1,0));closed=shell(o)}catch(e){issue=(issue||'')+';ENDING:'+e.message}}bot.removeListener('death',death);bot.removeListener('end',death)}
return{issue,entered,changed,lost,closed,world:bot.game.dimension,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,onGround:bot.entity.onGround,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};
