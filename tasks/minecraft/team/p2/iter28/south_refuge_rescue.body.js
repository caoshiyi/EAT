console.log('ENVIRONMENT G28-3 actualpost221 refuge50z2; protectedstatus+ordinaryflat rescue, notpassfor221');
const guard=makeOperationGuard(bot);try{
 console.log('ACTUAL_REFUGE_SOURCE',JSON.stringify({state:state(),faces:audit()}));if(bot.game.dimension!=='the_end'||bot.health!==10||!bot.entity.position.floored().equals(v(-16,50,2)))throw Error('actualrescue sourcechanged');
 guard.beginEscape('actualflatrescue');for(const q of[v(-16,51,1),v(-16,50,1)])if(!['air','cave_air'].includes(bot.blockAt(q)?.name))await cut(q,['end_stone']);
 const zpath=[v(-16,50,2)];for(let z=1;z>=-11;z--)zpath.push(v(-16,50,z));await continuousWalkSegment(zpath,guard);const xpath=[v(-16,50,-11)];for(let x=-15;x<=-11;x++)xpath.push(v(x,50,-11));await continuousWalkSegment(xpath,guard);await seal(true);console.log('ACTUAL_RESCUE_COMPLETE',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));try{await seal(true);}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
finally{console.log('ACTUAL_RESCUE_POST',JSON.stringify({state:state(),faces:audit()}));guard.close();stop();}return state();
