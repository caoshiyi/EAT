// P2-only fixed Overworld Y-36 movement. Library defines functions; no standalone play.
function P2LocalMove(bot,deadline){
 const {Vec3}=require('vec3'),V=a=>new Vec3(...a),life=bot.entity,hp0=bot.health,start=life.position.floored(),visited=[start.clone()];let lost=false,ending=false;
 const stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)},full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);
 function discontinuity(){lost=true;stop();bot.stopDigging()}
 function hurt(){if(bot.health<hp0)stop()}
 for(const e of['death','respawn','end'])bot.on(e,discontinuity);bot.on('health',hurt);stop();
 function check(){if(lost||bot.entity!==life||bot.game.dimension!=='overworld'||bot.health<=0||Date.now()>deadline)throw Error('DISCONTINUITY_OR_TIME');if(!ending&&bot.health<hp0)throw Error('WORK_HURT')}
 function geometry(q){const p=life.position.floored();if(q.y!==-36||p.y!==-36||q.x<128||q.x>160||q.z<2239||q.z>2277||Math.abs(q.x-p.x)+Math.abs(q.z-p.z)>1)throw Error('FIXED_CARDINAL_LOCAL_SCOPE');if(!air(q)||!air(q.offset(0,1,0))||!full(q.offset(0,-1,0)))throw Error('ACTUAL_BODY_FLOOR_'+q);if(Object.values(bot.entities).some(e=>e.username&&e.id!==life.id&&Math.hypot(e.position.x-q.x-.5,e.position.z-q.z-.5)<.65))throw Error('CURRENT_PEER_DEST_'+q)}
 async function step(q){check();geometry(q);for(let n=0;n<50;n++){check();geometry(q);const d=Math.hypot(life.position.x-q.x-.5,life.position.z-q.z-.5);if(d<.10&&life.onGround){stop();return}await bot.lookAt(q.offset(.5,1.2,.5),true);bot.setControlState('sneak',d<.35);bot.setControlState('forward',true);await bot.waitForTicks(1)}throw Error('STEP_BOUND_'+q)}
 async function enter(a){const q=V(a);if(Date.now()+(visited.length+2)*3000>deadline)throw Error('RETURN_RESERVE');await step(q);if(!visited.at(-1).equals(q))visited.push(q.clone())}
 async function retreat(){ending=true;stop();try{await step(visited.at(-1));while(visited.length>1){await step(visited.at(-2));visited.pop()}}finally{stop()}}
 function close(){stop();for(const e of['death','respawn','end'])bot.removeListener(e,discontinuity);bot.removeListener('health',hurt)}
 return{enter,retreat,close,visited,life,full,start};
}
