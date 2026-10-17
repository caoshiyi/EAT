bot.clearControlStates();bot.pathfinder.setGoal(null);const self=bot.entity,start=Date.now(),p=self.position.floored(),hp=bot.health,keys=['forward','back','left','right','jump','sprint','sneak'];
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),faces=[p.offset(0,-1,0),p.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[p.offset(x,0,z),p.offset(x,1,z)])];
let issue=null,trace=[];const sample=stage=>trace.push({stage,at:Date.now(),p:self.position.clone(),v:self.velocity.clone(),onGround:self.onGround,height:self.height,physics:bot.physics.playerHeight,pose:self.metadata?.[6]??null});
function check(){if(bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<hp||Date.now()-start>4000||Date.now()>1792250260000)throw Error('LIFE_TIME')}
try{if(bot.game.dimension!=='overworld'||self.position.distanceTo(new(require('vec3').Vec3)(129.5,-36,2274.5))>.1||!self.onGround||self.height!==1.8||bot.physics.playerHeight!==1.8||!faces.every(full))throw Error('CLOSED_TWO_HIGH_ORIGIN');
 sample('before');bot.setControlState('jump',true);await bot.waitForTicks(1);check();sample('after_jump_1');bot.setControlState('jump',false);await bot.waitForTicks(1);check();sample('after_release_1_FIXED_ATTACK_POINT');
 for(let n=0;n<8;n++){await bot.waitForTicks(1);check();sample('settle_'+n)}
 if(!self.onGround||Math.abs(self.position.y-p.y)>.08||!faces.every(full))throw Error('ENDING');
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}
return{issue,trace,closed:faces.every(full),hp:bot.health,food:bot.food,p:bot.entity.position.clone(),controls:Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)])),limit:'actual local jump physics only; no attack/server fallDistance/critical damage proof'};
