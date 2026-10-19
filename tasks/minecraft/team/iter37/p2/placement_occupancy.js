// Conservative candidate check for the observed player/Enderman placement failure.
// Adds3cm candidate margin after a native refusal at client x=1.300238.
// May flag cells that vanilla would allow; not an absolute gameplay gate.
// Does not establish vanilla collision rules for other entity types. Never waits/moves.
function placementOccupants(bot,q) {
  return Object.values(bot.entities).filter(e=>e.id===bot.entity.id||e.type==='player'||e.name==='player'||e.name==='enderman').filter(e=>{
    const p=e.position,w=(e.width||.6)/2+.03,h=(e.height||1.8)+.03;
    return p.x+w>q.x&&p.x-w<q.x+1&&p.y+h>q.y&&p.y<q.y+1&&p.z+w>q.z&&p.z-w<q.z+1;
  }).map(e=>({id:e.id,name:e.name,p:{x:e.position.x,y:e.position.y,z:e.position.z},width:e.width,height:e.height}));
}
