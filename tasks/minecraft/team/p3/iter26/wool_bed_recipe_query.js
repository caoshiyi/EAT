// Read-only public recipe API; no inventory mutation, craft, movement or interaction.
const V=bot.entity.position.constructor,table=bot.blockAt(new V(6,66,82));
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new V(6.5,67,82.5))>.05||table?.name!=='crafting_table')throw Error('source/table changed');
const name=id=>bot.registry.items[id]?.name??id;
const recipes={};for(const target of ['white_wool','white_bed','string']){const id=bot.registry.itemsByName[target].id;recipes[target]=bot.recipesAll(id,null,table).map(r=>({result:r.result,inShape:r.inShape?.map(row=>row.map(i=>i&&({id:i.id,name:name(i.id),count:i.count}))),ingredients:r.ingredients,delta:r.delta?.map(i=>({id:i.id,name:name(i.id),count:i.count})),requiresTable:r.requiresTable}));}
return{at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),recipes,warning:'API recipe model only; not a cobweb drop, funded craft, recipient adoption or explosion test.'};
