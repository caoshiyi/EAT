let issue=null,endingIssue=null,sealed=false;const receipts=[];
async function walk(q){return nativeWalk(nativePlan(bot.entity.position.floored(),q))}
async function collectFruit(q,before){if(count('sweet_berries')>before)return;const items=Object.values(bot.entities).filter(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='sweet_berries'&&e.position.distanceTo(q.offset(.5,0,.5))<5);for(const e of items){const base=e.position.floored(),options=[base,...[[1,0],[-1,0],[0,1],[0,-1]].map(([x,z])=>base.offset(x,0,z))].filter(p=>full(bot.blockAt(p.offset(0,-1,0)))&&[0,1].every(y=>clear(bot.blockAt(p.offset(0,y,0))))).sort((a,b)=>a.offset(.5,0,.5).distanceTo(e.position)-b.offset(.5,0,.5).distanceTo(e.position));for(const p of options.slice(0,2)){await walk(p);await tick(6);if(count('sweet_berries')>before)return}}}
try{
 if(!closed()||!bot.inventory.items().some(i=>/^(wooden|stone|iron)_pickaxe$/.test(i.name))||bot.inventory.items().filter(i=>['dirt','cobblestone','spruce_planks','sandstone'].includes(i.name)).reduce((s,i)=>s+i.count,0)<4)throw Error('ACTUAL_START_TOOL_CAPS4');
 for(let k=0;k<80&&bot.entity.position.x<7.4;k++){await bot.lookAt(v([7.45,69,83.5]),true);bot.setControlState('forward',true);await tick();stop()}
 await east('exit');bot.chat('P4 actualfoodrunexit/EASTfull closed; writerRELEASED. 3bushes<=100s thenwholecampreturn; noP1deliverycredityet.');
 for(const[stance,targets]of[[[21,68,89],[[20,68,89],[22,68,89]]],[[24,68,91],[[24,68,90]]]]){
  if(Date.now()-started>100000)throw Error('FOOD_WORK_BOUND');await walk(v(stance));
  for(const a of targets){const q=v(a),b=bot.blockAt(q);if(b?.name!=='sweet_berry_bush'||Number(b.getProperties().age)<2)continue;const n=count('sweet_berries');await bot.unequip('hand');await bot.activateBlock(b);await tick(14);await collectFruit(q,n);const gain=count('sweet_berries')-n;receipts.push([a,gain]);if(gain<1)throw Error('BERRY_PICKUP')}
 }
}catch(e){issue=e.message;console.log('FOOD_ISSUE',issue,bot.entity.position)}
finally{stop();retreat=true;if(!lost)try{if(!bodyCamp()){await walk(v([9,67,83]));await east('enter')}sealed=closed();if(!sealed)throw Error('NOT_FULL_CAMP');bot.chat('P4 actualFOODreturnFULLcamp BERRY'+count('sweet_berries')+' HP'+bot.health+'; EASTwriterRELEASED, recipientnotyetreceived.')}catch(e){endingIssue=e.message;console.log('FOOD_END_ISSUE',endingIssue,bot.entity.position);try{sealed=await shield2Emergency()}catch(e){console.log('FOOD_EXPOSED',e.message)}}cleanup()}
return{issue,endingIssue,sealed,receipts,...snapshot(),protectedEnd:sealed};
