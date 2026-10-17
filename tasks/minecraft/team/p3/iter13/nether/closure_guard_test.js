// Local fixture only; no player/world execution.
const fs=require('fs'),{Vec3}=require(process.cwd()+'/tools/mc_arena/node_modules/vec3');
const source=fs.readFileSync('tasks/minecraft/team/p3/iter13/nether/out_south.js','utf8');
const a=source.indexOf('const removing=new Set(cs.map'),b=source.indexOf('for(let c of cs)',a),code=source.slice(a,b);
const run=new Function('faces','f','bot','q','cs','held',code+'return {needNow,extraNow};');
const V=a=>new Vec3(...a),q=V([0,0,0]),faces=p=>[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>p.offset(...d));
function corridor(){const m=new Set;for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)m.add(V([x,-1,z]).toString());for(const d of[[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0]])m.add(V(d).toString());return m;}
const cases=[['corridor_four',corridor(),[],4,{needNow:4,extraNow:0}],['corridor_short',corridor(),[],3,'reject'],['open_roofed_room',new Set([...corridor()].filter(k=>!['(1, 0, 0)','(1, 1, 0)','(-1, 0, 0)','(-1, 1, 0)'].includes(k))),[],6,'reject']];
const descent=corridor();descent.add(V([1,2,0]).toString());cases.push(['descent_restore_roof',descent,[V([0,2,0])],5,{needNow:5,extraNow:0}]);
const bridge=corridor();bridge.delete(V([0,-1,1]).toString());cases.push(['missing_wall_foundation',bridge,[],4,'reject']);
let passed=0;for(const[name,m,cs,stock,expected]of cases){let actual;try{actual=run(faces,b=>!!b?.full,{blockAt:p=>({full:m.has(p.toString())})},q,cs,()=>stock);}catch(e){actual='reject';}if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(name+' actual '+JSON.stringify(actual)+' expected '+JSON.stringify(expected));console.log(name+' PASS');passed++;}console.log(JSON.stringify({passed,worldExecutions:0}));
