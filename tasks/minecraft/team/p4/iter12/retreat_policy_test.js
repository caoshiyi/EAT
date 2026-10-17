const allow=(cur,next,foe,retreat)=>!foe||retreat&&Math.hypot(next[0]-foe[0],next[1]-foe[1])>=Math.hypot(cur[0]-foe[0],cur[1]-foe[1])-.08;
for(const [label,c,n,f,r,want]of[['work exposed blocks',[12,83],[11,83],[14,83],false,false],['retreat away passes',[12,83],[11,83],[14,83],true,true],['retreat closer blocks',[12,83],[13,83],[14,83],true,false],['no foe passes',[12,83],[11,83],null,false,true],['equal-range edge passes',[12,83],[12,84],[14,83],true,true]]){if(allow(c,n,f,r)!==want)throw Error(label)}
console.log('retreat policy five fixtures PASS; no world proof');
