// P1 sandbox source qualification. No courier; hard stop protects shared token.
const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),startHP=bot.health,body=bot.entity,home=bot.entity.position.clone();
const endAt=Date.parse('2026-10-19T00:47:40Z');let dead=false,escape=false;
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count])});
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0);
const died=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null)};
const health=()=>{if(!escape&&bot.health<startHP){bot.clearControlStates();bot.pathfinder.setGoal(null)}};bot.on('death',died);bot.on('health',health);
function alive(){if(dead||bot.health<=0||bot.entity!==body||bot.game.dimension!=='overworld')throw Error('life changed');if(!escape&&bot.health<startHP)throw Error('forward HP loss');}
async function travel(goal,until,dig){alive();const m=new Movements(bot);m.canDig=dig;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=1;m.scafoldingBlocks=[];for(const n of['sweet_berry_bush','chest','barrel','spruce_log','snow','water','lava'])if(bot.registry.blocksByName[n])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);m.exclusionAreasStep.push(b=>['water','lava','sweet_berry_bush'].includes(b.name)?100:0);bot.pathfinder.setMovements(m);bot.pathfinder.setGoal(goal);try{let last=Date.now();while(Date.now()<until&&!goal.isEnd(bot.entity.position.floored())){await bot.waitForTicks(2);alive();if(Date.now()-last>2000){console.log('TRAVEL',JSON.stringify(state()));last=Date.now()}}}finally{bot.pathfinder.setGoal(null);bot.clearControlStates()}await bot.waitForTicks(3);alive();console.log('TRAVEL_END',JSON.stringify(state()));return goal.isEnd(bot.entity.position.floored());}
async function face(q){for(const d of[[.5,.5,.5],[.5,.2,.5],[.5,.8,.5]]){await bot.lookAt(q.offset(...d),true);alive();const c=bot.blockAtCursor(4.5);if(c?.position.equals(q))return c;}throw Error('no actual visible target '+q);}
try{
 console.log('SOURCE_PRE',JSON.stringify(state()));if(bot.health<8||count('dirt')!==1||!bot.entity.position.floored().equals(v(0,51,-30)))throw Error('source admission');
 const arrived=await travel(new goals.GoalNear(4,67,-22,2),Math.min(Date.now()+110000,endAt-30000),true);if(!arrived)throw Error('source route not reached within gate');
 console.log('BERRY_STANCE',JSON.stringify(state()));await bot.unequip('hand');alive();
 for(const q of bot.findBlocks({matching:b=>b.name==='sweet_berry_bush',maxDistance:5,count:8})){if(Date.now()>endAt-20000)break;const b=bot.blockAt(q);console.log('ACTUAL_BUSH',JSON.stringify({p:q,properties:b.getProperties()}));if(Number(b.getProperties().age)<2)continue;try{await face(q);const before=count('sweet_berries');alive();await bot.activateBlock(bot.blockAt(q));await bot.waitForTicks(10);alive();console.log('HARVEST',JSON.stringify({p:q,before,after:count('sweet_berries'),state:state()}))}catch(e){console.log('BUSH_REFUSED',String(e));}}
 const healUntil=Math.min(Date.now()+30000,endAt-15000);while(Date.now()<healUntil&&count('sweet_berries')&&bot.health<16){alive();if(bot.food<20){await bot.equip(bot.inventory.items().find(i=>i.name==='sweet_berries'),'hand');alive();await bot.consume();alive();console.log('ATE',JSON.stringify(state()))}await bot.waitForTicks(10);alive();}
 console.log('SOURCE_GATE',JSON.stringify(state()));
}catch(e){console.log('PRIMARY_FAILURE',String(e),JSON.stringify(state()))}
finally{
 escape=true;bot.pathfinder.setGoal(null);bot.clearControlStates();
 try{alive();await travel(new goals.GoalBlock(0,51,-30),endAt,false)}catch(e){console.log('RETURN_FAILURE',String(e),JSON.stringify(state()))}
 console.log('SOURCE_POST',JSON.stringify(state()));bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',died);bot.removeListener('health',health);
}return state();
