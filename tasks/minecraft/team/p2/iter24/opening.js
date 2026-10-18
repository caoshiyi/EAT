const p=bot.entity.position; const V=p.constructor; const c=p.floored();
const rel=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
const cell=(p)=>{let b=bot.blockAt(p);return {p:p.toString(),name:b?.name,box:b?.boundingBox}};
console.log(JSON.stringify({time:new Date().toISOString(),p,health:bot.health,food:bot.food,inv:bot.inventory.items().map(x=>({name:x.name,n:x.count})),shell:rel.map(a=>cell(c.offset(...a))),controls:bot.controlState,goal:bot.pathfinder.goal}));
console.log('NORTH',JSON.stringify(Array.from({length:7},(_,i)=>[cell(c.offset(0,-1,-i-1)),cell(c.offset(0,0,-i-1)),cell(c.offset(0,1,-i-1)),cell(c.offset(0,2,-i-1))])));
console.log('COLUMN',JSON.stringify(Array.from({length:23},(_,i)=>cell(c.offset(0,i+2,0)))));
