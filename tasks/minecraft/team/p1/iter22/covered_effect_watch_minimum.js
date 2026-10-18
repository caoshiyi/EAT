bot.pathfinder.setGoal(null);bot.clearControlStates();const V=bot.entity.position.constructor,start=Date.now(),hp=bot.health,phases={},sampled=[],changes=[];let old='',minBoss=Infinity,minToCandidate=Infinity,minRec=null;
for(let n=0;n<500;n++){
 const d=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),cs=Object.values(bot.entities).filter(e=>e.name==='end_crystal');
 const root=d?.position.clone(),phase=d?.metadata?.[16],bossHP=d?.metadata?.[9];phases[phase]=(phases[phase]||0)+1;
 const dist=root?.distanceTo(new V(3.5,60.5,.5));if(Number.isFinite(bossHP))minBoss=Math.min(minBoss,bossHP);const newMin=Number.isFinite(dist)&&dist<minToCandidate;if(newMin)minToCandidate=dist;
 const s={t:Date.now()-start,root,phase,bossHP,crystals:cs.length,distToCANDIDATE:dist,p2:bot.players.p2?.entity?.position?.clone(),ownHP:bot.health};
 if(newMin)minRec={...s};
 const key=JSON.stringify([d?.id,phase,bossHP,cs.length]);if(key!==old){changes.push(s);console.log('CHANGE',JSON.stringify(s));old=key;}if(n%50===0){sampled.push(s);console.log('SAMPLE',JSON.stringify(s));}
 if(bot.game.dimension!=='the_end'||bot.health!==hp)break;await bot.waitForTicks(2);
}
return {elapsed:Date.now()-start,p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState,phases,minBoss,minToCANDIDATE:minToCandidate,minRec,bedCells:[[3,60,0],[3,60,1]].map(a=>{const p=new V(...a),b=bot.blockAt(p);return {p,n:b?.name,props:b?.getProperties()}}),sampled,changes};
