console.log('ENVIRONMENT G28-2 actual post208 OWrespawn surface20HP; small normalwoodpath+3logs, no claimed supplies');
const start=bot.entity.position.clone(),hp=bot.health;const target=v(4,67,-23);let success=false;
try{if(bot.game.dimension!=='overworld'||bot.health!==20||bot.inventory.items().length)throw Error('actual respawn sourcechanged');
 await travel(v(3,66,-31),20000,1,false,18);console.log('SMALL_SURFACE_PATH',JSON.stringify(state()));
 await travel(v(4,67,-24),25000,1,false,18);console.log('WOOD_APPROACH',JSON.stringify(state()));
 const logs=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:4,count:20}).sort((a,b)=>a.y-b.y);for(const q of logs){if(count('spruce_log')>=3)break;await cut(q,['spruce_log']);await sleep(10);if(bot.health<18)throw Error('HP retired');}
 if(count('spruce_log')<3){console.log('WOOD_NEAR_DROPS',JSON.stringify(Object.values(bot.entities).filter(e=>e.name==='item').map(e=>({p:e.position,id:e.id}))));for(const e of Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<4)){try{await travel(e.position.floored(),5000,1,false,18);}catch{}}}
 success=count('spruce_log')>=3;console.log('ACTUAL_WOOD_RESULT',JSON.stringify({state:state(),success}));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));}
finally{stop();console.log('ACTUAL_RESPAWN_GATHER_POST',JSON.stringify({state:state(),success,nearAnimals:Object.values(bot.entities).filter(e=>['cow','pig','sheep','chicken'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:e.position}))}));}return state();
