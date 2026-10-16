// Host-only source-model regression; no world/player actions.
const assert=require('assert');const max={iron_pickaxe:250,stone_pickaxe:131};
const rank=(a,b)=>(b.name==='iron_pickaxe')-(a.name==='iron_pickaxe')||a.durabilityUsed-b.durabilityUsed;
const items=[{name:'iron_pickaxe',durabilityUsed:245},{name:'stone_pickaxe',durabilityUsed:27},{name:'stone_pickaxe',durabilityUsed:127}];
const old=items.slice().sort(rank)[0];assert(max[old.name]-old.durabilityUsed<6);
const next=items.filter(i=>max[i.name]-i.durabilityUsed>=6).sort(rank)[0];assert.equal(next.name,'stone_pickaxe');assert.equal(next.durabilityUsed,27);
console.log('PASS reproduced OLD reserveSTOP on iron5 despite stone104; filtering usable candidates BEFORE rank selects stone104. Source-model only, no physical mining claim.');
