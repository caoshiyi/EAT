async function stepCovered(dx,dz){
 alive();if(bot.health<10)throw Error('forward HP changed');const a=bot.entity.position.floored(),q=a.offset(dx,0,dz);
 if(Math.abs(dx)+Math.abs(dz)!==1||!bot.entity.onGround)throw Error('step source');
 for(const b of [q.offset(0,1,0),q])await cut(b,['end_stone','basalt','blackstone','netherrack']);
 if(!full(q.offset(0,-1,0)))await put(q.offset(0,-1,0));
 if(!full(q.offset(0,2,0)))await put(q.offset(0,2,0));
 for(const d of [[dx,0,dz],[-dz,0,dx],[dz,0,-dx]])for(const y of[0,1]){const b=q.offset(d[0],y,d[2]);if(!full(b))await put(b);}
 await flat(q.offset(.5,0,.5));console.log('COVERED_STEP',JSON.stringify(state()));
}
