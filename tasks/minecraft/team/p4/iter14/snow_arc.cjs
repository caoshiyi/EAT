// Public vanilla projectile constants; actual first End shot must qualify the model.
module.exports=function snowArc(origin,target,blocked=()=>false){
const drag=.99,g=.03,speed=1.5,d=target.map((v,i)=>v-origin[i]),horizontal=Math.hypot(d[0],d[2]);
if(horizontal<18||horizontal>48)return{ok:false,why:'EXPLOSION_DISTANCE_OR_RANGE'};
function coeff(t){let n=Math.floor(t),f=t-n,p=drag**n,A=(1-p)/(1-drag);return[A+f*p,g/(1-drag)*(n-A)+f*g/(1-drag)*(1-p)]}
function velocity(t){const[A,B]=coeff(t);return[d[0]/A,(d[1]+B)/A,d[2]/A]}
let bracket=null,last=.2,prior=Math.hypot(...velocity(last))-speed;
for(let t=.4;t<=100;t+=.2){const now=Math.hypot(...velocity(t))-speed;if(prior>0&&now<=0){bracket=[last,t];break}last=t;prior=now}
if(!bracket)return{ok:false,why:'NO_LOW_ARC'};
let[lo,hi]=bracket;for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(Math.hypot(...velocity(mid))>speed)lo=mid;else hi=mid}
const ticks=(lo+hi)/2,v=velocity(ticks),points=[origin.slice()];
for(let t=.5;t<ticks+.49;t+=.5){const[A,B]=coeff(Math.min(t,ticks)),p=origin.map((x,i)=>x+A*v[i]-(i===1?B:0)),from=points.at(-1);if(blocked(from,p))return{ok:false,why:'ARC_BLOCKED',from,p};points.push(p);if(t>=ticks)break}
const end=points.at(-1);return{ok:true,ticks,v,yaw:Math.atan2(-v[0],-v[2]),pitch:Math.atan2(v[1],Math.hypot(v[0],v[2])),end,points};
};
