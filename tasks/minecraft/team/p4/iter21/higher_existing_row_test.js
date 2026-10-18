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

async function walk(x,z){const begin=Date.now();bot.clearControlStates();try{while(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.035){if(Date.now()-begin>3500)throw Error('walk budget');await bot.lookAt(new V(x,bot.entity.position.y+bot.entity.eyeHeight,z),true);bot.setControlState('forward',true);await bot.waitForTicks(1)}}finally{bot.clearControlStates()}await bot.waitForTicks(8);}
function actualRay(offset,max=4.5){const origin=bot.entity.position.offset(0,offset,0),cp=Math.cos(bot.entity.pitch),dir=new V(-Math.sin(bot.entity.yaw)*cp,Math.sin(bot.entity.pitch),-Math.cos(bot.entity.yaw)*cp),end=origin.plus(dir.scaled(max));let best=null;
for(let x=Math.floor(Math.min(origin.x,end.x));x<=Math.floor(Math.max(origin.x,end.x));x++)for(let y=Math.floor(Math.min(origin.y,end.y));y<=Math.floor(Math.max(origin.y,end.y));y++)for(let z=Math.floor(Math.min(origin.z,end.z));z<=Math.floor(Math.max(origin.z,end.z));z++){const p=new V(x,y,z),b=bot.blockAt(p);if(!b)throw Error("unknown cell");for(const box of b.shapes){let enter=0,exit=max,face=null,valid=true;for(let a=0;a<3;a++){const axis=["x","y","z"][a],o=origin[axis],d=dir[axis],lo=p[axis]+box[a],hi=p[axis]+box[a+3];if(Math.abs(d)<1e-10){if(o<lo||o>hi){valid=false;break}continue}let t0=(lo-o)/d,t1=(hi-o)/d,entryFace=[[4,5],[0,1],[2,3]][a][d>0?0:1];if(t0>t1)[t0,t1]=[t1,t0];if(t0>enter){enter=t0;face=entryFace}exit=Math.min(exit,t1);if(exit<enter){valid=false;break}}if(valid&&exit>=0&&enter<=max&&(!best||enter<best.distance))best={p:b.position,n:b.name,face,distance:enter,hit:origin.plus(dir.scaled(enter))}}}return{origin,dir,max,hit:best}}

