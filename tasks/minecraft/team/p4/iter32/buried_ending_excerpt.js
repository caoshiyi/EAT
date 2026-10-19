// Requires native_base.js primitives, adapted to caller current state.
// Demonstrated at75/67/73 only. Admission must inspect full4deep and sidewalls; never imply sand immunity.
// Qualify a real soil refuge only where the current full geometry funds it.
const q=bot.entity.position.floored();await center(q.x+.5,q.z+.5);
for(let i=1;i<=3;i++){const b=bot.blockAt(q.offset(0,-i,0));if(!['grass_block','dirt'].includes(b?.name))throw Error('no 3soil under current ending');}
for(let i=0;i<3;i++)await dig(bot.entity.position.floored().offset(0,-1,0));
const home=bot.entity.position.floored();await named(home.offset(0,2,0),'dirt');for(const d of [[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]])await named(home.offset(...d),'dirt');console.log('REFUGE',JSON.stringify({...snap(),faces:[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:home.offset(...d),full:full(home.offset(...d)),n:bot.blockAt(home.offset(...d))?.name}))}));
