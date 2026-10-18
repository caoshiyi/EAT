const V=bot.entity.position.constructor;
for(const [x,z] of [[13,78],[12,78],[9,78],[8,82]]){
  const rows=[];for(let y=57;y<=72;y++){
    const at=new V(x,y,z),c=bot.blockAt(at);
    rows.push({y,name:c?.name,full:!!c?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),sides:[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>{const b=bot.blockAt(at.offset(dx,0,dz));return {dx,dz,n:b?.name,full:!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')};})});
  }
  console.log('COLUMN',JSON.stringify({x,z,rows}));
}
return {at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,readOnly:true,qualifiedRise:false};
