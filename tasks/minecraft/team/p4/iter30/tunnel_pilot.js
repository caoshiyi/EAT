const ROUTE_LIMIT=2;
const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),home=v(7,67,-23),began=Date.now();
const cnt=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
let escaping=false,dead=false;const death=()=>{dead=true;bot.clearControlStates();};bot.on('death',death);
const prepared=[v(7,64,-23)];
const guard=()=>{if(dead||(bot.health!==20&&!escaping)||bot.game.dimension!=='overworld'||Date.now()-began>(escaping?110000:85000))throw Error('life/health/budget');};
async function face(q){for(const a of[[.5,.99,.5],[.5,.5,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q))return c;}throw Error('notcurrentvisible '+q);}
async function cut(q){guard();const b=bot.blockAt(q);if(!['dirt','grass_block','stone','diorite','granite'].includes(b?.name))throw Error('unexpected minekind '+b?.name);await bot.equip(bot.inventory.items().find(i=>i.name===(['stone','diorite','granite'].includes(b.name)?'wooden_pickaxe':'wooden_shovel')),'hand');await face(q);await bot.dig(b,true,'raycast');await bot.waitForTicks(8);guard();console.log('MINE_CUT',JSON.stringify({q,n:b.name,state:snap()}));}
async function settle(y){for(let k=0;k<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-y)>.03);k++)await bot.waitForTicks(1);guard();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-y)>.03)throw Error('mine actual landing');}
async function flat(q){const p=bot.entity.position.clone(),tx=q.x+.5,tz=q.z+.5,dx=tx-p.x,dz=tz-p.z,L=Math.hypot(dx,dz);if(L<.08)return;const ux=dx/L,uz=dz/L;await bot.lookAt(v(tx,p.y+1.62,tz),true);try{bot.setControlState('forward',true);for(let k=0;k<35&&(tx-bot.entity.position.x)*ux+(tz-bot.entity.position.z)*uz>.07;k++){guard();await bot.waitForTicks(1);}}finally{bot.clearControlStates();}await bot.waitForTicks(5);if(bot.entity.position.floored().y!==q.y||!bot.entity.position.floored().equals(q))throw Error('mineflatactual');}
async function up(){const q=bot.entity.position.floored(),ref=q.offset(0,-1,0),i=bot.inventory.items().find(i=>i.name==='dirt')||bot.inventory.items().find(i=>i.name==='cobblestone');if(!i||!full(ref))throw Error('return material/support');await bot.equip(i,'hand');await face(ref);bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<q.y+1.04;k++)await bot.waitForTicks(1);if(bot.entity.position.y<q.y+1.04)throw Error('native upheight');if(!bot.blockAtCursor(4.5)?.position.equals(ref))throw Error('native visiblefloor');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await settle(q.y+1);}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('MINE_SOURCE',JSON.stringify(snap()));if(!bot.entity.position.floored().equals(home)||bot.health!==20)throw Error('mine actualsource');
for(let k=0;k<3;k++){const q=bot.entity.position.floored();if(!full(q.offset(0,-2,0)))throw Error('next actual floor');await cut(q.offset(0,-1,0));await settle(q.y-1);}
const base=home.offset(0,-3,0),route=[];
for(let x=8;x<=12;x++)route.push(v(x,64,-23));
for(let z=-24;z>=-28;z--)route.push(v(12,64,z));
for(const next of route.slice(0,ROUTE_LIMIT)){
if(cnt('cobblestone')>=8)break;
if(!full(next.offset(0,-1,0)))throw Error('actual tunnel support '+next);
for(const q of [next,next.offset(0,1,0)])if(!['air','cave_air'].includes(bot.blockAt(q)?.name))await cut(q);
prepared.push(next);await flat(next);console.log('ACTUAL_TUNNEL_NODE',JSON.stringify({next,state:snap()}));
}
if(ROUTE_LIMIT>2&&cnt('cobblestone')<8){const q=bot.entity.position.floored();for(const d of[v(1,0,0),v(0,0,-1),v(0,0,1)])for(const y of[0,1]){const r=q.plus(d).offset(0,y,0);if(bot.blockAt(r)?.name==='stone')await cut(r);}}

console.log('MINE_RECEIVED',JSON.stringify(snap()));
}catch(e){console.log('MINE_FAILURE',String(e),JSON.stringify(snap()));}
finally{
escaping=true;bot.clearControlStates();bot.pathfinder.setGoal(null);
if(!dead&&bot.health>0&&bot.game.dimension==='overworld')try{const q=bot.entity.position.floored();if(q.y<67){let at=prepared.findIndex(p=>p.equals(q));if(at<0&&q.x===7&&q.z===-23)at=0;if(at<0)throw Error('actual recovery source notprepared');for(let k=at-1;k>=0;k--)await flat(prepared[k]);await flat(v(7,q.y,-23));while(bot.entity.position.y<66.99)await up();}}catch(e){console.log('MINE_RETURN_FAILURE',String(e),JSON.stringify(snap()));}
bot.clearControlStates();bot.removeListener('death',death);await bot.waitForTicks(8);console.log('MINE_END',JSON.stringify(snap()));
}
return snap();
