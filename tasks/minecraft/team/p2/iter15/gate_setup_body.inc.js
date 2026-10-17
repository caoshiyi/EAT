let installed=false,openedW=false;
try{
 live();if(!pod(BACK)||stock()<2||!full(G)||!full(LOW))throw Error('SETUP_START');
 for(const q of faces(BACK))if(!full(q))throw Error('BACK_ENVELOPE');
 openedW=true;await cut(W.offset(0,1,0));await cut(W);await t(8);if(stock()<2)throw Error('ENDING_RESERVE');await move(W,-132.7);
 if(!full(W.offset(0,2,0))||!full(W.offset(0,-1,0))||!full(LOW))throw Error('W_FLOOR_ROOF');
 for(const a of[[-134,61,-430],[-134,62,-430],[-133,61,-429],[-133,62,-429]])if(!full(V(a)))throw Error('W_OUTER');
 const gate=bot.inventory.items().find(i=>i.name==='spruce_fence_gate');if(!gate)throw Error('GATE_ORDINARY');
 if(stock()<2||self.position.x>-132.23)throw Error('RECOVERY_OR_SETBACK');
 await cut(G);await bot.equip(gate,'hand');await bot.lookAt(G.offset(.5,.5,.5),true);bot.setControlState('sneak',true);try{await bot._placeBlockWithOptions(B(LOW),V([0,1,0]),{forceLook:true});await t(4);}finally{stop();}
 if(!gateClosed())throw Error('GATE_EW_CLOSED_ACK');installed=true;trace.push(['GATE_INSTALLED',B(G).getProperties(),B(G).shapes,self.position.clone(),bot.health]);
 const eye=self.position.offset(0,1.62,0);for(const y of[62.1,62.6,62.9]){const r=ray(new Vec3(eye.x,y,eye.z),new Vec3(-130.5,y,eye.z));if(r?.name!=='spruce_fence_gate')throw Error('GATE_HORIZONTAL_RAY_'+y+'_'+r?.name);}
 await t(8);
}catch(e){issue=e.message;trace.push(['ISSUE',issue,self.position.clone(),bot.health]);}
finally{recovery=true;stop();if(!lost&&openedW)try{await backEnd();}catch(e){endingIssue=e.message;trace.push(['END_FAILED',endingIssue,self.position.clone(),bot.health]);}cleanup();}
return{issue,endingIssue,installed,trace,...snap()};
