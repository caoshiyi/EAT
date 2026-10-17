// p1 on-foot water operations only. Own listeners removed by finishWater.
const {Vec3}=require('vec3');
let lost=false;const started=Date.now(),hardUntil=started+85000,workUntil=started+65000;
const onLost=()=>{lost=true;try{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.stopDigging()}catch{}};
bot.on('death',onLost);bot.on('respawn',onLost);bot.on('end',onLost);
const full=b=>!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const dirs=[new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,0,1),new Vec3(0,0,-1)];
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
const mobs=()=>Object.values(bot.entities).filter(e=>['drowned','skeleton','zombie','creeper','guardian','elder_guardian'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<28);
function life(){if(lost||bot.health<=0||bot.game.dimension!=='overworld'||Date.now()>hardUntil||Date.now()>1792205901000)throw Error('LIFE_DIM_BUDGET');}
function need(ms){life();if(Date.now()+ms>workUntil)throw Error('WORK_RESERVE');}
async function tick(n){life();await bot.waitForTicks(n);life();}
function bubbleAtEye(){return bot.blockAt(bot.entity.position.offset(0,1.62,0).floored())?.name==='bubble_column';}
function onMagma(){return bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name==='magma_block';}
async function waterMove(x,z,ms,{surface=true,tol=.12,sneak=false}={}){const end=Date.now()+ms;bot.pathfinder.setGoal(null);bot.setControlState('jump',surface);while(Date.now()<end&&Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>tol){life();const d=Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z);await bot.lookAt(new Vec3(x,bot.entity.position.y+1.62,z),true);bot.setControlState('sneak',sneak||d<1.2);bot.setControlState('forward',true);await tick(1);}bot.setControlState('forward',false);await tick(3);return Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)<=tol+.08;}
async function rockDig(q){need(1500);const b=bot.blockAt(q);if(!b||!['stone','granite','diorite','andesite','magma_block','deepslate','tuff','cobbled_deepslate','stone_bricks','cracked_stone_bricks','mossy_stone_bricks'].includes(b.name))throw Error('ROCK_KIND_'+b?.name);const pick=bot.inventory.items().filter(i=>i.name==='stone_pickaxe'&&(i.durabilityUsed||0)<120).sort((a,b)=>(a.durabilityUsed||0)-(b.durabilityUsed||0))[0];if(!pick)throw Error('NO_ROCK_PICK');await bot.equip(pick,'hand');await tick(2);const slot=36+bot.quickBarSlot,it=bot.inventory.slots[slot],wear=it.durabilityUsed||0,type=it.type,cost=bot.digTime(b);need(cost+1500);if(cost>6000)throw Error('DIG_PREDICTION_'+cost);await bot.dig(b,true);const ackEnd=Date.now()+1200;while(Date.now()<ackEnd){const a=bot.inventory.slots[slot];if(a?.type===type&&(a.durabilityUsed||0)>wear&&bot.blockAt(q)?.name==='air'){await tick(3);if(bot.blockAt(q)?.name==='air')return;}await tick(1);}throw Error('DIG_NO_SERVER_WEAR_ACK');}
async function finishWater(label,extra={}){
 try{bot.pathfinder.setGoal(null)}catch{}
 try{for(const c of['forward','back','left','right','jump','sprint'])bot.setControlState(c,false);if(onMagma()||bubbleAtEye())bot.setControlState('sneak',true);else if(!bot.entity.onGround&&[0,-1,-2].some(y=>bot.blockAt(bot.entity.position.floored().offset(0,y,0))?.name==='water')){bot.setControlState('sneak',false);bot.setControlState('jump',true);}else bot.setControlState('sneak',false);}catch{}
 for(const n of['death','respawn','end'])try{bot.removeListener(n,onLost)}catch{}
 console.log(label,JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,air:bot.oxygenLevel,lost,eye:bot.blockAt(bot.entity.position.offset(0,1.62,0).floored())?.name,under:bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name,controls:Object.fromEntries(["forward","back","left","right","jump","sprint","sneak"].map(k=>[k,bot.getControlState(k)])),selfAir:selfAir(),inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),mobs:mobs().map(e=>[e.name,e.position,e.position.distanceTo(bot.entity.position)]),...extra}));
}

const selfAirKey=bot.registry.entitiesByName.player.metadataKeys?.indexOf('air_supply')??-1;
function selfAir(){const raw=selfAirKey>=0?bot.entity.metadata?.[selfAirKey]:null;return typeof raw==='number'?{raw,icons:Math.round(raw/15)}:null;}
