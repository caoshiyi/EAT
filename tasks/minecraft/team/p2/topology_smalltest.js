function topology(origin,radius=20,cap=2000){
 const {Vec3}=require('vec3');const hot=new Set(['lava','fire','soul_fire','magma_block','nether_portal']);
 const empty=p=>{const b=bot.blockAt(p);return b&&b.boundingBox==='empty'&&!hot.has(b.name)};
 const valid=p=>{const f=bot.blockAt(p.offset(0,-1,0));return f&&f.boundingBox==='block'&&!hot.has(f.name)&&empty(p)&&empty(p.offset(0,1,0))};
 const queue=[origin],seen=new Set([origin.toString()]);let head=0;
 while(head<queue.length&&queue.length<cap){const p=queue[head++];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,-1,1]){const q=p.offset(dx,dy,dz);if(Math.abs(q.x-origin.x)>radius||Math.abs(q.z-origin.z)>radius||Math.abs(q.y-origin.y)>6||seen.has(q.toString())||!valid(q))continue;if(dy===1&&!empty(p.offset(0,2,0)))continue;if(dy===-1&&!empty(q.offset(0,2,0)))continue;seen.add(q.toString());queue.push(q);}}
 const best=(axis,sgn)=>queue.reduce((a,b)=>sgn*b[axis]>sgn*a[axis]?b:a,origin);return{count:queue.length,capped:queue.length>=cap,origin:origin.toString(),east:best('x',1).toString(),west:best('x',-1).toString(),south:best('z',1).toString(),north:best('z',-1).toString()};
}

console.log('SMALLTEST',JSON.stringify(topology(new (require('vec3').Vec3)(6,67,82),3,100)));
