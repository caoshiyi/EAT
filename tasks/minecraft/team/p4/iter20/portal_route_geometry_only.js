const V=require('vec3').Vec3;const start=bot.entity.position.floored(),goal=new V(131,-36,2275),hostiles=Object.values(bot.entities).filter(e=>e.type==='hostile').map(e=>e.position.clone());
function key(p){return [p.x,p.y,p.z].join(',');}function full(p){const b=bot.blockAt(p);return b&&b.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');}
function safe(p){if(p.x<126||p.x>153||p.z<2229||p.z>2276||p.y<-42||p.y>-28)return false;return full(p.offset(0,-1,0))&&[0,1].every(d=>bot.blockAt(p.offset(0,d,0))?.boundingBox==='empty');}
const q=[start],prev=new Map([[key(start),null]]);let found=null;
for(let i=0;i<q.length&&i<6000;i++){const p=q[i];if(p.equals(goal)){found=p;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])for(const dy of [0,1,-1]){
 const n=p.offset(dx,dy,dz);if(prev.has(key(n))||!safe(n))continue;
 // Rising needs swept headroom above origin; descending needs target's extra upper entry cell.
 if(dy===1&&bot.blockAt(p.offset(0,2,0))?.boundingBox!=='empty')continue;
 if(dy===-1&&bot.blockAt(n.offset(0,2,0))?.boundingBox!=='empty')continue;
 prev.set(key(n),p);q.push(n);
}}
const route=[];if(found){for(let p=found;p;p=prev.get(key(p)))route.push([p.x,p.y,p.z]);route.reverse();}
global.P4Route20=route;
return {found:!!found,visited:q.length,route,hostilesNearRoute:hostiles.filter(p=>route.some(a=>p.distanceTo(new V(...a))<8)),pos:bot.entity.position,hp:bot.health};
