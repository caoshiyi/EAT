console.log('SOURCE',JSON.stringify(state()));const hp=bot.health;let transitioned=false;
try{if(bot.game.dimension!=='overworld'||!bot.entity.position.floored().equals(v(8,68,89))||count('cobblestone')<10)throw Error('portal source');
for(const q of [v(7,69,89),v(7,68,89)])await cut(q);await place(v(7,67,89),'cobblestone');await move(v(7,68,89));await move(v(6,68,89));await cut(v(6,68,90));await move(v(6,68,90));
if(bot.blockAt(v(6,68,91))?.name!=='nether_portal')throw Error('inactive portal');
const t=Date.now();while(bot.game.dimension==='overworld'&&Date.now()-t<12000){if(bot.health<hp)throw Error('portal hurt');await bot.lookAt(v(6.5,bot.entity.position.y+bot.entity.eyeHeight,91.5),true);bot.setControlState('forward',bot.entity.position.z<91.5);await wait(1);}stop();if(bot.game.dimension!=='the_nether')throw Error('no transition');transitioned=true;await wait(8);console.log('NETHER_RECEIPT',JSON.stringify(state()));await move(v(3,65,4));
}catch(e){console.log('FAIL',String(e),JSON.stringify(state()));}finally{stop();console.log('FINAL',JSON.stringify(state()));}
