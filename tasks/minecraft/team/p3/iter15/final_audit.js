const self=bot.entity,dim=bot.game.dimension,p0=self.position.clone(),keys=['forward','back','left','right','jump','sprint','sneak'];
const before=Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)]));
bot.clearControlStates();bot.pathfinder.setGoal(null);bot.deactivateItem();
await bot.waitForTicks(4);
return{at:new Date().toISOString(),sameLife:bot.entity===self,dimension:bot.game.dimension,sameDimension:bot.game.dimension===dim,p:self.position.clone(),unchangedPosition:self.position.distanceTo(p0)<.01,hp:bot.health,food:bot.food,grounded:self.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),cursor:bot.inventory.selectedItem,before,after:Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)])),goal:bot.pathfinder.goal};
