// Bot-agnostic source for OWNER of actual donor p2. P4 never executes as p2.
// ONE ordinary rod stack; do not use for mixed inputs without changing recipient protocol.
bot.clearControlStates();bot.pathfinder.setGoal(null);
const{Vec3}=require('vec3'),self=bot.entity,start=Date.now(),hp=bot.health,keys=['forward','back','left','right','jump','sprint','sneak'];
const donor=new Vec3(131.5,-36,2276.5),receiver=new Vec3(133.5,-36,2276.5),V=a=>new Vec3(...a),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name),count=()=>bot.inventory.items().filter(i=>i.name==='blaze_rod').reduce((n,i)=>n+i.count,0),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)};
let issue=null,lost=false,armed=false,tossed=false,recipientReturned=false,closed=false,trace=[];const before=count();
function discontinuity(){lost=true;stop()};for(const name of['death','respawn','end'])bot.on(name,discontinuity);
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<=0)throw Error('DISCONTINUITY');if(Date.now()>1792250260000||Date.now()-start>95000)throw Error('TIME');if(self.position.distanceTo(donor)>.2)throw Error('DONOR_MOVED');if(bot.health<hp)throw Error('DAMAGE_STOP')}
async function ticks(n=1){check();await bot.waitForTicks(n);check()}
function p1(){return bot.players.p1?.entity}
function channelOpen(){return[132,133].every(x=>[-36,-35].every(y=>air(V([x,y,2276]))))}
function outer(){const out=[];for(let x=131;x<=133;x++){out.push([x,-37,2276],[x,-34,2276]);for(let y of[-36,-35])for(let z of[2275,2277])out.push([x,y,z]);}for(let y of[-36,-35])out.push([130,y,2276]);return out.every(q=>full(V(q)))}
function donorCompoundClosed(){return outer()&&[-36,-35].every(y=>full(V([133,y,2276])))}
try{
 if(bot.game.dimension!=='overworld'||self.position.distanceTo(donor)>.2||!self.onGround||hp<7||!!(self.metadata?.[0]&1)||bot.currentWindow||bot.inventory.selectedItem||before<5)throw Error('ACTUAL_RETAINED_DONOR_REQUIRED');
 if(!outer())throw Error('OUTER_BOUNDARY');
 // P1 must still be in its center before arming. No toss in an old receiver window.
 if(!p1()||p1().position.distanceTo(new Vec3(134.5,-36,2276.5))>.25)throw Error('P1_CENTER_REQUIRED');
 if(Date.now()+95000>1792250260000)throw Error('WHOLE_TIME_PRICE');
 armed=true;bot.chat('Actual donor retainedROD'+before+' at131.5,-36,2276.5 ARMED60s; P1 may run receive_source now. I wait actual133.5 body+open132/133, then ONEstack toss; no manual timing.');
 for(let n=0;n<1200;n++){check();if(p1()?.position.distanceTo(receiver)<.25&&channelOpen())break;await ticks()}
 if(!p1()||p1().position.distanceTo(receiver)>.25||!channelOpen()||!outer())throw Error('RECEIVER_WINDOW_NOT_OBSERVED');
 await bot.lookAt(receiver.offset(0,.3,0),true);await ticks(2);
 const item=bot.inventory.items().find(i=>i.name==='blaze_rod');if(!item||item.count<5||count()!==before)throw Error('ONE_ORDINARY_STACK_REQUIRED');
 const stackCount=item.count;trace.push(['BEFORE_TOSS',before,stackCount,p1().position.clone()]);await bot.tossStack(item);tossed=true;await ticks(5);
 if(count()!==before-stackCount||bot.inventory.selectedItem)throw Error('DONOR_ORDINARY_DELTA');
 trace.push(['DONOR_DELTA',before,count()]);
 // Recipient ordinary inventory is verified by p1's own program, never inferred here.
 for(let n=0;n<500;n++){if(p1()?.position.distanceTo(new Vec3(134.5,-36,2276.5))<.25&&donorCompoundClosed()){recipientReturned=true;closed=true;break}await ticks()}
 if(!recipientReturned)throw Error('RECIPIENT_RETURN_UNCONFIRMED');
 if(count()!==before-stackCount)throw Error('DONOR_REVACUUM_OR_EXTERNAL_DELTA');
}catch(e){issue=e.message}finally{stop();for(const name of['death','respawn','end'])bot.removeListener(name,discontinuity);if(!lost&&bot.game.dimension==='overworld')closed=donorCompoundClosed()}
return{issue,armed,tossed,recipientReturned,closed,lost,before,after:count(),recipientInventoryProof:false,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,cursor:bot.inventory.selectedItem??null,trace,controls:Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)])),limit:'P1 actual ordinary rod receipt must be read separately; no autoretry, no movement/dig/place/closure mutation by donor'};
