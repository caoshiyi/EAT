let entered=false;
try{console.log('SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(30.568221,58,-24.550919))>.1||bot.health!==10||count('end_stone')!==199)throw Error('source mismatch');entered=true;await center(30.5,-24.5);await cut(v(30,60,-25));for(let k=0;k<3;k++)await stack();console.log('THREE_UP',JSON.stringify(snap()));}
catch(e){console.log('FAILURE',String(e),JSON.stringify(snap()));}
finally{if(entered&&!died)try{while(bot.entity.position.y>58.03)await down();await place(v(30,60,-25));console.log('ENDING',JSON.stringify(snap()));}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(snap()));}await sleep(20);cleanup();}return snap();
