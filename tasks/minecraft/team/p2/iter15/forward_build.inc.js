const OLDG=V([-132,63,-430]),MID=V([-132,62,-430]),FRONT=V([-131,62,-430]),NEWFOOT=V([-130,62,-430]);
async function slabRoof(q,ref){if(name(q)==='cobblestone_slab'&&B(q).getProperties().type==='bottom')return;if(!air(q))throw Error('ROOF_KIND_'+q);const it=bot.inventory.items().find(i=>i.name==='cobblestone_slab');if(!it)throw Error('ROOF_SLAB_STOCK');await bot.equip(it,'hand');bot.setControlState('sneak',true);try{await bot._placeBlockWithOptions(B(ref),V([1,0,0]),{forceLook:true,delta:V([1,.15,.5])});await t(4);}finally{stop();}if(name(q)!=='cobblestone_slab'||B(q).getProperties().type!=='bottom')throw Error('ROOF_BOTTOM_ACK');trace.push(['ROOF_BOTTOM',q.toArray()]);}
async function forwardBuild(){
 if(!pod(BACK)||name(OLDG)!=='spruce_fence_gate'||B(OLDG).getProperties().open||!full(MID)||stock()<1)throw Error('FORWARD_START');
 for(const q of [V([-132,61,-430]),V([-131,61,-430]),V([-132,64,-430]),V([-132,62,-431]),V([-132,63,-431]),V([-132,62,-429]),V([-132,63,-429]),V([-131,62,-431]),V([-131,63,-431]),V([-131,62,-429])])if(!full(q))throw Error('FORWARD_NATIVE_'+q);
 await cut(W.offset(0,1,0));await cut(W);await move(W,-132.35);await t(20);if(stock()<3)throw Error('INITIAL_ORDINARY_CAPS');
 await cut(MID);await t(20);if(stock()<4)throw Error('MID_ORDINARY_CAP');
 await put(V([-131,63,-429]));await put(NEWFOOT);await slabRoof(V([-131,64,-430]),V([-132,64,-430]));await slabRoof(V([-130,64,-430]),V([-131,64,-430]));
 if(stock()<2)throw Error('FORWARD_END_RESERVE');trace.push(['FORWARD_OUTER_PREPARED',stock(),bot.health]);
 await bot.unequip('hand');await bot.dig(B(OLDG),true);await t(12);if(!air(OLDG)||count('spruce_fence_gate')!==1)throw Error('FORWARD_GATE_RECLAIM');
 const gate=bot.inventory.items().find(i=>i.name==='spruce_fence_gate');await bot.equip(gate,'hand');bot.setControlState('sneak',true);try{await bot._placeBlockWithOptions(B(NEWFOOT),V([0,1,0]),{forceLook:true});await t(4);}finally{stop();}if(!gateClosed())throw Error('FORWARD_NEW_GATE_ACK');trace.push(['GATE_ADVANCED_TWO_CELLS',G.toArray(),bot.health]);
 await cut(FRONT);await move(MID);await move(FRONT,-130.8);await t(8);if(stock()<2||!gateClosed()||self.position.x>-130.70)throw Error('FORWARD_BODY_RESERVE');trace.push(['FORWARD_PHYSICAL_BODY',self.position.clone(),stock(),bot.health]);
}
async function forwardRetreat(){recovery=true;stop();live();const q=self.position.floored();if(q.equals(FRONT)){await move(MID);await move(W);}else if(q.equals(MID))await move(W);await backEnd();}
