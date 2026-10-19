async function stepStair(q){
 forward('step begin');const a=bot.entity.position.floored(),center=q.offset(.5,0,.5);
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||Math.abs(q.y-a.y)>1)throw Error('stairgeometry');
 if(!full(q.offset(0,-1,0)))throw Error('stairactualsupport '+q);
 if(q.y>a.y&&full(a.offset(0,2,0))){await cut(a.offset(0,2,0),['end_stone','basalt']);forward('after ownheadcut');}
 if(q.y<a.y&&full(q.offset(0,2,0))){await cut(q.offset(0,2,0),['end_stone','basalt']);forward('after downheadcut');}
 for(const cell of[q.offset(0,1,0),q]){const b=bot.blockAt(cell);if(!['air','cave_air'].includes(b?.name)){await cut(cell,['end_stone','basalt']);forward('after nextcut');}}
 const started=Date.now();try{while(Date.now()-started<3500){
  forward('step loop');if(bot.entity.position.distanceTo(center)<.16&&bot.entity.onGround)break;
  await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);forward('after steplook');
  bot.setControlState('forward',true);if(q.y>a.y)bot.setControlState('jump',true);
  await sleep(1);forward('after step tick');bot.setControlState('forward',false);bot.setControlState('jump',false);
  await sleep(1);forward('after step settle');if(bot.entity.position.y<q.y-1.1)throw Error('fellbelowstair');
 }}finally{bot.clearControlStates();}
 await sleep(5);forward('step post');if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||bot.entity.position.distanceTo(center)>.25)throw Error('stairpost');
 console.log('ACTUAL_STAIR',JSON.stringify({at:new Date().toISOString(),target:q,p:bot.entity.position,hp:bot.health}));
}
