global.p1Go=async function(cfg){
 const m=new Movements(bot);m.canDig=cfg.dig!==false;m.allow1by1towers=false;m.liquidCost=100;m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;m.blocksToAvoid.add(bot.registry.blocksByName.water.id);for(const n of ['chest','crafting_table','furnace','white_bed'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
 let error=null;let timer;const start=bot.entity.position.clone();
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalNear(cfg.x,cfg.y,cfg.z,cfg.r||2)),new Promise((_,r)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bounded travel'))},cfg.ms||18000))])}catch(e){error=e.message}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates()}
 return {from:start.toString(),to:bot.entity.position.toString(),hp:bot.health,food:bot.food,under:bot.blockAt(bot.entity.position.offset(0,-1,0))?.name,error};
};
console.log('p1Go installed; bounded GoalNear, water avoided, maxDropDown2, no towers. Call with {x,y,z,r,ms,dig}.');
