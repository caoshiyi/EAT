const{Vec3}=require('vec3');if(bot.game.dimension!=='the_nether')throw Error('Netheronly');
// Adapted from P2 topology. Read-only geometry; path is a proposal until each physical step is observed.
function p1Topology(origin,{radius=24,cap=2500,virtualOpen=[]}={}){
 const{Vec3}=require('vec3'),open=new Set(virtualOpen.map(p=>p.toString())),hot=new Set(['lava','fire','soul_fire','magma_block','nether_portal']);
 const cube=b=>b?.shapes?.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 const empty=p=>open.has(p.toString())||(()=>{const b=bot.blockAt(p);return b&&b.boundingBox==='empty'&&!hot.has(b.name);})();
 const valid=p=>{const floor=bot.blockAt(p.offset(0,-1,0));return cube(floor)&&!hot.has(floor.name)&&empty(p)&&empty(p.offset(0,1,0));};
 if(!valid(origin))return{error:'origin not valid',origin:origin.toString()};const nodes=[origin],by=new Map([[origin.toString(),origin]]),parents=new Map([[origin.toString(),null]]);let head=0;
 while(head<nodes.length&&nodes.length<cap){const p=nodes[head++];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,-1,1]){const n=p.offset(dx,dy,dz),k=n.toString();if(Math.abs(n.x-origin.x)>radius||Math.abs(n.z-origin.z)>radius||Math.abs(n.y-origin.y)>6||parents.has(k)||!valid(n))continue;if(dy===1&&!empty(p.offset(0,2,0)))continue;if(dy===-1&&!empty(n.offset(0,2,0)))continue;nodes.push(n);by.set(k,n);parents.set(k,p.toString());}}
 const dist=p=>(p.x+21)**2+(p.z+30)**2;const best=nodes.reduce((a,b)=>dist(b)<dist(a)?b:a,origin);const path=[];let k=best.toString();while(k!==null){path.push(by.get(k));k=parents.get(k);}path.reverse();return{count:nodes.length,capped:nodes.length>=cap,origin:origin.toString(),target:best.toString(),towardGoldDistance:Math.sqrt(dist(best)),path:path.map(p=>[p.x,p.y,p.z])};
}

console.log('FLOOR_SAFE_PLAN',JSON.stringify(p1Topology(new Vec3(1,65,4),{virtualOpen:[new Vec3(1,65,3),new Vec3(1,66,3)]})));bot.chat('CORRECTIONS: P3 #1038 FRONTNOTPLACED, actualfeet67/no gate, planned68notworldstate. Also P1read-onlygraph#1040 mistakenlyomittedHOTFLOOR exclusion (73nodes invalidsafeplan); fixedBEFOREphysicalwalk. Recomputingfloor-safe route now; standonMAGMA forbidden inBFS ANDmovementfinalneighborsfilter. P2floorfactorysource reviewed, notclaimingfieldproof.');