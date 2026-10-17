// Read-only A*: mining cost + personal-ending cost, never crosses named shared shells.
async function minePlan(goal,maxExpand=11000){
const start=bot.entity.position.floored(),key=q=>q.toString(),parents=new Map([[key(start),null]]),points=new Map([[key(start),start]]),best=new Map([[key(start),0]]),heap=[];let expanded=0;
const h=q=>Math.abs(q.x-goal.x)+Math.abs(q.z-goal.z)+2*Math.abs(q.y-goal.y);
function push(a){heap.push(a);let n=heap.length-1;while(n){const p=(n-1)>>1;if(heap[p].f<=a.f)break;heap[n]=heap[p];n=p;}heap[n]=a;}
function pop(){const a=heap[0],b=heap.pop();if(heap.length){let n=0;for(;;){let c=n*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=b.f)break;heap[n]=heap[c];n=c;}heap[n]=b;}return a;}
const allowed=new Set([...capNames,'air','cave_air','void_air','stone','andesite','granite','diorite','tuff','nether_gold_ore','warped_nylium','crimson_nylium']);
const cache=new Map();function cell(q){const k=key(q);if(!cache.has(k))cache.set(k,bot.blockAt(q));return cache.get(k)}
function shared(q){return(q.x===1&&q.z===3&&[65,66].includes(q.y))||(q.z===-180&&[-119,-121,-219,-221].includes(q.x)&&[63,64].includes(q.y))}
function allowedCut(q){const b=cell(q);if(!b||!allowed.has(b.name)||shared(q))return false;if(b.boundingBox==='empty')return !/lava|water|fire/.test(b.name);for(const d of[[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const a=cell(q.offset(...d));if(!a||/lava|water|fire/.test(a.name)||d[1]===1&&/^(sand|gravel)$/.test(a.name))return false}return true}
push({q:start,f:h(start),g:0});const fromStart=start.clone();
while(heap.length&&expanded<maxExpand){const a=pop(),p=a.q;if(a.g!==best.get(key(p)))continue;if(p.equals(goal)){let path=[];for(let k=key(p);k!==null;k=parents.get(k))path.push(points.get(k));path.reverse();return{path,cost:a.g,expanded,estimatedCuts:path.slice(1).reduce((n,q,i)=>n+[q,q.offset(0,1,0),...(q.y<path[i].y?[q.offset(0,2,0)]:q.y>path[i].y?[path[i].offset(0,2,0)]:[])].filter(c=>cell(c)?.boundingBox!=='empty').length,0)}}
expanded++;if(expanded%500===0){check();await bot.waitForTicks(1)}
for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(const dy of[0,-1,1]){const q=p.offset(dx,dy,dz),k=key(q);if(Math.abs(q.x-fromStart.x)>85||Math.abs(q.z-fromStart.z)>85||q.y<12||q.y>105||!full(q.offset(0,-1,0)))continue;const cuts=[q,q.offset(0,1,0),...(dy<0?[q.offset(0,2,0)]:dy>0?[p.offset(0,2,0)]:[])];if(cuts.some(c=>!allowedCut(c)))continue;const need=podNeed(q);if(need>stock())continue;let g=a.g+.35+cuts.filter(c=>cell(c)?.boundingBox!=='empty').length+need*.15;if(g>= (best.get(k)??Infinity))continue;best.set(k,g);parents.set(k,key(p));points.set(k,q);push({q,g,f:g+h(q)*.8});}
}
return{path:null,expanded,reason:heap.length?'EXPAND_BOUND':'NO_NATIVE_FLOOR_ROUTE'};
}
