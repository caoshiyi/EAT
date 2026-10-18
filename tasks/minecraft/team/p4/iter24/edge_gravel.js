bot.clearControlStates();bot.pathfinder.setGoal(null);
const base=bot.entity.position.floored(),e=base.offset(1,0,0),target=e.offset(0,1,0),started=Date.now();
const full=p=>!!bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const shell=()=>[base.offset(0,-1,0),e.offset(0,-1,0),base.offset(0,2,0),e.offset(0,2,0),base.offset(-1,0,0),base.offset(-1,1,0),e.offset(1,0,0),e.offset(1,1,0),...[-1,1].flatMap(z=>[base.offset(0,0,z),base.offset(0,1,z),e.offset(0,0,z),e.offset(0,1,z)])].map(p=>({p,n:bot.blockAt(p)?.name,full:full(p)}));
if(base.x!==-9||base.y!==26||base.z!==-38||bot.health!==20||bot.game.dimension!=='overworld'||!shell().every(c=>c.full)||!full(base.offset(0,-2,0)))throw Error('preflight changed');
console.log('PRE',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])}));
try{
 const b=bot.blockAt(target);if(b?.name!=='gravel'||!full(e)||!bot.canSeeBlock(b))throw Error('target changed');
 await bot.unequip('hand');await bot.lookAt(target.offset(.5,.5,.5),true);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(target)||!c.intersect||bot.entity.position.offset(0,bot.entity.eyeHeight,0).distanceTo(c.intersect)>4.5)throw Error('visibleface');
 console.log('DIG_PRE',JSON.stringify({target,hit:c.intersect,face:c.face}));
 await bot.dig(b,false,'raycast');
 for(let i=0;i<8;i++){await bot.waitForTicks(5);console.log('RECEIPT',JSON.stringify({ms:Date.now()-started,n:bot.blockAt(target)?.name,inv:bot.inventory.items().map(i=>[i.name,i.count]),items:Object.values(bot.entities).filter(a=>a.name==='item'&&a.position.distanceTo(target)<4).map(a=>({p:a.position,item:a.getDroppedItem?.()}))}));}
}finally{
 bot.clearControlStates();bot.pathfinder.setGoal(null);
 for(let i=0;i<3;i++){console.log('OUTER16',JSON.stringify({sample:i,p:bot.entity.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(a=>[a.name,a.count]),cells:shell(),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))}));await bot.waitForTicks(5);}
}
