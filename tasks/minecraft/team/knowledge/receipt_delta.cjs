// For arena reuse, copy only the function via HOST assembly; export/test wrapper is host-only.
// Pure retained-count contract. No bot, filesystem, networking or player action.
// Snapshots: [{name, count}], requirements: {name: minimum retained NET gain}.
// Caller must capture correct inventory/window/equipment namespace and life/world state.
// This does NOT establish item identity, durability, gross pickups later consumed, or safety.
function receiptDelta(before,after,required){
 function totals(items){const m=new Map();for(const i of items){if(typeof i.name!=='string'||!Number.isSafeInteger(i.count)||i.count<0)throw Error('invalid inventory snapshot');m.set(i.name,(m.get(i.name)||0)+i.count)}return m}
 const a=totals(before),b=totals(after),deltas={};let received=true;
 for(const[name,n]of Object.entries(required)){if(!Number.isSafeInteger(n)||n<1)throw Error('invalid receipt requirement');deltas[name]=(b.get(name)||0)-(a.get(name)||0);if(deltas[name]<n)received=false}
 return{received,deltas};
}
module.exports=receiptDelta;
if(require.main===module){
 const assert=require('node:assert/strict'),before=[{name:'spruce_planks',count:2}];
 assert.equal(receiptDelta(before,before,{spruce_planks:1}).received,false);
 assert.equal(receiptDelta(before,[{name:'spruce_planks',count:3}],{spruce_planks:1}).received,true);
 assert.equal(receiptDelta(before,[{name:'spruce_planks',count:1}],{spruce_planks:1}).received,false);
 const field=receiptDelta(before,[{name:'spruce_planks',count:1},{name:'wooden_pickaxe',count:1}],{iron_pickaxe:1,shield:1});assert.equal(field.received,false);
 console.log('PASS unchanged total is not receipt; retained gain accepts; consumption and missing required assets reject. Synthetic only.');
}
