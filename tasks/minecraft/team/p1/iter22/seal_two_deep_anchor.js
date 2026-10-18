const V=bot.entity.position.constructor;bot.pathfinder.setGoal(null);bot.clearControlStates();bot.stopDigging();let lost=false;const died=()=>lost=true;bot.on('death',died);
function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState};}
const full=p=>bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');
async function seen(p){for(const q of [[.5,.99,.5],[.5,.5,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){await bot.lookAt(p.offset(...q),true);const c=bot.blockAtCursor(4.5);if(c?.position.equals(p)&&c.intersect&&[1.62,1.8].every(h=>bot.entity.position.offset(0,h,0).distanceTo(c.intersect)<=4.5))return c;}throw Error('not first visible '+p);}
const norms=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];
try{
 await bot.waitForTicks(2);console.log('RECONCILE',JSON.stringify(state()));const base=bot.entity.position.floored();if(bot.game.dimension!=='overworld'||!bot.entity.onGround||bot.health<=0)throw Error('not grounded life');
 console.log('TWO_DEEP_ANCHORED_COLUMN',JSON.stringify([-1,-2,-3,-4].map(y=>({p:base.offset(0,y,0),n:bot.blockAt(base.offset(0,y,0))?.name,full:full(base.offset(0,y,0))}))));
 if(![-1,-2,-3].every(y=>full(base.offset(0,y,0))))throw Error('column not solid; no unsafe down');
 if(![-1,-2,-3].some(y=>['dirt','grass_block'].includes(bot.blockAt(base.offset(0,y,0)).name)))throw Error('no guaranteed roof material');
 await bot.unequip('hand');
 for(let depth=1;depth<=2;depth++){
 if(lost||bot.game.dimension!=='overworld'||bot.health<=0)throw Error('life lost');const p=base.offset(0,-depth,0),b=bot.blockAt(p),c=await seen(p);console.log('CUT_PRE',JSON.stringify({p,n:b.name,face:c.face,hp:bot.health}));await bot.dig(b,'ignore',norms[c.face]);await bot.waitForTicks(10);if(lost||!bot.entity.onGround||Math.abs(bot.entity.position.y-(base.y-depth))>.15)throw Error('depth not landed');console.log('DEPTH',JSON.stringify(state()));
 if(depth===1){let anchored=false;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const dest=base.offset(dx,0,dz),ref=dest.offset(0,-1,0);if(!full(ref))continue;const b=bot.blockAt(dest);if(b.name==='snow'){const q=await seen(dest);await bot.dig(b,'ignore',norms[q.face]);await bot.waitForTicks(2);}else if(b.boundingBox!=='empty')continue;
 const q=await seen(ref);if(q.face!==1)continue;const material=bot.inventory.items().find(i=>i.name==='dirt');if(!material)throw Error('first ordinary dirt absent');await bot.equip(material,'hand');console.log('ANCHOR_PRE',JSON.stringify({dest,ref,hit:q.intersect}));await bot.placeBlock(bot.blockAt(ref),norms[1]);await bot.waitForTicks(3);if(!full(dest))throw Error('anchor absent');anchored=true;break;}if(!anchored)throw Error('no visible anchor');await bot.unequip('hand');}

 }
 const roof=base.clone(),dirt=bot.inventory.items().find(i=>i.name==='dirt');if(!dirt)throw Error('no actual roof dirt');let made=false;
 for(const [dx,dz,face] of [[1,0,4],[-1,0,5],[0,1,2],[0,-1,3]]){
 const p=roof.offset(dx,0,dz);if(!full(p))continue;const c=await seen(p);if(c.face!==face)continue;await bot.equip(dirt,'hand');console.log('ROOF_PRE',JSON.stringify({roof,ref:p,hit:c.intersect,face}));await bot.placeBlock(bot.blockAt(p),norms[face]);await bot.waitForTicks(4);if(!full(roof))throw Error('roof no effect');made=true;break;
 }
 if(!made)throw Error('no actual visible roof reference');
 const p=bot.entity.position.floored(),shell=[p.offset(0,-1,0),p.offset(0,2,0)];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,1])shell.push(p.offset(dx,dy,dz));
 const audit=shell.map(q=>({p:q,n:bot.blockAt(q)?.name,full:full(q)}));console.log('SHELL_AUDIT',JSON.stringify(audit));if(audit.some(x=>!x.full))throw Error('NOT fully sealed');
 const hp=bot.health;await bot.waitForTicks(100);console.log('SEALED_STABILITY',JSON.stringify({hp0:hp,...state()}));
}finally{bot.removeListener('death',died);bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify({...state(),lost}));}
