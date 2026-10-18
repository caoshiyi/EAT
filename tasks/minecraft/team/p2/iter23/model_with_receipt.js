// Small read-only model diagnostic. Does not execute/install a route or certify movement.
function modelWithReceipt(bot,m,start,goal,budgetMs=1500){
 const at=Date.now(),source=start.clone(),statuses=[];let r=null,done=false;
 const gen=bot.pathfinder.getPathFromTo(m,source,goal,{timeout:budgetMs,tickTimeout:100});
 for(let n=0;n<Math.ceil(budgetMs/100)+10;n++){
  const step=gen.next(),q=step.value?.result||step.value;
  if(q?.status){r=q;statuses.push(q.status);}
  done=!!step.done;if(done||(q?.status&&q.status!=='partial'))break;
 }
 const receipt={phase:'model_only',at:new Date().toISOString(),start:source,goal:JSON.parse(JSON.stringify(goal)),ms:Date.now()-at,status:r?.status??'no_result',done,statuses,n:r?.path?.length??0,edits:(r?.path||[]).reduce((n,p)=>n+(p.toBreak?.length||0)+(p.toPlace?.length||0),0),end:r?.path?.slice(-1).map(p=>[p.x,p.y,p.z])||[]};
 console.log('MODEL_RECEIPT',JSON.stringify(receipt));return{receipt,result:r};
}
