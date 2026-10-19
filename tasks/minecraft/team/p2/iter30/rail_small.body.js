let entered=false;
try{console.log('SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(30.568221,58,-24.550919))>.2||bot.health!==10)throw Error('source mismatch');entered=true;await center(30.5,-24.5);await cut(v(30,60,-25));while(bot.entity.position.y<65)await stack();await place(v(30,64,-26));await center(30.5,-25.5);console.log('TRANSITION_B',JSON.stringify(snap()));await railDrop(v(30,63,-27));await railDrop(v(30,61,-26));await railDrop(v(30,59,-27));console.log('RAILS_COMPLETE',JSON.stringify(snap()));}
catch(e){console.log('FAILURE',String(e),JSON.stringify(snap()));}
finally{bot.clearControlStates();await sleep(20);cleanup();}return snap();
