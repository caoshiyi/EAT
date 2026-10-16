const sleep=ms=>new Promise(r=>setTimeout(r,ms));console.log('mounted',!!bot.vehicle,'p',bot.entity.position);
if(!bot.vehicle)return;
await bot.lookAt(bot.entity.position.offset(-2,0,20),true);bot.moveVehicle(0,1);await sleep(3000);bot.moveVehicle(0,0);console.log('after',bot.entity.position,'v',bot.vehicle?.position);
