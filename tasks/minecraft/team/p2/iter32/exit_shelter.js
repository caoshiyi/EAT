async function exitShelter(){
 const p=bot.entity.position.floored();if(!boundary().every(f=>f.full))throw Error('source shelter changed');
 if(global.p2ShelterKind!=='box'){const sy=p.y+3;while(bot.entity.position.y<sy-.01)await up();global.p2ShelterKind='open';return;}
 console.log('BOX_RECLAIM_SOURCE',JSON.stringify(state()));
 const ds=[v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)];const pieces=[p.offset(0,2,0),...ds.flatMap(d=>[p.plus(d).offset(0,1,0),p.plus(d)])];
 for(const q of pieces){if(['dirt','cobblestone','spruce_planks'].includes(bot.blockAt(q)?.name))await cut(q);}
 for(const d of ds){const q=p.plus(d).offset(0,2,0);if(['dirt','cobblestone','spruce_planks'].includes(bot.blockAt(q)?.name))await cut(q);}
 await wait(12);for(const d of ds){const q=p.plus(d);if(full(q.offset(0,-1,0))&&bot.blockAt(q)?.name==='air'&&bot.blockAt(q.offset(0,1,0))?.name==='air'){await walk(q.x,q.y,q.z,2500,1);await wait(8);}}
 console.log('BOX_RECLAIM_RECEIPT',JSON.stringify(state()));global.p2ShelterKind='open';
 if(['dirt','cobblestone','spruce_planks'].reduce((n,name)=>n+bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0),0)<10)throw Error('portable ending funding not retained');
}
async function finishShelter(){
 try{await bury();global.p2ShelterKind='buried';}catch(e){if(!String(e).includes('no natural3deep ending'))throw e;console.log('ENDING_STRATEGY_SWITCH',String(e));await makeBox();global.p2ShelterKind='box';}
 console.log('ENDING_KIND',global.p2ShelterKind,JSON.stringify({...state(),faces:boundary()}));
}
