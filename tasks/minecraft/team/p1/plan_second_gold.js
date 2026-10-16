// Read-only factory. Apply only after live landing-hostile preflight.
// Synthetic getMoveForward test #1041 proved blocksToAvoid(magma) alone DOES NOT reject a magma FLOOR.
// This helper has not yet been physically validated in the Nether.
function p1SafeMovements(bot,Movements){
 const {Vec3}=require('vec3');const m=new Movements(bot);
 m.canDig=false;m.allowSprinting=false;m.allowParkour=false;m.allow1by1towers=false;m.scafoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
 for(const n of['fire','soul_fire','lava','magma_block'])if(bot.registry.blocksByName[n])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
 // Cardinal paths avoid diagonal corner clipping; still require actual position/health checks.
 m.getMoveDiagonal=()=>{};
 const old=m.getNeighbors.bind(m),hot=new Set(['fire','soul_fire','lava','magma_block']);
 m.getNeighbors=node=>old(node).filter(n=>{const q=new Vec3(n.x,n.y,n.z),f=bot.blockAt(q.offset(0,-1,0)),feet=bot.blockAt(q),head=bot.blockAt(q.offset(0,1,0));return f&&feet&&head&&!hot.has(f.name)&&!hot.has(feet.name)&&!hot.has(head.name)});
 return m;
}

// Adapted from P2 topology. Read-only geometry; path is a proposal until each physical step is observed.
function p1Topology(origin,{radius=24,cap=2500,virtualOpen=[],target=[-27,-43]}={}){
 const{Vec3}=require('vec3'),open=new Set(virtualOpen.map(p=>p.toString())),hot=new Set(['lava','fire','soul_fire','magma_block','nether_portal']);
 const cube=b=>b?.shapes?.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 const empty=p=>open.has(p.toString())||(()=>{const b=bot.blockAt(p);return b&&b.boundingBox==='empty'&&!hot.has(b.name);})();
 const valid=p=>{const floor=bot.blockAt(p.offset(0,-1,0));return cube(floor)&&!hot.has(floor.name)&&empty(p)&&empty(p.offset(0,1,0));};
 if(!valid(origin))return{error:'origin not valid',origin:origin.toString()};const nodes=[origin],by=new Map([[origin.toString(),origin]]),parents=new Map([[origin.toString(),null]]);let head=0;
 while(head<nodes.length&&nodes.length<cap){const p=nodes[head++];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,-1,1]){const n=p.offset(dx,dy,dz),k=n.toString();if(Math.abs(n.x-origin.x)>radius||Math.abs(n.z-origin.z)>radius||Math.abs(n.y-origin.y)>6||parents.has(k)||!valid(n))continue;if(dy===1&&!empty(p.offset(0,2,0)))continue;if(dy===-1&&!empty(n.offset(0,2,0)))continue;nodes.push(n);by.set(k,n);parents.set(k,p.toString());}}
 const dist=p=>(p.x-target[0])**2+(p.z-target[1])**2;const best=nodes.reduce((a,b)=>dist(b)<dist(a)?b:a,origin);const path=[];let k=best.toString();while(k!==null){path.push(by.get(k));k=parents.get(k);}path.reverse();return{count:nodes.length,capped:nodes.length>=cap,origin:origin.toString(),target:best.toString(),towardGoldDistance:Math.sqrt(dist(best)),path:path.map(p=>[p.x,p.y,p.z])};
}
const{Vec3}=require('vec3');if(bot.game.dimension!=='the_nether')throw Error('dimension');const origin=new Vec3(1,65,4);console.log('SECOND_GOLD_PLAN',JSON.stringify(p1Topology(origin,{radius:80,cap:6000,virtualOpen:[new Vec3(1,65,3),new Vec3(1,66,3)]})));const near=bot.findBlocks({matching:bot.registry.blocksByName.nether_gold_ore.id,maxDistance:96,count:32});console.log('GOLD_CANDIDATES',near.map(p=>[p.toString(),bot.blockAt(p).name]));console.log('BODYSTATE',bot.entity.position.toString(),bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));