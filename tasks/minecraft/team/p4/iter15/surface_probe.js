bot.clearControlStates();bot.pathfinder.setGoal(null);if(bot.game.dimension!=='the_end')return{issue:'END_REQUIRED_NO_ACTION'};
const{Vec3}=require('vec3'),self=bot.entity;
// Read-only finite breakout plan. No movement or assumption about unseen End terrain.
function planSurface({origin,block,stock,pickUses,maxRise=5}){
 const at=(x,y,z)=>block([x,y,z]),add=(a,b)=>a.map((v,i)=>v+b[i]),air=b=>b&&['air','cave_air'].includes(b.name),native=b=>b?.name==='end_stone'&&b.full===true;
 const[x,y,z]=origin,dirs=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
 if(!native(at(x,y-1,z))||!air(at(x,y,z))||!air(at(x,y+1,z)))return{ok:false,why:'ORIGIN'};
 let top=y+1,cuts=0;
 for(let h=y+2;h<=y+maxRise+1;h++){
  const b=at(x,h,z);if(native(b)){top=h;cuts++;continue}
  if(air(b))break;return{ok:false,why:'UNKNOWN_OR_OTHER_COLUMN',q:[x,h,z],name:b?.name};
 }
 if(cuts<1||top-y+1>maxRise)return{ok:false,why:'NO_BOUNDED_TOP',top,cuts};
 if(![1,2,3].every(d=>air(at(x,top+d,z))))return{ok:false,why:'TOP_HEADROOM'};
 const rise=top-y+1,floors=Array.from({length:rise},(_,i)=>[x,y+i,z]);
 const exits=dirs.map(d=>add([x,top+1,z],d)).filter(q=>native(at(q[0],q[1]-1,q[2]))&&[0,1,2].every(d=>air(at(q[0],q[1]+d,q[2]))));
 if(!exits.length)return{ok:false,why:'NO_ADJACENT_NATIVE_SURFACE',top};
 // Roof cuts supply one native block each; remaining two pillar floors may use owned full caps.
 const extraFloors=Math.max(0,rise-cuts),toolPrice=cuts+rise+3;
 if(stock<extraFloors+3)return{ok:false,why:'CAP_PRICE',extraFloors,reserve:3,stock};
 if(pickUses<toolPrice)return{ok:false,why:'TOOL_PRICE',toolPrice,pickUses};
 return{ok:true,origin,top,rise,cuts,floors,exits,extraFloors,reserve:3,toolPrice,workMs:25000,recoveryMs:25000,ending:'actual adjacent native floor or reverse only own pillar floors, restore original native roof; no automatic exposed wait'};
}

const p=self.position.floored(),origin=p.toArray(),names=['end_stone','cobbled_deepslate','basalt','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','blackstone','tuff','cobblestone'];
const block=a=>{const b=bot.blockAt(new Vec3(...a));return b?{name:b.name,full:b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}:null},stock=bot.inventory.items().filter(i=>names.includes(i.name)).reduce((n,i)=>n+i.count,0),pickUses=Math.max(0,...bot.inventory.items().filter(i=>i.name==='stone_pickaxe').map(i=>131-i.durabilityUsed));
const plan=planSurface({origin,block,stock,pickUses});
if(plan.ok)global.P4SurfacePlan={...plan,at:Date.now(),entityId:self.id};else delete global.P4SurfacePlan;
const threats=Object.values(bot.entities).filter(e=>['ender_dragon','enderman','area_effect_cloud','dragon_fireball','end_crystal'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:e.position.clone(),distance:e.position.distanceTo(self.position)}));
return{issue:plan.ok?null:plan.why,plan,world:bot.game.dimension,p:self.position.clone(),hp:bot.health,food:bot.food,threats,qualification:'read-only current loaded geometry, not actual surface access or projectile proof'};
