console.log('ENVIRONMENT G28-2 damagedOWsurface emergency actualsoil3DOWN+seal, no unqualified supplies');
try{
 if(bot.game.dimension!=='overworld'||bot.health<=0)throw Error('actualsource lifechanged');console.log('ACTUAL_REFUGE_START',JSON.stringify(state()));bot.pathfinder.setGoal(null);bot.clearControlStates();
 const q=bot.entity.position.floored();await flat(q.offset(.5,0,.5));
 for(let k=0;k<3;k++){alive();const a=bot.entity.position.floored(),b=bot.blockAt(a.offset(0,-1,0));if(!['grass_block','dirt','stone'].includes(b?.name)||!full(a.offset(0,-2,0)))throw Error('actualsoil/support unavailable');await cut(b.position,[b.name]);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-(a.y-1))>.03)throw Error('actualsoil landing');}
 await seal(true);console.log('ACTUAL_REFUGE_COMPLETE',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));try{await seal(true);}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
finally{console.log('ACTUAL_SURFACE_REFUGE_POST',JSON.stringify({state:state(),faces:audit()}));stop();}return state();
