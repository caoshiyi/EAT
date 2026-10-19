const source=bot.entity.position.clone(),hp=bot.health;
const row=tag=>({tag,at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,eyeHeight:bot.entity.eyeHeight,height:bot.entity.height,width:bot.entity.width,sneak:bot.getControlState('sneak'),ground:bot.entity.onGround});
bot.clearControlStates();bot.pathfinder.setGoal(null);
try{
if(bot.game.dimension!=='overworld'||bot.health!==20||source.y!==55)throw Error('pose source mismatch');
console.log('POSE',JSON.stringify(row('standing')));
bot.setControlState('sneak',true);
for(let k=0;k<6;k++){await bot.waitForTicks(1);console.log('POSE',JSON.stringify(row('sneak'+(k+1))));}
}finally{bot.clearControlStates();for(let k=0;k<4;k++){await bot.waitForTicks(1);console.log('POSE',JSON.stringify(row('release'+(k+1))));}console.log('POSE_END',JSON.stringify({positionUnchanged:bot.entity.position.distanceTo(source)<.001,healthUnchanged:bot.health===hp,...row('ending')}));}
