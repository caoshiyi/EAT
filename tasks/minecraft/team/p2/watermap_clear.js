bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);console.log('actual',bot.entity.position,bot.health);
const ps=bot.findBlocks({matching:bot.registry.blocksByName.water.id,maxDistance:80,count:15000}).filter(p=>bot.blockAt(p.offset(0,1,0))?.boundingBox==='empty');console.log('watercount',ps.length);
const key=p=>p.x+','+p.y+','+p.z;const nodes=new Map(ps.map(p=>[key(p),p]));const start=ps.slice().sort((a,b)=>a.distanceTo(bot.entity.position)-b.distanceTo(bot.entity.position))[0];if(!start)throw Error('no water');
const q=[start],seen=new Map([[key(start),null]]);let top=start;
for(let i=0;i<q.length;i++){const p=q[i];if(p.y>top.y)top=p;for(const [dx,dy,dz]of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const k=key(p.offset(dx,dy,dz));if(nodes.has(k)&&!seen.has(k)){seen.set(k,key(p));q.push(nodes.get(k));}}}
let route=[];for(let k=key(top);k!==null;k=seen.get(k))route.push(nodes.get(k));route.reverse();global.P2_waterCursor=0;global.P2_waterRoute=route.map(p=>[p.x,p.y,p.z]);console.log('start',start,'connected',seen.size,'top',top,'routeLen',route.length,'route',global.P2_waterRoute.filter((p,i)=>i%4===0||i===route.length-1));
