'use strict';
// Host-only installed goto wrapper; never runs player code.
const {EventEmitter}=require('node:events'),assert=require('node:assert/strict');
const goto=require(process.cwd()+'/tools/mc_arena/node_modules/mineflayer-pathfinder/lib/goto');
(async()=>{
 const bot=new EventEmitter();
 bot.entity={position:{x:0,y:0,z:0}};
 const goal={isEnd:()=>false};
 bot.pathfinder={setGoal:()=>bot.emit('path_update',{status:'noPath',path:[]})};
 await goto(bot,goal);
 assert.equal(goal.isEnd(bot.entity.position),false);
 for(const event of ['path_stop','goal_reached','path_update','goal_updated'])assert.equal(bot.listenerCount(event),0);
 bot.pathfinder.setGoal=()=>bot.emit('path_update',{status:'noPath',path:[{}]});
 await assert.rejects(goto(bot,goal),{name:'NoPath'});
 console.log('PASS installed goto resolves empty noPath while goal is false; nonempty noPath rejects. Postcondition remains necessary.');
})().catch(e=>{console.error(e);process.exitCode=1});
