const V=require('vec3').Vec3;const route=[[129,2272],[130,2272],[131,2272],[131,2273]];const hp=bot.health;const done=[];let issue=null;
try{for(const [x,z] of route){
 const p0=bot.entity.position; if(Math.hypot(p0.x-(x+.5),p0.z-(z+.5))>1.7)throw Error('nonadjacent');
 const floor=bot.blockAt(new V(x,-37,z));if(!floor.shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))throw Error('floor '+x+','+z);
 for(let y=-36;y<=-35;y++)if(bot.blockAt(new V(x,y,z)).boundingBox!=='empty')throw Error('body '+x+','+y+','+z);
 for(let i=0;i<70;i++){
 const p=bot.entity.position;if(bot.health<hp||Math.abs(p.y+36)>.2)throw Error('hurt/fall');
 if(Object.values(bot.entities).some(e=>e.type==='hostile'&&e.position.distanceTo(p)<4))throw Error('hostile');
 if(Math.hypot(p.x-(x+.5),p.z-(z+.5))<.12)break;
 await bot.lookAt(new V(x+.5,p.y+1.62,z+.5),true);bot.setControlState('sneak',true);bot.setControlState('forward',true);await bot.waitForTicks(1);
 }
 bot.clearControlStates();await bot.waitForTicks(3);done.push({target:[x,z],pos:bot.entity.position.clone()});
}}catch(e){issue=String(e);}finally{bot.clearControlStates();}
return {done,issue,pos:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};
