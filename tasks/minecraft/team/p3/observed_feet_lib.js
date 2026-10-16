// Read-only surface target selection, not a navigation/path guarantee.
function observedFeet(x,z,preferredY){
 const {Vec3}=require('vec3');const hazards=new Set(['water','lava','fire','soul_fire','magma_block','cactus','sweet_berry_bush','cobweb','nether_portal','ice']);
 const pass=b=>b&&b.boundingBox==='empty'&&!hazards.has(b.name);
 const full=b=>b&&!hazards.has(b.name)&&b.shapes.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 for(const dy of[0,1,-1,2,-2]){const y=preferredY+dy,q=new Vec3(x,y,z),f=bot.blockAt(q.offset(0,-1,0));if(full(f)&&pass(bot.blockAt(q))&&pass(bot.blockAt(q.offset(0,1,0))))return{x,y,z,floor:f.name,feet:bot.blockAt(q).name};}
 return null;
}
