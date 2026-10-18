const V=require('vec3').Vec3,start=bot.entity.position.floored(),goal=new V(39,50,0);
function key(p){return [p.x,p.y,p.z].join(',');}function valid(p){if(p.x<37||p.x>48||Math.abs(p.z)>5)return false;const f=bot.blockAt(p.offset(0,-1,0)),r=bot.blockAt(p.offset(0,2,0));return f?.name==='end_stone'&&r?.name==='end_stone'&&[0,1].every(d=>['end_stone','air','cave_air'].includes(bot.blockAt(p.offset(0,d,0))?.name));}
const q=[start],prev=new Map([[key(start),null]]);let found=null;for(let i=0;i<q.length;i++){const p=q[i];if(p.equals(goal)){found=p;break;}for(const [x,z] of [[-1,0],[0,1],[0,-1],[1,0]]){const n=p.offset(x,0,z);if(prev.has(key(n))||!valid(n))continue;prev.set(key(n),p);q.push(n);}}
const route=[];for(let p=found;p;p=prev.get(key(p)))route.push([p.x,p.y,p.z]);route.reverse();global.P4TowerDetour20=route;
const footprint=[];for(let x=38;x<=47;x++)for(let z=-4;z<=4;z++)if(bot.blockAt(new V(x,65,z))?.name==='obsidian')footprint.push([x,z]);
const top=[39,40,41,42,43,44,45].map(x=>({x,z:0,ys60to80:[...Array(21)].map((_,i)=>bot.blockAt(new V(x,60+i,0))?.name)}));
return {route,visited:q.length,footprint,top,p:bot.entity.position,hp:bot.health,crystal:Object.values(bot.entities).filter(e=>e.name==='end_crystal').sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position)).slice(0,2).map(e=>({id:e.id,p:e.position,w:e.width,h:e.height}))};
