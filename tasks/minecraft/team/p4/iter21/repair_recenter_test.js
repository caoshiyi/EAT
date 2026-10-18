const V=require('vec3').Vec3;
const ring=[[39,0],[39,1],[39,2],[39,3],[40,3],[41,3],[42,3],[43,3],[44,3],[45,3],[45,2],[45,1],[45,0],[45,-1],[45,-2],[45,-3],[44,-3],[43,-3],[42,-3],[41,-3],[40,-3],[39,-3],[39,-2],[39,-1]];
const path=ring.map(([x,z],i)=>({x,y:50+i,z}));global.P4Spiral21={steps:path};
const capNames=['end_stone','tuff','cobbled_deepslate','stone_bricks'];
function full(p){return bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');}
const normals=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];
async function visible(p,required=null){const candidates=required===null?[p.offset(.5,.5,.5),p.offset(.35,.75,.65),p.offset(.65,.25,.35)]:[.35,.65,.25,.75].map((a,i)=>{const n=normals[required],b=i%2?.35:.65;const q=n.y?new V(a,n.y>0?1:0,b):n.z?new V(a,b,n.z>0?1:0):new V(n.x>0?1:0,a,b);return p.plus(q).minus(n.scaled(.015));});
 for(const aim of candidates){await bot.lookAt(aim,true);await bot.waitForTicks(1);const h=bot.blockAtCursor(4.5);if(h&&h.position.equals(p)&&(required===null||h.face===required)&&h.intersect&&[1.62,1.8].every(y=>bot.entity.position.offset(0,y,0).distanceTo(h.intersect)<=4.5))return {p:h.position,face:h.face,intersect:h.intersect,aim};}return null;}
async function digNative(p,log){const b=bot.blockAt(p);if(b.boundingBox==='empty')return;if(b.name!=='end_stone')throw Error('non-native dig '+p+' '+b.name);const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe')||bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!pick)throw Error('no ordinary pick');await bot.equip(pick,'hand');const ray=await visible(p);if(!ray)throw Error('no visible dig '+p);log.push({kind:'dig_pre',p,ray,hp:bot.health});console.log('DIG_PRE',JSON.stringify(log.at(-1)));await bot.dig(b,'ignore',normals[ray.face]);await bot.waitForTicks(1);if(bot.blockAt(p).boundingBox!=='empty')throw Error('dig no physical effect');}
async function place(refp,f,dest,log){if(full(dest))return;const it=bot.inventory.items().find(i=>capNames.includes(i.name));if(!it)throw Error('no ordinary cap');await bot.equip(it,'hand');const ray=await visible(refp,f);if(!ray)throw Error('not visible place face '+refp+' '+f);const body=bot.entity.position;if(dest.y+1>body.y&&dest.y<body.y+1.8&&dest.x<body.x+.3&&dest.x+1>body.x-.3&&dest.z<body.z+.3&&dest.z+1>body.z-.3)throw Error('target overlaps body');console.log('PLACE_PRE',JSON.stringify({refp,f,dest,ray,body}));await bot.placeBlock(bot.blockAt(refp),normals[f]);await bot.waitForTicks(1);if(!full(dest))throw Error('place no physical effect');log.push({kind:'place',p:dest,n:bot.blockAt(dest).name,hp:bot.health});console.log('PLACE_EFFECT',JSON.stringify(log.at(-1)));}
async function go(x,y,z){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(2);const start=bot.entity.position.clone(),until=Date.now()+3500;
 if(y>start.y+.3){
 // Approach actual step-face on ground first: air acceleration from cell centre is insufficient.
 for(let t=0;t<8&&bot.entity.position.y<y-.05;t++){await bot.lookAt(new V(x+.5,bot.entity.position.y+bot.entity.eyeHeight,z+.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}bot.setControlState('forward',false);
 if(bot.entity.position.y<y-.05){bot.setControlState('jump',true);let rose=false;for(let t=0;t<12;t++){await bot.waitForTicks(1);if(bot.entity.position.y>=y+.005){rose=true;break;}}bot.setControlState('jump',false);if(!rose)throw Error('actual in-place rise below nextfloor');}}
 try{while(Math.hypot(bot.entity.position.x-x-.5,bot.entity.position.z-z-.5)>.06){if(Date.now()>until||bot.health<=0)throw Error('manual adjacent budget');await bot.lookAt(new V(x+.5,bot.entity.position.y+bot.entity.eyeHeight,z+.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}
 finally{bot.clearControlStates();}await bot.waitForTicks(14);if(Math.abs(bot.entity.position.y-y)>.08||!bot.entity.onGround)throw Error('manual actual endpoint absent');console.log('TWO_PHASE_STEP',JSON.stringify({start,target:[x,y,z],p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,velocity:bot.entity.velocity}));
}

let issue=null,reached=0;const log=[],begin=Date.now();
try{bot.pathfinder.setGoal(null);bot.clearControlStates();if(bot.game.dimension!=='the_end'||Math.abs(bot.entity.position.y-50)>.1)throw Error('start');
for(let i=1;i<path.length;i++){
 const q=path[i],floor=new V(q.x,q.y-1,q.z);
 if(!full(floor)){
 if(i===16)await place(new V(44,64,-3),1,floor,log);
 else if(i===17){await go(44,66,-3);await place(new V(43,66,-2),2,floor,log);}
 else throw Error('unexpected absent floor '+floor);
 }
 if(!full(floor)||[0,1].some(j=>bot.blockAt(new V(q.x,q.y+j,q.z)).boundingBox!=='empty'))throw Error('changed body geometry '+JSON.stringify(q));
 if(bot.health<14||Date.now()-begin>55000)throw Error('budget/health');
 await go(q.x,q.y,q.z);reached=i;
}
console.log('UPPER_OBSERVATION',JSON.stringify({p:bot.entity.position,hp:bot.health,blocks:[[39,73,0],[39,74,0],[39,73,1],[39,74,1],[40,76,0],[40,76,1]].map(p=>{const b=bot.blockAt(new V(...p));return {p,n:b.name,sh:b.shapes}})}));
}catch(e){issue=String(e);console.log('ISSUE',issue)}finally{
for(const q of path.slice(0,reached+1).reverse()){try{await go(q.x,q.y,q.z)}catch(e){console.log('RETURN_FAIL',String(e));break;}}
bot.pathfinder.setGoal(null);bot.clearControlStates();}
return {issue,reached,log,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,elapsed:Date.now()-begin};
