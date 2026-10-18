// Fresh, observation-only probe. No attack/interaction, no inherited geometry helper.
if(bot.game.dimension!=='the_end')return {refused:'not End'};
const hp=bot.health,pos=bot.entity.position.clone(),out=[];
for(const e of Object.values(bot.entities).filter(e=>e.name==='end_crystal').sort((a,b)=>a.position.distanceTo(pos)-b.position.distanceTo(pos)).slice(0,3)){
 if(bot.health<hp||bot.entity.position.distanceTo(pos)>.3)return {out,aborted:'body/health changed'};
 const cloud=Object.values(bot.entities).find(v=>v.name==='area_effect_cloud'&&v.position.distanceTo(pos)<9);if(cloud)return {out,aborted:'near cloud',cloud:cloud.position};
 const aim=e.position.offset(.07,.7,.09);await bot.lookAt(aim,true);await bot.waitForTicks(2);
 const hit=bot.blockAtCursor(128),entity=bot.entityAtCursor(128);
 out.push({crystalId:e.id,pos:e.position.clone(),aim,eyeDistance:pos.offset(0,1.62,0).distanceTo(aim),nearestBlock:hit&&{p:hit.position,n:hit.name},cursorEntity:entity&&{id:entity.id,n:entity.name,p:entity.position.clone()},inClientReach:pos.offset(0,1.62,0).distanceTo(aim)<=3});
}
return {out,hp:bot.health,pos:bot.entity.position,physicalEffect:'none: observation only'};
