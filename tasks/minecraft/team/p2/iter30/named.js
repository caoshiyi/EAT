async function named(q,name){
 if(bot.blockAt(q)?.name===name)return;
 for(const f of[1,4,5,2,3,0]){const ref=q.minus(dirs[f]);if(!full(ref))continue;try{await face(ref,f);}catch{continue;}
 const i=bot.inventory.items().find(i=>i.name===name);if(!i)throw Error('missing '+name);await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),dirs[f]);await sleep(2);
 console.log('NAMED_PLACE',JSON.stringify({q,name,actual:bot.blockAt(q)?.name,shapes:bot.blockAt(q)?.shapes,p:bot.entity.position}));if(bot.blockAt(q)?.name!==name)throw Error('named place post');return;}throw Error('named no actual face');
}
async function makeSlabs(){
 await cut(v(30,60,-25));await named(v(30,60,-25),'crafting_table');const table=bot.blockAt(v(30,60,-25));await face(table.position);
 const r=bot.recipesFor(bot.registry.itemsByName.blackstone_slab.id,null,1,table)[0];if(!r)throw Error('slab recipe unfunded');await bot.craft(r,1,table);await sleep(4);
 if(bot.currentWindow)bot.closeWindow(bot.currentWindow);if(count('blackstone_slab')!==6||count('blackstone')!==27)throw Error('slab receipt');console.log('SLABS_RECEIVED',JSON.stringify(snap()));
 await bot.unequip('hand');const f=await face(table.position);await bot.dig(bot.blockAt(table.position),'ignore',dirs[f.face]);await sleep(3);if(!air(table.position))throw Error('table open');console.log('TABLE_HAND_OPEN',JSON.stringify(snap()));
}
