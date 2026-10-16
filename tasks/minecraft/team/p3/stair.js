// Descend north safely one tile per step. Requires stone pick, solid support. Stops on fluid/open shaft.
const m=new Movements(bot);m.canDig=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe');if(!pick)throw Error('stone pick required');
for(let i=0;i<7;i++){
 const p=bot.entity.position.floored();const q=p.offset(0,-1,-1);
 const support=bot.blockAt(q.offset(0,-1,0));if(!support||support.boundingBox!=='block'||/lava|water/.test(support.name)){console.log('unsafe support',q,support?.name);break;}
 const bs=[bot.blockAt(q.offset(0,2,0)),bot.blockAt(q.offset(0,1,0)),bot.blockAt(q)];
 if(bs.some(b=>!b||/lava|water/.test(b.name))){console.log('fluid/unknown');break;}
 for(const b of bs){if(b.boundingBox==='empty')continue;await bot.equip(pick,'hand');await bot.dig(b);console.log('cleared',b.name,b.position.toString());}
 try{await bot.pathfinder.goto(new goals.GoalBlock(q.x,q.y,q.z));}catch(e){console.log('step failed',e.message);bot.pathfinder.stop();break;}
 console.log('step',bot.entity.position.toString());
}
console.log('iron',bot.findBlocks({matching:bot.registry.blocksByName.iron_ore.id,maxDistance:10,count:40}));return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};
