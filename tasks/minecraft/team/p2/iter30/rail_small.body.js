let entered=false;
try{console.log('SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(30.568221,58,-24.550919))>.2||bot.health!==10)throw Error('source mismatch');entered=true;await center(30.5,-24.5);await cut(v(30,60,-25));while(bot.entity.position.y<60)await stack();await center(30.5,-23.5);while(bot.entity.position.y<64)await stack();console.log('TRANSITION_B',JSON.stringify(snap()));await railDrop(v(30,62,-25));await railDrop(v(30,60,-26));await railDrop(v(29,58,-26));console.log('RAILS_COMPLETE',JSON.stringify(snap()));}
catch(e){console.log('FAILURE',String(e),JSON.stringify(snap()));}
finally{bot.clearControlStates();await sleep(20);cleanup();}return snap();
