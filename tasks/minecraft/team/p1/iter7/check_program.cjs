const fs=require('node:fs');const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
function check(source){return new AsyncFunction('bot','Movements','goals','require','console',source)}
check('return 1;');let rejected=false;try{check('if(')}catch(e){rejected=e instanceof SyntaxError}if(!rejected)throw Error('negative fixture not rejected');
for(const p of process.argv.slice(2)){check(fs.readFileSync(p,'utf8'));console.log('ASYNC_BODY_SYNTAX_OK',p)}
