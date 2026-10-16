// Reusable program source fragment. It does not execute until pasted into a bot program.
// #1206 and P2#1214 proved magma_cube: type='mob', kind='Hostile mobs'.
// type==='hostile' alone is insufficient. Piglin/hoglin and Enderman warrant
// explicit handling even where a version classifies them as neutral.
function p4Hazards(bot,{radius=14,origin=bot.entity.position,includeEndermen=true}={}){
 const names=new Set(['magma_cube','slime','spider','cave_spider','skeleton','stray','wither_skeleton','ghast','blaze','piglin','piglin_brute','hoglin','zoglin','creeper','zombie','zombie_villager','husk','drowned','phantom','witch']);
 if(includeEndermen)names.add('enderman');
 return Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&(e.type==='hostile'||e.kind==='Hostile mobs'||names.has(e.name))&&e.position.distanceTo(origin)<radius);
}
