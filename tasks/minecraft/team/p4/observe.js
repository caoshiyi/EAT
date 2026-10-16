const names=['oak_log','birch_log','spruce_log','coal_ore','iron_ore','crafting_table','water'];
for(const name of names){const id=bot.registry.blocksByName[name]?.id;if(id)console.log(name,bot.findBlocks({matching:id,maxDistance:48,count:6}).map(p=>p.toString()));}
console.log('near mobs',Object.values(bot.entities).filter(e=>e.type==='mob').map(e=>({name:e.name,pos:e.position.toString()})));
