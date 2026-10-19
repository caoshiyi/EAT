// LOCAL mocked event plumbing, not a Minecraft hazard/retreat test.
const fs=require('fs'),EventEmitter=require('events');
const make=new Function(fs.readFileSync('tasks/minecraft/team/p1/iter27/return_watcher.js','utf8')+';return makeReturnWatcher;')();
const p=(x,y,z)=>({x,y,z,clone(){return p(x,y,z)},floored(){return p(Math.floor(x),Math.floor(y),Math.floor(z))},offset(a,b,c){return p(x+a,y+b,z+c)}});
const bot=new EventEmitter();Object.assign(bot,{health:10,food:17,game:{dimension:'the_end'},entity:{position:p(-10.6,58,-10.5),onGround:true},entities:{},blockAt:()=>({name:'end_stone',shapes:[[0,0,0,1,1,1]]})});
const before=[bot.listenerCount('health'),bot.listenerCount('death')];
let watcher;
function firstOwnerProgram(){watcher=make(bot);watcher.mark('return_pending');return watcher.report()}
const early=firstOwnerProgram();
bot.health=6;bot.emit('health');bot.health=0;bot.emit('health');bot.emit('death');
for(let i=0;i<16;i++)watcher.mark('after return '+i);
const later=watcher.report();
if(early.firstLoss||!later.firstLoss||later.firstLoss.hp!==6||!later.firstDeath||later.rows.length!==8||later.dropped<1)throw Error('post-return/tail evidence lost');
watcher.stop();watcher.stop();if(bot.listenerCount('health')!==before[0]||bot.listenerCount('death')!==before[1])throw Error('listeners leaked');
console.log(JSON.stringify({scope:'LOCAL MOCK ONLY',checks:['captures events after caller return','preserves first health loss and death beyond ring overflow','bounds eight recent rows','restores listeners on explicit stop'],rows:later.rows.length,dropped:later.dropped,firstLossHP:later.firstLoss.hp,firstDeathHP:later.firstDeath.hp},null,2));
