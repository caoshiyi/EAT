const begin=Date.now(),hp0=bot.health;let minHP=Infinity,minCrystals=Infinity,last='',count=0;
for(let i=0;i<50;i++){
 const d=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),cs=Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>({id:e.id,p:e.position.clone()}));
 const hp=d?.metadata?.[9],key=JSON.stringify([d?.id,hp,cs.map(e=>e.id).sort((a,b)=>a-b)]);
 if(key!==last){console.log('EFFECT',JSON.stringify({elapsed:Date.now()-begin,dragon:d&&{id:d.id,hp,phase:d.metadata?.[16],p:d.position.clone()},crystals:cs,p1:bot.players.p1?.entity?.position?.clone(),p4:bot.players.p4?.entity?.position?.clone()}));last=key;}
 if(Number.isFinite(hp))minHP=Math.min(minHP,hp);minCrystals=Math.min(minCrystals,cs.length);count++;
 if(bot.game.dimension!=='the_end'||bot.health<hp0-.01)break;await bot.waitForTicks(2);
}
return{elapsed:Date.now()-begin,samples:count,minHP:Number.isFinite(minHP)?minHP:null,minCrystals,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,controls:bot.controlState,dimension:bot.game.dimension,inventory:bot.inventory.items().map(i=>({n:i.name,c:i.count,w:i.durabilityUsed})),shell:[-1,0,1,2].map(d=>{const b=bot.blockAt(bot.entity.position.floored().offset(0,d,0));return{d,n:b?.name,sh:b?.shapes}})};
