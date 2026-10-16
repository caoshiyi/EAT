if(bot.vehicle)bot.dismount();await new Promise(r=>setTimeout(r,500));console.log('p',bot.entity.position,'mounted',!!bot.vehicle);
const b=Object.values(bot.entities).find(e=>e.name==='boat'&&bot.entity.position.distanceTo(e.position)<5);if(b){for(let i=0;i<8;i++){if(!bot.entities[b.id])break;bot.attack(b);await new Promise(r=>setTimeout(r,350));}}
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));
