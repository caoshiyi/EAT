async function fieldWest(endX=6.5){
 live();const a=bot.entity.position.floored();if(a.y!==58)throw Error('field source height');
 for(let x=a.x-1;x>=Math.floor(endX);x--){const q=v(x,58,a.z);if(!full(q.offset(0,-1,0))||!air(q)||!air(q.offset(0,1,0)))throw Error('field actual lane blocked '+q);}
 const ahead=Object.values(bot.entities).filter(e=>e.name==='area_effect_cloud'&&Math.abs(e.position.y-58)<3&&Math.abs(e.position.z-(a.z+.5))<4&&e.position.x<bot.entity.position.x&&e.position.x>endX-3);if(ahead.length)throw Error('field cloud ahead');
 const t=Date.now();await bot.lookAt(v(bot.entity.position.x-2,56,a.z+.5),true);bot.setControlState('forward',true);
 try{while(bot.entity.position.x>endX+.25&&Date.now()-t<10000){live();await sleep(1);if(Math.abs(bot.entity.position.z-a.z-.5)>.4||bot.entity.position.y<57.9)throw Error('field displacement');}}
 finally{bot.clearControlStates();}
 await sleep(6);live();await center(endX,a.z+.5);console.log('SEPARATED_FIELD',JSON.stringify(snap()));
}
async function pod(){
 const q=bot.entity.position.floored();if(!bot.entity.onGround||!full(q.offset(0,-1,0)))throw Error('pod actual floor');
 for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){await place(q.offset(dx,0,dz));await place(q.offset(dx,1,dz));}
 bot.setControlState('jump',true);try{for(let k=0;k<8&&bot.entity.position.y<q.y+.65;k++)await sleep(1);await place(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}
 for(let k=0;k<20&&!bot.entity.onGround;k++)await sleep(1);await place(q.offset(0,2,0));
 for(let i=0;i<3;i++){const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:q.offset(...d),n:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));if(!faces.every(f=>f.full))throw Error('pod boundary changed');console.log('ENDING',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,faces}));await sleep(10);}
}
async function railEscape(){
 live();bot.clearControlStates();for(let k=0;k<30&&!bot.entity.onGround;k++)await sleep(1);let q=bot.entity.position.floored();
 if(q.x!==30||![-24,-25,-26].includes(q.z))throw Error('escape off column');
 while(bot.entity.position.y>61.03){q=bot.entity.position.floored();const nz=q.z===-24?-25:q.z===-25?-26:-25;await railDrop(v(30,q.y-2,nz));}
 q=bot.entity.position.floored();if(q.y===61&&q.z===-25)await railDrop(v(30,60,-26));
 else if(q.y===61&&q.z===-26){await railDrop(v(29,59,-26));await railDrop(v(28,58,-26));}
 q=bot.entity.position.floored();if(q.y===60&&q.z===-26)await railDrop(v(29,58,-26));
 if(bot.entity.position.floored().y!==58)throw Error('escape ground not reached');
 await fieldWest();await pod();
}
