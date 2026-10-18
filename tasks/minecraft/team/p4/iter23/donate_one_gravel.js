const V=require('vec3').Vec3;
const ns=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];
const door=new V(-9,26,-37),home=new V(-8.5,26,-37.5),began=Date.now();
bot.pathfinder.setGoal(null);bot.clearControlStates();let issue=null,tossed=false;
const count=()=>bot.inventory.items().filter(i=>i.name==='gravel').reduce((n,i)=>n+i.count,0);
const full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
function live(){if(bot.game.dimension!=='overworld'||bot.health<=0)throw Error('life/dimension');}
function first(h,max=4.5){const o=bot.entity.position.offset(0,h,0),c=Math.cos(bot.entity.pitch),d=new V(-Math.sin(bot.entity.yaw)*c,Math.sin(bot.entity.pitch),-Math.cos(bot.entity.yaw)*c);for(let t=0;t<max;t+=.003){const q=o.plus(d.scaled(t)),b=bot.blockAt(q.floored());if(!b)return{unknown:true};const a=q.minus(b.position);if(b.shapes.some(s=>a.x>s[0]&&a.x<s[3]&&a.y>s[1]&&a.y<s[4]&&a.z>s[2]&&a.z<s[5]))return{p:b.position,n:b.name,t};}return null;}
async function face(p,top=false){for(const aim of(top?[p.offset(.5,1,.5)]:[[.5,.5,.5],[.5,.85,.5],[.2,.2,.8],[.8,.8,.2]].map(a=>p.offset(...a)))){await bot.lookAt(aim,true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5),rays=[bot.entity.eyeHeight,bot.entity.height].map(h=>first(h));if(c?.position.equals(p)&&(!top||c.face===1)&&rays.every(r=>r?.p?.equals(p)))return c;}throw Error('actual camera target hidden '+p);}
async function walk(z){const until=Date.now()+2000;try{while(Math.abs(bot.entity.position.z-z)>.09){live();if(Date.now()>until||Math.abs(bot.entity.position.x+8.5)>.2||Math.abs(bot.entity.position.y-26)>.1)throw Error('walk envelope');await bot.lookAt(new V(-8.5,bot.entity.position.y+bot.entity.eyeHeight,z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}finally{bot.clearControlStates();}await bot.waitForTicks(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-26)>.1)throw Error('walk ending');}
async function dig(p){live();if(bot.health<20||Date.now()-began>15000)throw Error('new action budget/hp');const b=bot.blockAt(p);if(b?.name!=='gravel')throw Error('door changed');const c=await face(p);await bot.unequip('hand');await bot.dig(b,'ignore',ns[c.face]);await bot.waitForTicks(8);if(bot.blockAt(p)?.name!=='air')throw Error('door not air');console.log('DOOR_CUT',JSON.stringify({p,gravel:count(),inv:bot.inventory.items().map(i=>[i.name,i.count])}));}
async function cap(p){if(full(p))return;live();const ref=p.offset(0,-1,0),it=bot.inventory.items().find(i=>i.name==='gravel');if(!it||!full(ref)||bot.blockAt(p)?.name!=='air')throw Error('cap support/material');await face(ref,true);await bot.equip(it,'hand');await bot.placeBlock(bot.blockAt(ref),ns[1]);await bot.waitForTicks(6);if(!full(p))throw Error('cap not full');}
function audit(){const p=new V(-9,26,-38);return [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(a=>({p:p.offset(...a),n:bot.blockAt(p.offset(...a))?.name,full:full(p.offset(...a))}));}
try{
 live();const peer=bot.players.p2?.entity;if(!peer||peer.position.distanceTo(home)>4||Math.abs(peer.position.y-26)>.15)throw Error('recipient not ready: zero cuts');
 if(audit().some(q=>!q.full)||bot.entity.position.distanceTo(home)>.4||count()!==1||bot.entity.eyeHeight!==1.62)throw Error('starting retention changed');
 for(const p of[door.offset(0,-1,0),door.offset(0,2,0),new V(-9,25,-36)])if(!full(p))throw Error('support/above changed');
 if(bot.blockAt(door.offset(0,2,0))?.name==='gravel')throw Error('gravity refill risk');
 const foes=Object.values(bot.entities).filter(e=>['zombie','skeleton','creeper','silverfish','spider'].includes(e.name)&&e.position.distanceTo(home)<10);if(foes.length)throw Error('nearby hostile');
 await dig(door.offset(0,1,0));await walk(-37.31);await bot.waitForTicks(12);
 if(count()<2)throw Error('head receipt insufficient; reclose only');
 await dig(door);await walk(-36.5);await bot.waitForTicks(12);console.log('ORDINARY_RECEIPT',JSON.stringify({gravel:count(),p:bot.entity.position}));
 await walk(home.z);if(count()<3)throw Error('three-gravel gate failed; no donation');
 const p2=bot.players.p2?.entity;if(!p2||p2.position.distanceTo(bot.entity.position)>3||Math.abs(p2.position.y-26)>.15)throw Error('recipient moved');
 await bot.lookAt(p2.position.offset(0,1,0),true);await bot.waitForTicks(1);
 const selected=bot.entityAtCursor(3),rays=[bot.entity.eyeHeight,bot.entity.height].map(h=>first(h,bot.entity.position.offset(0,h,0).distanceTo(p2.position.offset(0,1,0))));
 if(selected?.id!==p2.id||rays.some(r=>r))throw Error('recipient not actual visible target');
 const item=bot.inventory.items().find(i=>i.name==='gravel');console.log('TOSS_PRE',JSON.stringify({gravel:count(),p2:p2.position,rays,selected:selected.id}));
 await bot.toss(item.type,item.metadata,1);await bot.waitForTicks(10);tossed=count()===2;console.log('TOSS_POST_NOT_RECEIPT',JSON.stringify({tossed,gravel:count(),p2:p2.position,drops:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(home)<5).map(e=>({p:e.position,item:e.metadata?.[8]}))}));
}catch(e){issue=String(e);console.log('CASE',issue);}
finally{
 bot.pathfinder.setGoal(null);bot.clearControlStates();
 try{await walk(home.z);await cap(door);await cap(door.offset(0,1,0));}catch(e){console.log('RECLOSURE_ERROR',String(e));}
 for(let sample=0;sample<3;sample++){const cells=audit();console.log('FINAL_FULL',JSON.stringify({sample,p:bot.entity.position,hp:bot.health,food:bot.food,gravel:count(),issue,tossed,full:cells.every(q=>q.full),cells}));await bot.waitForTicks(10);}
 bot.pathfinder.setGoal(null);bot.clearControlStates();
}
return{issue,tossed,gravel:count(),full:audit().every(q=>q.full),p:bot.entity.position,hp:bot.health,food:bot.food};
