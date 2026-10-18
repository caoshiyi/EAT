const V=require('vec3').Vec3;bot.pathfinder.setGoal(null);bot.clearControlStates();
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=1;m.allowFreeMotion=false;
function plan(start,goal,ms=1500){let result=null,statuses=[];const t=Date.now(),gen=bot.pathfinder.getPathFromTo(m,start,goal,{timeout:ms,tickTimeout:100});for(let n=0;n<30;n++){const next=gen.next(),r=next.value?.result||next.value;if(r?.status){result=r;statuses.push(r.status);}if(next.done||r?.status!=='partial')break;}return{ms:Date.now()-t,statuses,status:result?.status,n:result?.path?.length,path:result?.path?.map(p=>[p.x,p.y,p.z,p.toBreak?.length,p.toPlace?.length])};}
const pocket=new V(-9,26,-38);const shell=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(a=>{const p=pocket.offset(...a),b=bot.blockAt(p);return{p,n:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}});
console.log('CURRENT',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,pose:bot.entity.metadata?.[6],eye:bot.entity.eyeHeight,inv:bot.inventory.items().map(i=>[i.name,i.count]),shell,clock:bot.time.timeOfDay}));
console.log('SMALL_CURRENT',JSON.stringify(plan(bot.entity.position.clone(),new goals.GoalBlock(-9,26,-38),300)));
const start=new V(-8.5,26,-35.5);console.log('HYPOTHETICAL_VALLEY_TO_Y60',JSON.stringify(plan(start,new goals.GoalY(60),3500)));
console.log('HYPOTHETICAL_VALLEY_TO_Y40',JSON.stringify(plan(start,new goals.GoalY(40),2000)));
const cols=[];for(let x=-16;x<=4;x+=4)for(let z=-44;z<=-20;z+=4){let air=[];for(let y=26;y<=76;y++){const b=bot.blockAt(new V(x,y,z));if(b?.name==='air'&&bot.blockAt(new V(x,y-1,z))?.boundingBox==='block')air.push(y);}cols.push({x,z,landings:air});}console.log('SAMPLED_COLUMNS',JSON.stringify(cols));
return{p:bot.entity.position,hp:bot.health,food:bot.food,controls:bot.controlState,goal:bot.pathfinder.goal};
