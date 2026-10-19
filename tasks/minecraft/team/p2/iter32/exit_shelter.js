async function exitShelter(){
 const p=bot.entity.position.floored();if(!boundary().every(f=>f.full))throw Error('source shelter changed');
 if(!bot.inventory.items().some(i=>i.name==='crafting_table')){const q=boundary().find(f=>f.n==='crafting_table')?.q;if(q){const b=await face(q),axe=bot.inventory.items().find(i=>i.name==='stone_axe');if(axe)await bot.equip(axe,'hand');await bot.dig(bot.blockAt(q),true,'raycast');await wait(14);console.log('TABLE_RECLAIM_RECEIPT',JSON.stringify(state()));}}

 if(global.p2ShelterKind==='carved'){const a=global.p2Door;if(!a)throw Error('carved door unknown');const e=v(a.x,a.y,a.z);await cut(e.offset(0,1,0));await cut(e);await walk(e.x,e.y,e.z,4000,1);global.p2ShelterKind='open';return;}
 if(global.p2ShelterKind!=='box'){const sy=p.y+3;console.log('ASCENT_FUND',JSON.stringify({carried:bot.inventory.items().filter(i=>['dirt','gravel','cobblestone','spruce_planks'].includes(i.name)).map(i=>[i.name,i.count]),cap:bot.blockAt(p.offset(0,2,0))?.name,needed:3}));while(bot.entity.position.y<sy-.01){try{await up();}catch(e){if(!String(e).includes('UPfund'))throw e;const a=bot.entity.position.floored();let out=false;for(const d of[v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)]){const q=a.plus(d).offset(0,1,0);if(full(q.offset(0,-1,0))&&bot.blockAt(q)?.name==='air'&&bot.blockAt(q.offset(0,1,0))?.name==='air'){console.log('NATIVE_RIM_EXIT',q);await walk(q.x,q.y,q.z,4500,1);out=true;break;}}if(!out)throw e;break;}}global.p2ShelterKind='open';return;}
 console.log('BOX_RECLAIM_SOURCE',JSON.stringify(state()));
 const ds=[v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)];const pieces=[p.offset(0,2,0),...ds.flatMap(d=>[p.plus(d).offset(0,1,0),p.plus(d)])];
 for(const q of pieces){if(['dirt','cobblestone','spruce_planks'].includes(bot.blockAt(q)?.name))await cut(q);}
 for(const d of ds){const q=p.plus(d).offset(0,2,0);if(['dirt','cobblestone','spruce_planks'].includes(bot.blockAt(q)?.name))await cut(q);}
 await wait(12);for(const d of ds){const q=p.plus(d);if(full(q.offset(0,-1,0))&&bot.blockAt(q)?.name==='air'&&bot.blockAt(q.offset(0,1,0))?.name==='air'){await walk(q.x,q.y,q.z,2500,1);await wait(8);}}
 console.log('BOX_RECLAIM_RECEIPT',JSON.stringify(state()));global.p2ShelterKind='open';
 if(['dirt','cobblestone','spruce_planks'].reduce((n,name)=>n+bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0),0)<10)throw Error('portable ending funding not retained');
}
async function finishShelter(){
 try{await bury();global.p2ShelterKind='buried';}catch(e){if(!String(e).includes('no natural3deep ending'))throw e;console.log('ENDING_STRATEGY_SWITCH',String(e));try{await carveRoom();}catch(c){if(!String(c).includes('no carved room admission'))throw c;await makeBox();global.p2ShelterKind='box';}}
 console.log('ENDING_KIND',global.p2ShelterKind,JSON.stringify({...state(),faces:boundary()}));
}
