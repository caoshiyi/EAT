// Extracted from P4 #2702 actual success, not a new traversal guarantee.
// Caller owns only its player. P3 owns the door; this function never opens/closes it.
async function p4ProvenManualExit(bot) {
  let discontinuity=false;
  const stop=()=>{discontinuity=true;bot.clearControlStates()};
  bot.on('death',stop);bot.on('respawn',stop);
  const hp=bot.health;
  const guard=()=>{if(discontinuity||bot.game.dimension!=='overworld'||bot.health<hp-.1)throw Error('EXIT_LIFE_DAMAGE');};
  const tick=async n=>{guard();await bot.waitForTicks(n);guard();};
  try {
    bot.pathfinder.setGoal(null);bot.clearControlStates();
    const until=Date.now()+30000;
    while(Date.now()<until&&!bot.blockAt(bot.entity.position.floored().offset(0,0,-1))?.getProperties().open) {
      const {Vec3}=require('vec3');if(bot.blockAt(new Vec3(6,67,81))?.getProperties().open)break;
      await tick(3);
    }
    const {Vec3}=require('vec3');
    if(!bot.blockAt(new Vec3(6,67,81))?.getProperties().open)throw Error('EXIT_NO_ACTUAL_OPEN');
    for(let k=0;k<20&&Math.abs(bot.entity.position.x-6.59375)>.035;k++){
      await bot.lookAt(bot.entity.position.offset(Math.sign(6.59375-bot.entity.position.x)*2,-.5,0),true);
      await tick(2);bot.setControlState('sneak',true);bot.setControlState('forward',true);await tick(1);bot.clearControlStates();
    }
    if(Math.abs(bot.entity.position.x-6.59375)>.08)throw Error('EXIT_ALIGNMENT');
    await bot.lookAt(bot.entity.position.offset(0,-.5,-2),true);await tick(3);
    for(let k=0;k<60&&bot.entity.position.z>79.4;k++){
      guard();if(bot.entity.position.y<65.7||Math.abs(bot.entity.position.x-6.59375)>.35)throw Error('EXIT_BODY_GUARD');
      bot.setControlState('forward',true);await tick(1);
    }
    bot.clearControlStates();await tick(4);
    if(bot.entity.position.z>79.5||!bot.entity.onGround)throw Error('EXIT_NOT_ARRIVED');
    return {position:bot.entity.position.clone(),health:bot.health};
  } finally {bot.clearControlStates();bot.removeListener('death',stop);bot.removeListener('respawn',stop);}
}