let issue=null,reached=0,attack=null;const log=[],begin=Date.now();
async function clearSlab(p){const b=bot.blockAt(p);if(b.name!=='cobbled_deepslate_slab')return;if(!bot.inventory.items().find(i=>i.name==='stone_pickaxe'))throw Error('no pick');await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');const ray=await visible(p);if(!ray)throw Error('slab not visible');await bot.dig(b,'ignore',normals[ray.face]);await bot.waitForTicks(3);if(bot.blockAt(p).boundingBox!=='empty')throw Error('slab remained');console.log('SLAB_REMOVED',JSON.stringify(p));}
async function top(p,name='end_stone'){const dest=p.offset(0,1,0);if(name==='end_stone'&&full(dest))return;if(bot.blockAt(dest).boundingBox!=='empty')throw Error('dest not empty '+dest);const it=bot.inventory.items().find(i=>i.name===name);if(!it)throw Error('missing '+name);await bot.equip(it,'hand');const ray=await visible(p,1);if(!ray)throw Error('not visibleTOP '+p);console.log('TOP_PRE',JSON.stringify({p,ray,body:bot.entity.position}));await bot.placeBlock(bot.blockAt(p),normals[1]);await bot.waitForTicks(3);const b=bot.blockAt(dest);console.log('TOP_EFFECT',JSON.stringify({p:dest,n:b.name,sh:b.shapes}));if(name==='end_stone'?!full(dest):!b.shapes.some(s=>s[1]===0&&s[4]===.5))throw Error('physical top failed');}
try{
if(bot.game.dimension!=='the_end'||Math.abs(bot.entity.position.y-50)>.1)throw Error('start');
for(let i=1;i<path.length;i++){const q=path[i];if(!full(new V(q.x,q.y-1,q.z))||[0,1].some(j=>bot.blockAt(new V(q.x,q.y+j,q.z)).boundingBox!=='empty'))throw Error('changed step'+i);if(bot.health<14||Date.now()-begin>50000)throw Error('budget/health');await go(q.x,q.y,q.z);reached=i;}
if(!full(new V(39,73,0)))throw Error('missingtopfloor');await clearSlab(new V(39,74,0));await go(39,74,0);
if(full(new V(39,74,1)))await go(39,75,1);else await walk(39.5,1.5);if(!bot.entity.onGround||bot.entity.position.y<74-.08||bot.entity.position.y>75+.08)throw Error('row1 support absent');
await top(new V(39,73,0));await go(39,75,0);
await clearSlab(new V(39,74,1));await top(new V(39,73,1));
for(const z of [0,1]){await go(39,75,z);if(bot.blockAt(new V(40,76,z)).boundingBox==='empty')await top(new V(40,75,z));}await go(39,75,0);
await top(new V(39,74,1));await go(39,76,1);
await top(new V(39,74,0));await go(39,76,0);
for(const z of [0,1])for(const y of [75,76])if(bot.blockAt(new V(38,y+1,z)).boundingBox==='empty')await top(new V(38,y,z));
for(const z of [0,1])if(bot.blockAt(new V(40,77,z)).boundingBox==='empty')await top(new V(40,76,z),'cobbled_deepslate_slab');
await walk(39.5,.5);await bot.lookAt(new V(41,77.62,.5),true);bot.setControlState('forward',true);await bot.waitForTicks(5);bot.clearControlStates();await bot.waitForTicks(8);
const crystal=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(new V(42.5,77,.5))<.1);if(!crystal)throw Error('crystal absent');
await bot.unequip('hand');
for(const dy of [.65,1,1.4]){
await bot.lookAt(crystal.position.offset(0,dy,0),true);await bot.waitForTicks(3);
const target=bot.entityAtCursor(3),rays=[actualRay(bot.entity.eyeHeight,3),actualRay(bot.entity.height,3)],bodyRoot=bot.entity.position.distanceTo(crystal.position),eyeRoot=bot.entity.position.offset(0,bot.entity.eyeHeight,0).distanceTo(crystal.position);
const o={p:bot.entity.position.clone(),hp:bot.health,ground:bot.entity.onGround,bodyRoot,eyeRoot,dy,target:target&&{id:target.id,n:target.name,p:target.position},rays};console.log('ACTUAL_VIEW',JSON.stringify(o));
if(target?.id===crystal.id&&bodyRoot<=3&&eyeRoot<=3&&rays.every(r=>!r.hit)&&bot.entity.onGround&&Math.abs(bot.entity.position.y-76)<.06&&bot.health>=14){const before={hp:bot.health,p:bot.entity.position.clone(),id:crystal.id};bot.attack(crystal);await bot.waitForTicks(8);attack={before,after:{hp:bot.health,p:bot.entity.position.clone(),present:!!bot.entities[crystal.id],crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>({id:e.id,p:e.position}))}};console.log('ATTACK_EFFECT',JSON.stringify(attack));break;}
}
}catch(e){issue=String(e);console.log('ISSUE',issue)}finally{
bot.pathfinder.setGoal(null);bot.clearControlStates();
try{if(bot.game.dimension==='the_end'&&bot.health>0&&bot.entity.position.y>=74){
if(bot.entity.position.z>.9)await walk(39.5,.5);
for(const y of [75,74]){const p=new V(39,y,0);if(bot.entity.position.y>=y+1-.1&&bot.blockAt(p).name==='end_stone'){await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');const ray=await visible(p);if(!ray)throw Error('returnfloor not visible '+p);await bot.dig(bot.blockAt(p),'ignore',normals[ray.face]);await bot.waitForTicks(12);console.log('RETURN_LOWER',JSON.stringify({p:bot.entity.position,hp:bot.health}));}}}}
catch(e){console.log('LOWER_FAIL',String(e));}
for(const q of path.filter(q=>q.y<=bot.entity.position.y+.1).reverse()){try{await go(q.x,q.y,q.z)}catch(e){console.log('RETURN_FAIL',String(e));break;}}
bot.pathfinder.setGoal(null);bot.clearControlStates();}
return {issue,attack,reached,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,elapsed:Date.now()-begin,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))};
