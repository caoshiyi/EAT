// Host-only parse checker for arena async bodies. Reads approved team source, never executes it.
const fs=require('fs');const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
let failed=false;for(const path of process.argv.slice(2)){try{new AsyncFunction('bot','Movements','goals','require','console',fs.readFileSync(path,'utf8'));console.log('PARSE PASS',path);}catch(e){failed=true;console.log('PARSE FAIL',path,e.message);}}
process.exitCode=failed?1:0;
