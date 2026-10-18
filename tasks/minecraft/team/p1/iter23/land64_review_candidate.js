// Reviewed methods/P1_RECEIPT_REVIEW.md; expected5 for all receipts. One changed-depth receipt test, no crafting or subsequent travel.
const V=bot.entity.position.constructor;bot.pathfinder.setGoal(null);bot.clearControlStates();
const p=new V(10,64,-37),dirs=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];let lost=false;const death=()=>lost=true;bot.on('death',death);
try{
 if(bot.entity.position.distanceTo(new V(10.5,65,-36.32368))>.15||bot.health<20||bot.game.dimension!=='overworld')throw Error('start changed');
 if(bot.blockAt(p).name!=='stone'||!bot.blockAt(p.offset(0,-1,0)).shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))throw Error('floor or support changed');
 for(const dx of[-1,0,1])for(const dz of[-1,0,1])for(const y of[63,64,65])if(/water|lava/.test(bot.blockAt(new V(10+dx,y,-37+dz)).name))throw Error('fluid adjacent');
 const item=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!item)throw Error('no actual tool');await bot.equip(item,'hand');await bot.lookAt(p.offset(.5,1,.5),true);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(p)||!c.intersect||[bot.entity.eyeHeight,1.8].some(h=>bot.entity.position.offset(0,h,0).distanceTo(c.intersect)>4.5))throw Error('target hidden/outside reach');
 console.log('PRE',JSON.stringify({p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),target:p,hit:c.intersect,face:c.face}));
 await bot.dig(bot.blockAt(p),'ignore',dirs[c.face]);await bot.waitForTicks(30);
 console.log('POST',JSON.stringify({lost,p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),ground:bot.entity.onGround,drops:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>({p:e.position,item:e.getDroppedItem?.()}))}));
 if(lost||bot.health<20||!bot.entity.onGround||Math.abs(bot.entity.position.y-64)>.1)throw Error('unexpected landing');
}finally{const base=bot.entity.position.floored();console.log('TERMINAL_GEOMETRY',JSON.stringify({p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),cells:[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const b=bot.blockAt(base.offset(...d));return{p:b?.position,n:b?.name,full:b?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1')};})}));bot.removeListener('death',death);bot.clearControlStates();bot.pathfinder.setGoal(null);}
