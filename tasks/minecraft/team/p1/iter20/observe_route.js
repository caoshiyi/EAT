const V=bot.entity.position.constructor;
console.log('BODY',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension}));
const air=(x,y,z)=>{let b=bot.blockAt(new V(x,y,z)); return b&&b.boundingBox==='empty'&& !['lava','water'].includes(b.name)};
const floor=(x,y,z)=>{let b=bot.blockAt(new V(x,y,z));return b&&b.boundingBox==='block'};
let start=bot.entity.position.floored(), q=[[start.x,start.y,start.z]], prev=new Map([[q[0].join(','),null]]), target=null;
for(let i=0;i<q.length&&i<6000;i++) {let [x,y,z]=q[i]; if(Math.abs(x-134)+Math.abs(z-2276)<3){target=q[i];break;} for(let [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])for(let dy of [0,-1,1]) {let a=[x+dx,y+dy,z+dz],k=a.join(','); if(prev.has(k)||Math.abs(a[0]-start.x)>45||Math.abs(a[2]-start.z)>50||Math.abs(a[1]-start.y)>5)continue;if(air(...a)&&air(a[0],a[1]+1,a[2])&&floor(a[0],a[1]-1,a[2])) {prev.set(k,[x,y,z]);q.push(a);}}}
let route=[];while(target){route.push(target);target=prev.get(target.join(','));}route.reverse(); global.iter20route=route; console.log('ROUTE',JSON.stringify(route));console.log('explored',q.length);
