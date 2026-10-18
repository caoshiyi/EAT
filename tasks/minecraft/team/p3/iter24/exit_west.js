const{Vec3}=require('vec3');
for(const xyz of [[5,68,82],[5,67,82]]){let b=bot.blockAt(new Vec3(...xyz));console.log('CUT_PREFLIGHT',xyz,b?.name,bot.canSeeBlock(b));if(!b||b.name!=='dirt'||!bot.canSeeBlock(b)||b.position.distanceTo(bot.entity.position)>4.5)return 'refused';await bot.dig(b,false,'raycast');await bot.waitForTicks(12);console.log('AFTER',xyz,bot.blockAt(b.position)?.name,bot.inventory.items().map(i=>[i.name,i.count]));}
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=2;bot.pathfinder.setMovements(m);
const g=new goals.GoalBlock(5,66,81);console.log('MODEL',bot.pathfinder.getPathTo(m,g,1000));
try{await bot.pathfinder.goto(g);}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('ENDING',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));}
