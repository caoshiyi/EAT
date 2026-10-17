const bowArc=function bowArc(origin,target,blocked=()=>false,branch='low'){
 const drag=.99,g=.05000000074505806,speed=3,d=target.map((v,i)=>v-origin[i]),horizontal=Math.hypot(d[0],d[2]);
 if(horizontal<12||horizontal>130)return{ok:false,why:'EXPLOSION_DISTANCE_OR_RANGE'};
 function coeff(t){const n=Math.floor(t),f=t-n,p=drag**n,A=(1-p)/(1-drag);return[A+f*p,g/(1-drag)*(n-A)+f*g/(1-drag)*(1-p)]}
 function velocity(t){const[A,B]=coeff(t);return[d[0]/A,(d[1]+B)/A,d[2]/A]}
 let bracket=null,last=.2,prior=Math.hypot(...velocity(last))-speed;
 for(let t=.4;t<=100;t+=.2){const now=Math.hypot(...velocity(t))-speed;if((branch==='low'&&prior>0&&now<=0)||(branch==='high'&&prior<=0&&now>0)){bracket=[last,t];break}last=t;prior=now}
 if(!bracket)return{ok:false,why:'NO_'+branch.toUpperCase()+'_ARC'};
 let[lo,hi]=bracket;for(let k=0;k<40;k++){const mid=(lo+hi)/2,above=Math.hypot(...velocity(mid))>speed;if((branch==='low'&&above)||(branch==='high'&&!above))lo=mid;else hi=mid}
 const ticks=(lo+hi)/2;if(ticks>110)return{ok:false,why:'FLIGHT_EXCEEDS_RECEIPT_WINDOW'};const v=velocity(ticks),points=[origin.slice()];
 for(let t=.5;t<ticks+.49;t+=.5){const[A,B]=coeff(Math.min(t,ticks)),p=origin.map((x,i)=>x+A*v[i]-(i===1?B:0)),from=points.at(-1);if(blocked(from,p))return{ok:false,why:'ARC_BLOCKED',from,p,branch};points.push(p);if(t>=ticks)break}
 return{ok:true,branch,ticks,v,yaw:Math.atan2(-v[0],-v[2]),pitch:Math.atan2(v[1],Math.hypot(v[0],v[2])),end:points.at(-1),points};
};

for (const h of[86,87,87.8]) for(const branch of ['low','high']) {const a=bowArc([22.5,56.52,-19.5],[13.5,h,-40.5],()=>false,branch);console.log(h,branch,JSON.stringify(a.ok?{t:a.ticks,pitch:a.pitch,v:a.v,maxY:Math.max(...a.points.map(p=>p[1])),near:a.points.filter(p=>p[2]<-36&&p[2]>-39)}:a))}
