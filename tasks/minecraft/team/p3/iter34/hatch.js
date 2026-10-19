const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),wait=n=>bot.waitForTicks(n);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
function stop(){bot.clearControlStates();bot.pathfinder.setGoal(null);}
const state=()=>({p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count])});
async function face(q){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),aim=q.offset(.5,.5,.5),d=aim.minus(eye),h=bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()+.01);if(!h?.position.equals(q))throw Error('hidden '+q);await bot.lookAt(aim,true);const b=bot.blockAtCursor(4.5);if(!b?.position.equals(q))throw Error('cursor '+q);}
async function cut(q){if(['air','cave_air'].includes(bot.blockAt(q)?.name))return;if(!['dirt','gravel','spruce_planks','basalt'].includes(bot.blockAt(q)?.name))throw Error('cut guard '+bot.blockAt(q)?.name);await bot.unequip('hand');await face(q);await bot.dig(bot.blockAt(q),true,'raycast');await wait(10);if(full(q))throw Error('cut post');console.log('CUT',q,JSON.stringify(state()));}
stop();console.log('SOURCE',JSON.stringify(state()));
try{
for(let step=0;step<1;step++){
const p=bot.entity.position.floored();if(!bot.entity.onGround||!full(p.offset(0,-1,0)))throw Error('source');
await cut(p.offset(0,2,0));await cut(p.offset(0,3,0));
const item=bot.inventory.items().find(i=>i.name==='gravel')||bot.inventory.items().find(i=>i.name==='dirt');if(!item)throw Error('fund');await bot.equip(item,'hand');
bot.setControlState('jump',true);let heights=[];for(let i=0;i<15;i++){await wait(1);heights.push(bot.entity.position.y);if(bot.entity.position.y>=p.y+1.12)break;}console.log('JUMP',heights);if(bot.entity.position.y<p.y+1.12)throw Error('height');
await bot.placeBlock(bot.blockAt(p.offset(0,-1,0)),v(0,1,0));stop();await wait(20);console.log('POST',JSON.stringify(state()),bot.blockAt(p)?.name);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-p.y-1)>.03||!full(p))throw Error('post');
}
const q=v(8,70,89),ref=bot.blockAt(v(7,70,89));await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.placeBlock(ref,v(1,0,0));await wait(10);console.log('ROOF',bot.blockAt(q)?.name,JSON.stringify(state()));
}finally{stop();console.log('ENDING',JSON.stringify(state()));}
