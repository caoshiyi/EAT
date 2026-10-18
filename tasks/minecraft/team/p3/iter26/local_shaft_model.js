const V=bot.entity.position.constructor,start=new V(13,61,78),target=new V(8,65,83);
const full=q=>!!bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);
const allowed=['air','cave_air','stone','sandstone','dirt','grass_block','diorite','granite','andesite','basalt','cobblestone','cobbled_deepslate','spruce_planks'];
const noFluid=q=>{for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(let dy=0;dy<2;dy++){const p=q.offset(dx,dy,dz),n=bot.blockAt(p)?.name;if(!n||['water','lava','fire','magma_block'].includes(n)&&!(dx&&dz&&full(q.offset(dx,dy,0))&&full(q.offset(0,dy,dz))))return false;}return true;};
const safeRoof=b=>{const q=b.offset(0,2,0);return air(q)||allowed.includes(bot.blockAt(q)?.name)&&[[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].every(d=>full(q.offset(...d)));};
function model(requireRoof=true){const key=q=>q.toString(),queue=[start],prev=new Map(),seen=new Set([key(start)]),dist=q=>Math.abs(q.x-target.x)+Math.abs(q.z-target.z)+2*Math.abs(q.y-target.y);let best=start;
for(let i=0;i<queue.length&&queue.length<5000;i++){const b=queue[i];if(dist(b)<dist(best))best=b;if(b.equals(target)){best=b;break;}for(let dy of[0,1,-1])for(const[dx,dz]of[[0,1],[-1,0],[1,0],[0,-1]]){const q=b.offset(dx,dy,dz);if(q.x<6||q.x>15||q.z<76||q.z>85||q.y<60||q.y>65||seen.has(key(q))||!full(q.offset(0,-1,0))||(requireRoof&&!full(q.offset(0,2,0)))||![0,1].every(h=>allowed.includes(bot.blockAt(q.offset(0,h,0))?.name))||!noFluid(q)||dy===1&&requireRoof&&!safeRoof(b))continue;seen.add(key(q));prev.set(key(q),b);queue.push(q);}}
const route=[];let q=best;while(!q.equals(start)){route.push(q);q=prev.get(key(q));}return{requireRoof,visited:seen.size,best,complete:best.equals(target),route:route.reverse()};}
console.log('SHAFT_MODEL',JSON.stringify({at:new Date().toISOString(),start,target,covered:model(),floorOnly:model(false),NOTE:'read-only geometry, not physical route/visibility/current enemy qualification'}));
return {p:bot.entity.position,hp:bot.health,inventory:bot.inventory.items().map(i=>[i.name,i.count]),readOnly:true};
