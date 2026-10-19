const V=bot.entity.position.constructor;
const at=(x,y,z)=>bot.blockAt(new V(x,y,z));
const inv=()=>bot.inventory.items().map(i=>[i.name,i.count]);
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
const state=tag=>console.log(tag,JSON.stringify({t:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:inv()}));
async function cut(p){const b=bot.blockAt(p);if(!b||b.name==='air')return;await bot.dig(b);await bot.waitForTicks(20);console.log('CUT',p,b.name,inv());}
async function craft(n,table=null){const item=bot.registry.itemsByName[n];const r=bot.recipesFor(item.id,null,1,table)[0];if(!r)throw Error('recipe unavailable '+n);const before=count(n);await bot.craft(r,1,table);await bot.waitForTicks(12);console.log('CRAFT',n,before,count(n),inv());if(count(n)<=before)throw Error('craft no actual receipt '+n);}
async function equip(n){const i=bot.inventory.items().find(i=>i.name===n);if(!i)throw Error('no '+n);await bot.equip(i,'hand');}
async function cap(p,n='dirt'){
 if(bot.blockAt(p)?.boundingBox==='block')return;
 const choices=[new V(0,-1,0),new V(1,0,0),new V(-1,0,0),new V(0,0,1),new V(0,0,-1),new V(0,1,0)];
 for(const d of choices){const ref=bot.blockAt(p.plus(d));if(ref?.boundingBox!=='block')continue;try{await equip(n);await bot.placeBlock(ref,d.scaled(-1));await bot.waitForTicks(12);if(bot.blockAt(p)?.boundingBox==='block')return;}catch(e){console.log('PLACE_REFUSED',p,ref.position,e.message)}}throw Error('no usable cap reference');
}
async function burrow(depth=3){
 bot.clearControlStates();bot.pathfinder.setGoal(null);let p=bot.entity.position;
 if(!bot.entity.onGround||Math.abs(p.x-Math.floor(p.x)-.5)>.22||Math.abs(p.z-Math.floor(p.z)-.5)>.22)throw Error('burrow requires centered settled body');
 for(let j=0;j<depth;j++){p=bot.entity.position;const q=p.floored().offset(0,-1,0),b=bot.blockAt(q);if(['stone','deepslate','cobblestone','sandstone'].includes(b.name)){if(!bot.inventory.items().some(i=>i.name.endsWith('pickaxe')))throw Error('stone needs pick');await equip(bot.inventory.items().find(i=>i.name.endsWith('pickaxe')).name);}await cut(q);await bot.waitForTicks(8);}
 p=bot.entity.position.floored();await cap(p.offset(0,2,0));await bot.waitForTicks(12);state('BURROW_END');
 console.log('BOUNDARY',[new V(0,-1,0),new V(0,2,0),...[-1,0,1].flatMap(x=>[-1,0,1].filter(z=>Math.abs(x)+Math.abs(z)===1).flatMap(z=>[0,1].map(y=>new V(x,y,z))))].map(d=>[d,bot.blockAt(p.plus(d))?.name]));
}
