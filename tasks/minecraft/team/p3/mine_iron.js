global.p3mine={names:['iron_ore'],limit:12};
// Required: appropriate pick in inventory, target blocks nearby. Configure global.p3mine before copying body.
const cfg=global.p3mine||{names:['stone'],limit:12};
const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const tools=bot.inventory.items().filter(i=>/pickaxe$/.test(i.name));
const rank=n=>['wooden_pickaxe','stone_pickaxe','iron_pickaxe','diamond_pickaxe','netherite_pickaxe'].indexOf(n);
tools.sort((a,b)=>rank(b.name)-rank(a.name));if(!tools.length)throw Error('pickaxe required');await bot.equip(tools[0],'hand');
const start=Date.now();let dug=0;
for(let n=0;n<cfg.limit&&Date.now()-start<45000;n++){
 const ps=bot.findBlocks({matching:b=>cfg.names.includes(b.name),maxDistance:20,count:150});
 let b=ps.map(p=>bot.blockAt(p)).find(b=>bot.canDigBlock(b)&&b.position.y>=bot.entity.position.y-4&&b.position.distanceTo(bot.entity.position)>1.2);
 if(!b){console.log('no local target');break;}
 const p=b.position.clone();await bot.equip(tools[0],'hand');await bot.dig(b);await bot.waitForTicks(3);console.log('dug',b.name,p.toString(),'after',bot.blockAt(p).name);dug++;
 const drops=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(p)<6);
 const d=drops.sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];
 if(d)try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.6));}catch(e){console.log('pickup path',e.message);bot.pathfinder.stop();}
 await bot.waitForTicks(5);
}
return {dug,pos:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};
