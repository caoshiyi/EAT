let openedW=false,openedGate=false,swung=false,target=null,targetBefore=null,hits=[],dead=[],pGone=[],samples=0,projectileOverflow=0;const attackedIds=new Set();
const h=e=>{if(e.name==='blaze')hits.push({id:e.id,hp:e.metadata?.[9]??null,at:Date.now()})},d=e=>{if(e.name==='blaze'&&attackedIds.has(e.id))dead.push(e.id)};
const seenProj=new Map(),watch=()=>{samples++;for(const e of Object.values(bot.entities)){if(!['small_fireball','fireball'].includes(e.name)||e.position.distanceTo(self.position)>20)continue;const a={id:e.id,p:e.position.clone(),v:e.velocity?.clone(),closed:gateClosed(),hp:bot.health,at:Date.now()};seenProj.set(e.id,a);if(projectiles.length<70)projectiles.push(a);else projectileOverflow++;}},gone=e=>{if(seenProj.has(e.id))pGone.push({last:seenProj.get(e.id),goneAt:Date.now(),closed:gateClosed(),hp:bot.health})};
// Closest AABB point may be roof-occluded even when a deeper point on the same Blaze is visible.
function candidate(){const eye=self.position.offset(0,1.62,0),clamp=(v,l,h)=>Math.max(l,Math.min(h,v)),options=[];
 for(const e of Object.values(bot.entities)){if(e.name!=='blaze'||(e.metadata?.[9]??20)<=0)continue;const w=(e.width||.6)/2,h=e.height||1.8;
  const xs=[clamp(eye.x,e.position.x-w+.02,e.position.x+w-.02),e.position.x,e.position.x+w-.02,e.position.x-w+.02],zs=[clamp(eye.z,e.position.z-w+.02,e.position.z+w-.02),e.position.z,e.position.z+w-.02,e.position.z-w+.02],ys=[clamp(eye.y,e.position.y+.01,e.position.y+h-.01),e.position.y+.02];
  let best=null;for(const x of xs)for(const z of zs)for(const y of ys){const a=new Vec3(x,y,z),dv=a.minus(eye),n=dv.norm();if(n<.01||n>=2.90||best&&n>=best.n)continue;const obstruction=bot.world.raycast(eye,dv.scaled(1/n),n,(bl,it)=>bl.position.equals(G)?null:it.intersect(bl.shapes,bl.position));if(!obstruction)best={e,a,n};}if(best)options.push(best);
 }return options.sort((a,b)=>(a.e.metadata?.[9]??20)-(b.e.metadata?.[9]??20)||a.n-b.n)[0];}

async function toggle(open){live();stop();if(name(G)!=='spruce_fence_gate')throw Error('GATE_LOST');const begin=Date.now();await bot.lookAt(G.offset(.5,.65,.5),true);if(B(G).getProperties().open!==open)await bot.activateBlock(B(G));for(let k=0;k<10&&B(G)?.getProperties().open!==open;k++)await t();if(B(G)?.getProperties().open!==open)throw Error('GATE_TOGGLE_ACK');trace.push(['TOGGLE',open,Date.now()-begin,bot.health]);}
bot.on('entityHurt',h);bot.on('entityDead',d);bot.on('physicsTick',watch);bot.on('entityGone',gone);
try{
 live();if(!pod(BACK)||!gateClosed()||!full(LOW)||stock()<1)throw Error('ONE_START');openedW=true;await cut(W.offset(0,1,0));await cut(W);await move(W,-132.35);await t(20);if(stock()<2)throw Error('ENDING_RESERVE');trace.push(['ORDINARY_END_RESERVE',stock()]);
 if(self.position.x>-132.23||!gateClosed()||!full(W.offset(0,2,0)))throw Error('BODY_SETBACK_ROOF');await bot.unequip('hand');await t(24);if(bot.heldItem)throw Error('EMPTY_HAND_ACK');trace.push(['EMPTY_HAND_ATTRIBUTES',self.attributes]);
 let cycle=0,noCandidate=0;while(cycle<1&&Date.now()-start<20000&&!dead.length){
   const c=candidate();if(!c){if(++noCandidate%20===0){openedGate=true;await toggle(true);await t(6);await toggle(false);trace.push(['ACQUIRE_PEEK',noCandidate,bot.health]);}await t(4);continue;}
   openedGate=true;await toggle(true);await t(6);const now=candidate();if(!now){await toggle(false);await t(4);continue;}
   target=now.e;const before={id:target.id,hp:target.metadata?.[9]??null,charge:target.metadata?.[16]??null,p:target.position.clone(),aim:now.a.clone(),distance:now.n};
   if(ray(self.position.offset(0,1.62,0),now.a))throw Error('OPEN_CURRENT_LOS');await bot.lookAt(now.a,true);if(self.position.x>-132.23||bot.heldItem)throw Error('ATTACK_STATE');attackedIds.add(target.id);bot.attack(target);swung=true;await toggle(false);await t(5);trace.push(['ACTUAL_HIT',cycle++,before,target.metadata?.[9]??null,bot.health]);
 }

 await t(20);

}catch(e){issue=e.message;trace.push(['ISSUE',issue,self.position.clone(),bot.health]);}
finally{recovery=true;stop();if(!lost){if(openedGate)try{await toggle(false);}catch(e){trace.push(['CLOSE_FAILED',e.message]);}if(openedW)try{await backEnd();}catch(e){endingIssue=e.message;trace.push(['END_FAILED',endingIssue,self.position.clone(),bot.health]);}}bot.removeListener('entityHurt',h);bot.removeListener('entityDead',d);bot.removeListener('physicsTick',watch);bot.removeListener('entityGone',gone);cleanup();}
return{issue,endingIssue,openedW,openedGate,swung,targetBefore,targetAfter:target&&{id:target.id,hp:bot.entities[target.id]?.metadata?.[9]??null,p:bot.entities[target.id]?.position.clone(),charge:bot.entities[target.id]?.metadata?.[16]??null},hits,dead,projectiles,pGone,observerTicks:samples,projectileOverflow,trace,...snap()};
