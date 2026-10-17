const{Vec3}=require('vec3');const V=(x,y,z)=>new Vec3(x,y,z),full=b=>b&&b.boundingBox==='block'&&b.shapes.some(s=>s.join(',')==='0,0,0,1,1,1')&&!/lava|fire|magma|water/.test(b.name);let dead=false,issue=null;const stop=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null)};bot.on('death',stop);bot.on('respawn',stop);const tick=async n=>{if(dead||bot.game.dimension!=='the_nether')throw Error('LIFE');await bot.waitForTicks(n);if(dead)throw Error('DEAD')};async function dig(p){let b=bot.blockAt(p);if(b.boundingBox==='empty')return;await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');await bot.dig(b);await tick(3);if(bot.blockAt(p).boundingBox!=='empty')throw Error('DIG_ACK');}async function put(p,kind){if(full(bot.blockAt(p)))return;let it=bot.inventory.items().find(i=>i.name===(kind||'dirt'));if(!it)throw Error('NO_'+kind);let ref=null,face=null;for(let d of[[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){let r=p.offset(...d);if(full(bot.blockAt(r))){ref=bot.blockAt(r);face=V(...d.map(v=>-v));break;}}if(!ref)throw Error('NO_REF_'+p);await bot.equip(it,'hand');await bot._placeBlockWithOptions(ref,face,{forceLook:true});await tick(3);if(!full(bot.blockAt(p)))throw Error('PUT_ACK_'+p);}
const home=V(1,65,4),end=V(1,66,6);const shell=p=>full(bot.blockAt(p.offset(0,-1,0)))&&full(bot.blockAt(p.offset(0,2,0)))&&[[1,0],[-1,0],[0,1],[0,-1]].every(([x,z])=>[0,1].every(y=>full(bot.blockAt(p.offset(x,y,z)))));
try{
if(!bot.entity.position.floored().equals(home)||bot.health<19||!shell(home)||!shell(end))throw Error('SHARED_PRE');
bot.chat('P3 ENTRY3664 ACTUALFULL20HP Erecap/OWgateclosed RELEASEgate/E. ONE S65/66COBBLE+67DIRT exit/restore intoexistingend1,66,6 thenpublicbridge, P4farSouth58/no actor. NoNcuts/no futurebufferclaim.');
for(const y of[67,66,65])await dig(V(1,y,5));
await bot.lookAt(V(1.5,65,8),true);bot.setControlState('forward',true);
for(let k=0;k<45&&bot.entity.position.z<6.35;k++){if(bot.entity.position.z>5.05)bot.setControlState('jump',true);await tick(1);}
bot.clearControlStates();await tick(8);
if(!bot.entity.position.floored().equals(end)||!bot.entity.onGround)throw Error('S_BODY_'+bot.entity.position);
await tick(8);const c=bot.inventory.items().filter(i=>i.name==='cobblestone').reduce((a,i)=>a+i.count,0);
await put(V(1,65,5),c>=2?'cobblestone':'dirt');await put(V(1,66,5),c>=2?'cobblestone':'dirt');await put(V(1,67,5),'dirt');
bot.chat('P3 S_EXIT actualend'+bot.entity.position+' HP'+bot.health+' bufferFULL'+shell(home)+' N/Euntouched/S'+[65,66,67].map(y=>bot.blockAt(V(1,y,5)).name)+' RELEASEbuffer; no futureclaim.');
}catch(e){issue=e.message;console.log('S_EXIT_ISSUE',issue);}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',stop);bot.removeListener('respawn',stop);}
return{issue,p:bot.entity.position,hp:bot.health,homeFull:shell(home),endFull:shell(end),inv:bot.inventory.items().map(i=>[i.name,i.count])};
