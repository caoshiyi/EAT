// Passive public-API evidence. Does not attack, infer phases, or decide success.
function makeDragonEvidence(bot,limit=24){
 const rows=[],bars=new Map(),bindings=[];let dropped=0,stopped=false,hurtEvents=0;
 const xyz=p=>p?{x:p.x,y:p.y,z:p.z}:null;
 const add=(event,data)=>{if(rows.length>=limit){rows.splice(1,1);dropped++;}rows.push({at:new Date().toISOString(),event,...data});};
 const snap=b=>({uuid:b.entityUUID,health:b.health,title:String(b.title),isDragonBar:b.isDragonBar});
 const bar=(event,b)=>{const s=snap(b),key=s.uuid||s.title;let x=bars.get(key);if(!x){x={key,initial:s.health,min:s.health,last:s.health,events:0};bars.set(key,x);}if(Number.isFinite(s.health)&&s.health>=0&&s.health<=1){x.min=Number.isFinite(x.min)?Math.min(x.min,s.health):s.health;x.last=s.health;}x.events++;add(event,{bar:s});};
 for(const b of Object.values(bot.bossBars||{}))bar('initialBoss',b);
 const bind=(e,f)=>{bot.on(e,f);bindings.push([e,f]);};
 bind('bossBarCreated',b=>bar('bossBarCreated',b));bind('bossBarUpdated',b=>bar('bossBarUpdated',b));bind('bossBarDeleted',b=>bar('bossBarDeleted',b));
 bind('entityHurt',e=>{if(e.name==='ender_dragon'){hurtEvents++;add('dragonHurt',{entity:{id:e.id,name:e.name,p:xyz(e.position)}});}});
 return{mark:label=>add('mark',{label,p:xyz(bot.entity?.position),hp:bot.health}),stop(){if(!stopped){for(const[e,f]of bindings)bot.removeListener(e,f);stopped=true;}return{rows:[...rows],dropped,bars:[...bars.values()].map(x=>({...x})),hurtEvents,listenersRemoved:stopped,limits:'Observed events only; final health may conceal healed damage; no-event is not proof of no damage.'};}};
}
