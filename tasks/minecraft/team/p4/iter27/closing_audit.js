// Read-only inherited 2x1 room hypothesis; report actual blocks, never repair.
const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z);
const cells=[];
for(const x of[-9,-8]){
 for(const y of[25,28])cells.push(v(x,y,-38));
 for(const z of[-39,-37])for(const y of[26,27])cells.push(v(x,y,z));
}
for(const x of[-10,-7])for(const y of[26,27])cells.push(v(x,y,-38));
const snapshot=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(n=>[n,bot.getControlState(n)])),goal:bot.pathfinder.goal,window:!!bot.currentWindow,cursor:!!bot.inventory.selectedItem,room:cells.map(p=>{const b=bot.blockAt(p);return{p,name:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')===true};}),interior:[-9,-8].flatMap(x=>[26,27].map(y=>{const p=v(x,y,-38);return{p,name:bot.blockAt(p)?.name};}))});
for(let i=0;i<3;i++){console.log('P4_READONLY_AUDIT',JSON.stringify(snapshot()));await bot.waitForTicks(5);}return snapshot();
