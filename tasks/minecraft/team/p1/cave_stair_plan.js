// Adapted from P2 topology. Read-only geometry; path is a proposal until each physical step is observed.
function p1Topology(origin,{radius=24,cap=2500,virtualOpen=[]}={}){
 const{Vec3}=require('vec3'),open=new Set(virtualOpen.map(p=>p.toString())),hot=new Set(['lava','fire','soul_fire','magma_block','nether_portal']);
 const cube=b=>b?.shapes?.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 const empty=p=>open.has(p.toString())||(()=>{const b=bot.blockAt(p);return b&&b.boundingBox==='empty'&&!hot.has(b.name);})();
 const valid=p=>{const floor=bot.blockAt(p.offset(0,-1,0));return !open.has(p.offset(0,-1,0).toString())&&cube(floor)&&!hot.has(floor.name)&&empty(p)&&empty(p.offset(0,1,0));};
 if(!valid(origin))return{error:'origin not valid',origin:origin.toString()};const nodes=[origin],by=new Map([[origin.toString(),origin]]),parents=new Map([[origin.toString(),null]]);let head=0;
 while(head<nodes.length&&nodes.length<cap){const p=nodes[head++];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,-1,1]){const n=p.offset(dx,dy,dz),k=n.toString();if(Math.abs(n.x-origin.x)>radius||Math.abs(n.z-origin.z)>radius||Math.abs(n.y-origin.y)>6||parents.has(k)||!valid(n))continue;if(dy===1&&!empty(p.offset(0,2,0)))continue;if(dy===-1&&!empty(n.offset(0,2,0)))continue;nodes.push(n);by.set(k,n);parents.set(k,p.toString());}}
 const dist=p=>(p.x+200)**2+(p.z+141)**2;const best=nodes.reduce((a,b)=>dist(b)<dist(a)?b:a,origin);const path=[];let k=best.toString();while(k!==null){path.push(by.get(k));k=parents.get(k);}path.reverse();return{count:nodes.length,capped:nodes.length>=cap,origin:origin.toString(),target:best.toString(),towardGoldDistance:Math.sqrt(dist(best)),path:path.map(p=>[p.x,p.y,p.z])};
}

const{Vec3}=require('vec3');const q=bot.entity.position.floored();if(bot.game.dimension!=='the_nether'||q.x!==-67||q.y!==63||q.z!==-141)throw Error('BODY');const plan=p1Topology(q,{radius:64,cap:5000,virtualOpen:[62,63,64].map(y=>new Vec3(-68,y,-141))});console.log('VIRTUAL_STAIR_PLAN',JSON.stringify(plan));global.P1CaveStairPlan=plan;console.log('RANGED96',Object.values(bot.entities).filter(e=>['ghast','blaze'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<96).map(e=>[e.id,e.name,e.position.toString(),e.position.distanceTo(bot.entity.position)]));
