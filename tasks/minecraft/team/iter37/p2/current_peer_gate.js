// Conservative candidate check for the observed player/Enderman placement failure.
// Does not establish vanilla collision rules for other entity types. Never waits/moves.
function placementOccupants(bot,q) {
  return Object.values(bot.entities).filter(e=>e.id===bot.entity.id||e.type==='player'||e.name==='player'||e.name==='enderman').filter(e=>{
    const p=e.position,w=(e.width||.6)/2,h=e.height||1.8;
    return p.x+w>q.x+.001&&p.x-w<q.x+.999&&p.y+h>q.y+.001&&p.y<q.y+.999&&p.z+w>q.z+.001&&p.z-w<q.z+.999;
  }).map(e=>({id:e.id,name:e.name,p:{x:e.position.x,y:e.position.y,z:e.position.z},width:e.width,height:e.height}));
}

const q={x:0,y:50,z:3};console.log("CURRENT_P1_GATE",JSON.stringify({at:new Date().toISOString(),target:q,candidates:placementOccupants(bot,q),ownHP:bot.health,own:bot.entity.position}));
