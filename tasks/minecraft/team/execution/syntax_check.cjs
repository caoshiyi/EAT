// Compile-only check of arena async bodies. NEVER calls the compiled function.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const compile=body=>new AsyncFunction('bot','Movements','goals',body);
if(process.argv[2]==='--self-test'){
  delete globalThis.__executionSyntaxTest;
  compile('globalThis.__executionSyntaxTest=true; await bot.waitForTicks(1); return 3;');
  assert.equal(globalThis.__executionSyntaxTest,undefined);
  assert.throws(()=>compile('let issue=null; const issue=1;'),SyntaxError);
  assert.throws(()=>compile('const [x,y];'),SyntaxError);
  console.log('PASS syntax-only smoke: await/return accepted, body not invoked, duplicate/destructuring errors caught');
}else{
  let record=false,args=process.argv.slice(2);
  if(args[0]==='--record'){record=true;args=args.slice(1);}
  if(args.length!==1)throw Error('usage: syntax_check.cjs [--record] TEAM_FILE');
  const file=fs.realpathSync(args[0]);
  const allowed=fs.realpathSync(path.join(process.env.EAT_ROOT,'tasks/minecraft/team'))+path.sep;
  if(!file.startsWith(allowed))throw Error('Only team files may be read');
  let body=fs.readFileSync(file,'utf8');
  if(record){
    const header=body.match(/^== #\d+ [^\n]*\n/);
    if(!header)throw Error('Expected full arena programs record');
    body=body.slice(header[0].length).split(/^-- (?:output|returned|error) --\s*$/m)[0];
  }
  try{compile(body);console.log('SYNTAX_OK (not executed)',args[0]);}
  catch(e){console.error('SYNTAX_FAIL (not executed)',args[0],e.name+': '+e.message);process.exitCode=1;}
}
