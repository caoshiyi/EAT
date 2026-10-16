// Read-only factory. Apply only after live landing-hostile preflight.
// Synthetic getMoveForward test #1041 proved blocksToAvoid(magma) alone DOES NOT reject a magma FLOOR.
// This helper has not yet been physically validated in the Nether.
function netherSafeMovements(bot,Movements){
 const {Vec3}=require('vec3');const m=new Movements(bot);
 m.canDig=false;m.allowParkour=false;m.allow1by1towers=false;m.scafoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
 for(const n of['fire','soul_fire','lava','magma_block'])if(bot.registry.blocksByName[n])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
 // Cardinal paths avoid diagonal corner clipping; still require actual position/health checks.
 m.getMoveDiagonal=()=>{};
 const old=m.getNeighbors.bind(m),hot=new Set(['fire','soul_fire','lava','magma_block']);
 m.getNeighbors=node=>old(node).filter(n=>{const q=new Vec3(n.x,n.y,n.z),f=bot.blockAt(q.offset(0,-1,0)),feet=bot.blockAt(q),head=bot.blockAt(q.offset(0,1,0));return f&&feet&&head&&!hot.has(f.name)&&!hot.has(feet.name)&&!hot.has(head.name)});
 return m;
}
