console.log('ENVIRONMENT SANDBOX G27-1 freshly copied LIVE58/10HP/Snow4; provenance clarification ITER27_EVIDENCE read; helper claims independently rechecked here');
try {
 console.log('START',JSON.stringify(state()));
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(5,58,3))||bot.health!==10||count('snowball')!==4)throw Error('copy mismatch');
 for(let k=0;k<2;k++){alive();const a=bot.entity.position.floored();if(!full(a.offset(0,-2,0)))throw Error('down support absent');await cut(a.offset(0,-1,0),['basalt','end_stone','blackstone']);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y+1)>.03)throw Error('down postcondition');}
 await seal(); console.log('TRIAL_DESCENT_RETAINED',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));try{await seal();}catch(f){console.log('RECOVERY_FAILURE',String(f));}}finally{stop();}return state();
