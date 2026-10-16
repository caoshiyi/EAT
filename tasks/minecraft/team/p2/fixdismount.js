const sleep=ms=>new Promise(r=>setTimeout(r,ms));const boat=Object.values(bot.entities).find(e=>e.name==='boat'&&bot.entity.position.distanceTo(e.position)<5);if(!boat)throw Error('boat missing');
const packets=[];const listener=p=>{packets.push(p);console.log('passenger packet',p);};bot._client.on('set_passengers',listener);
bot.mount(boat);await sleep(500);bot.dismount();await sleep(800);bot._client.removeListener('set_passengers',listener);
if(packets.some(p=>p.entityId===boat.id&&p.passengers.length===0)){bot.vehicle=null;console.log('cleared stale client vehicle after authoritative empty passengers');}
console.log('vehicle',bot.vehicle?.id);if(!bot.vehicle){await bot.lookAt(bot.entity.position.offset(4,0,-2),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(60);bot.clearControlStates();console.log('moved',bot.entity.position);}
