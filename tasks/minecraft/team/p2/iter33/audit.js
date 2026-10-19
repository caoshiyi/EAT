bot.pathfinder.setGoal(null);bot.clearControlStates();
const p=bot.entity.position;const V=p.constructor;
console.log('STATE',JSON.stringify({p,hp:bot.health,food:bot.food,dim:bot.game.dimension,time:bot.time.timeOfDay,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),kind:global.p2ShelterKind}));
const b=[];for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)for(let y=-2;y<=4;y++){const q=p.floored().offset(x,y,z),v=bot.blockAt(q);b.push([q,v?.name,v?.shapes]);}console.log('LOCAL',JSON.stringify(b));
for(const names of [['sweet_berry_bush'],['spruce_log','oak_log','birch_log'],['wheat','hay_block','carrots','potatoes','brown_mushroom','red_mushroom']])console.log('POI',JSON.stringify({names,positions:bot.findBlocks({matching:b=>!!b&&names.includes(b.name),maxDistance:64,count:20}).map(q=>[q,bot.blockAt(q)?.name,bot.blockAt(q)?.getProperties()])}));
console.log('ENTITIES',JSON.stringify(Object.values(bot.entities).map(e=>({id:e.id,n:e.name,p:e.position,d:p.distanceTo(e.position)})).filter(e=>e.d<65)));
return {p:bot.entity.position,hp:bot.health,food:bot.food};
