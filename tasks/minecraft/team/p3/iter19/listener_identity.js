return{at:new Date().toISOString(),listeners:['entitySpawn','entityGone'].map(n=>[n,bot.listeners(n).map(f=>({name:f.name,source:String(f)}))]),hp:bot.health,p:bot.entity.position};
