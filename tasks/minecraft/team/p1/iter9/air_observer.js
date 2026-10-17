// Observation only. Scoped self-entity metadata freshness; no controls, movement or edited metadata.
const {Vec3}=require('vec3');
const airKey=bot.registry.entitiesByName.player.metadataKeys.indexOf('air_supply');
let epoch=0,fresh=null,airPackets=0,otherAirPackets=0,discontinuities=0;
const invalidate=()=>{epoch++;fresh=null;discontinuities++;};
const receive=p=>{const a=p.metadata?.find(m=>m.key===airKey);if(!a)return;if(p.entityId===bot.entity?.id){fresh={raw:a.value,id:p.entityId,epoch,receivedAt:Date.now()};airPackets++;}else otherAirPackets++;};
function observe(){const p=bot.entity.position.clone();const eye=p.offset(0,bot.entity.eyeHeight??1.62,0);const b=bot.blockAt(eye);const local=b?eye.minus(b.position):null;const eyeInShape=!!(b&&local&&b.shapes.some(s=>local.x>=s[0]&&local.x<s[3]&&local.y>=s[1]&&local.y<s[4]&&local.z>=s[2]&&local.z<s[5]));return{p,hp:bot.health,food:bot.food,eye,head:b?.name,headProperties:b?.getProperties(),eyeInShape,headFluidKnown:b?['water','bubble_column'].includes(b.name)||!!b.getProperties().waterlogged:null,cachedAir:bot.entity.metadata?.[airKey],freshAir:fresh&&fresh.id===bot.entity.id&&fresh.epoch===epoch?fresh:null,globalAir:bot.oxygenLevel,feetWet:bot.entity.isInWater,ground:bot.entity.onGround,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};}
bot._client.on('entity_metadata',receive);bot.on('death',invalidate);bot.on('respawn',invalidate);
try{console.log('AIR_OBSERVE_BEFORE',JSON.stringify(observe()));await bot.waitForTicks(30);console.log('AIR_OBSERVE_AFTER',JSON.stringify(observe()));console.log('AIR_RECEIPTS',{airKey,airPackets,otherAirPackets,discontinuities});}
finally{bot._client.removeListener('entity_metadata',receive);bot.removeListener('death',invalidate);bot.removeListener('respawn',invalidate);}
