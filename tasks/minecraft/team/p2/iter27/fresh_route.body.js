console.log('ENVIRONMENT SANDBOX G27-2 fresh LIVE58/10/Snow4; rapid-method approach and lower refuge');
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(5,58,3))||bot.health!==10||count('snowball')!==4)throw Error('actualcopychanged');
 while(bot.entity.position.y>50.03){alive();const a=bot.entity.position.floored();if(!full(a.offset(0,-2,0)))throw Error('downsupport');await cut(a.offset(0,-1,0),['basalt','blackstone','end_stone']);await sleep(7);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y+1)>.03)throw Error('downpost');}
 for(let k=0;k<35;k++){const a=bot.entity.position.floored();if(a.z>-11)await stepCovered(0,-1);else if(a.x>-11)await stepCovered(-1,0);else break;}
 for(let k=0;k<8;k++){const a=bot.entity.position.floored();if(full(a.offset(0,2,0)))await cut(a.offset(0,2,0),['end_stone']);await pillar('basalt');if(bot.health<10)throw Error('approachHP');}
 await seal(true);console.log('LOWER_REFUGE_READY',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));try{await seal(true);}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}finally{stop();}return state();
