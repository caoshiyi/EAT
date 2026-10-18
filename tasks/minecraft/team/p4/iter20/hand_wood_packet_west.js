const V=require('vec3').Vec3;const hp=bot.health,begin=Date.now(),cuts=[],refusals=[];let issue=null;
function count(){return bot.inventory.items().filter(i=>i.name==='oak_planks').reduce((s,i)=>s+i.count,0);}
try{
 for(let pass=0;pass<1&&count()<12;pass++){
 const candidates=bot.findBlocks({matching:b=>b.name==='oak_planks',maxDistance:6,count:40}).filter(p=>p.y>=-35);
 let actual=0;
 for(const p of candidates){if(Date.now()-begin>65000||bot.health<hp)throw Error('health/budget');if(count()>=12)break;const b=bot.blockAt(p);if(b.name!=='oak_planks')continue;
 const aim=p.offset(.37,.05,.63);if(bot.entity.position.offset(0,1.62,0).distanceTo(aim)>4.5)continue;
 await bot.lookAt(aim,true);await bot.waitForTicks(2);const hit=bot.blockAtCursor(4.5);if(!hit||!hit.position.equals(p)){refusals.push({p,hit:hit&&hit.position});continue;}
 console.log('CUT_PRE',JSON.stringify({p,hit:hit.position,face:hit.face,intersect:hit.intersect,hp:bot.health}));await bot.dig(b,false,'raycast');await bot.waitForTicks(3);const n=bot.blockAt(p).name;if(n!=='air'&&n!=='cave_air')throw Error('no effect');cuts.push(p);actual++;
 }
 if(!actual)break;
 }
 await bot.waitForTicks(10);
}catch(e){issue=String(e);}finally{bot.clearControlStates();}
return {cuts,refusals,issue,elapsed:Date.now()-begin,pos:bot.entity.position,hp:bot.health,ordinaryWood:count(),inv:bot.inventory.items().map(i=>({n:i.name,c:i.count})),items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<7).map(e=>({id:e.id,p:e.position,meta:e.metadata}))};
