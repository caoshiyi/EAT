let units=0,backOpened=false;
try{
 live();if(!bot.entity.position.floored().equals(V([-133,57,-430]))||!pod(V([-133,57,-430])))throw Error('W57_START');
 if(!full(V([-133,63,-430]))||!full(V([-132,60,-430]))||!full(LOW))throw Error('SOURCE_FLOOR_HOOD');
 for(let y=58;y<=62;y++)for(const [x,z]of[[-134,-430],[-133,-431],[-133,-429]])if(!full(V([x,y,z])))throw Error('SHAFT_NATIVE_OUTER_'+[x,y,z]);
 for(let y=58;y<=61;y++)if(!full(V([-132,y,-430])))throw Error('SHAFT_E_OUTER_'+y);
 if(!full(G)&&!air(G)&&name(G)!=='fire')throw Error('LOW_HEAD_KIND_'+name(G));
 for(let y=57;y<61;y++){
  let q=V([-133,y,-430]);if(y===60){if(name(G)==='fire'){await bot.unequip('hand');await bot.dig(B(G),true);await t(2);if(!air(G))throw Error('FIRE_EXTINGUISH_ACK');trace.push(['FIRE_EXTINGUISHED',bot.health]);}await put(G);if(!full(G))throw Error('LOW_HEAD_NOT_CAPPED');trace.push(['LOW_HEAD_CAPPED_BEFORE_LAST_RISE',bot.health]);}
  await cut(q.offset(0,2,0));const it=capNames.map(n=>bot.inventory.items().find(i=>i.name===n)).find(Boolean);if(!it||!full(q.offset(0,-1,0)))throw Error('PILLAR_INPUT');
  await bot.equip(it,'hand');bot.setControlState('jump',true);try{for(let k=0;k<22&&self.position.y<y+1.04;k++)await t();if(self.position.y<y+1.04)throw Error('JUMP_ACK');await bot._placeBlockWithOptions(B(q.offset(0,-1,0)),V([0,1,0]),{forceLook:'ignore'});}finally{bot.clearControlStates();}
  for(let k=0;k<30&&(!self.onGround||Math.abs(self.position.y-y-1)>.08);k++)await t();if(!self.onGround||Math.abs(self.position.y-y-1)>.08)throw Error('RISE_ACK');units++;trace.push(['RISE',y+1,stock(),bot.health]);
 }
 if(!pod(W))throw Error('W_LOW_NOT_FULL');trace.push(['W_LOW_FULL',bot.health,count('iron_sword'),stock()]);
 for(const q of faces(BACK)){if(q.equals(W)||q.equals(W.offset(0,1,0)))continue;if(!full(q))throw Error('BACK_POD_NATIVE_OUTER_'+q);}
 if(![BACK,BACK.offset(0,1,0)].every(q=>air(q)||full(q)))throw Error('BACK_POD_KIND');
 backOpened=true;await cut(BACK.offset(0,1,0));await cut(BACK);await move(BACK);await t(12);if(stock()<2)throw Error('BACK_END_ORDINARY_CAPS');
 await backEnd();
}catch(e){issue=e.message;trace.push(['ISSUE',issue,self.position.clone(),bot.health]);}
finally{
 recovery=true;stop();if(!lost)try{if(backOpened&&[W,BACK].some(q=>self.position.floored().equals(q)))await backEnd();else{const q=self.position.floored();if(q.x!==-133||q.z!==-430||q.y<57||q.y>61)throw Error('RECOVERY_BODY');for(const p of faces(q))if(!full(p))await put(p);if(!pod(q))throw Error('APPROACH_END_NOT_FULL');}}catch(e){endingIssue=e.message;trace.push(['END_FAILED',endingIssue,self.position.clone(),bot.health]);}cleanup();
}
return{issue,endingIssue,units,backOpened,trace,...snap(),cols:sourceSnapshot()};
