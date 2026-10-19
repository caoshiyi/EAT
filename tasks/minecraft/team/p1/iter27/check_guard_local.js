// Local mocked API contract test, NOT Minecraft execution or escape qualification.
const fs = require('fs'), EventEmitter = require('events');
const make = new Function(fs.readFileSync('tasks/minecraft/team/p1/iter27/operation_guard.js', 'utf8') + ';return makeOperationGuard;')();
const point = (x, y, z) => ({x,y,z,clone(){return point(x,y,z)},floored(){return point(Math.floor(x),Math.floor(y),Math.floor(z))},offset(a,b,c){return point(x+a,y+b,z+c)}});
function fixture(name='blackstone') {
  const bot = new EventEmitter(); Object.assign(bot, {health:10,entity:{position:point(-10.6,63,-10.5),onGround:true},game:{dimension:'the_end'},stops:0,
    clearControlStates(){this.stops++},pathfinder:{setGoal(){}},blockAt(){return{name,shapes:[[0,0,0,1,1,1]]}}});return bot;
}
const results = [];
function check(name, fn) {fn();results.push(name);}
function mustThrow(fn) {let threw=false;try{fn()}catch(e){threw=true}if(!threw)throw Error('expected rejection')}
check('actual132 blackstone floor accepted at settled feet', () => {const b=fixture(),g=make(b);g.beginEscape('catch');if(g.escapeFloor('floor').name!=='blackstone')throw Error('wrong floor');g.close()});
check('HP loss stops next forward instruction', () => {const b=fixture(),g=make(b);g.forward('initial');b.health=6;b.emit('health');mustThrow(()=>g.forward('next mutation'));if(!b.stops)throw Error('did not stop controls');g.close()});
check('loss after healing still retires forward work', () => {const b=fixture(),g=make(b);b.health=12;b.emit('health');b.health=11;b.emit('health');mustThrow(()=>g.forward('damage above opening HP'));g.close()});
check('settled rounding does not select one floor too deep', () => {const b=fixture(),g=make(b);b.entity.position=point(-10.6,62.99999,-10.5);g.beginEscape('catch');if(g.escapeFloor('floor').position.y!==62)throw Error('wrong floor Y');g.close()});
check('escape at HP2 remains alive admitted', () => {const b=fixture(),g=make(b);b.health=2;b.emit('health');g.beginEscape('urgent');g.escape('cut check');g.escapeFloor('actual floor');mustThrow(()=>g.forward('never resume'));g.close()});
check('death then respawn cannot continue old operation', () => {const b=fixture(),g=make(b);b.health=0;b.emit('death');b.health=20;mustThrow(()=>g.beginEscape('respawn'));g.close()});
check('airborne132 returned pose does not choose stale floor', () => {const b=fixture(),g=make(b);b.entity.position=point(-10.304,64.553,-10.5);b.entity.onGround=false;g.beginEscape('urgent');mustThrow(()=>g.escapeFloor('floor'));g.close()});
check('bedrock unknown floor rejected', () => {const b=fixture('bedrock'),g=make(b);g.beginEscape('urgent');mustThrow(()=>g.escapeFloor('floor'));g.close()});
check('escape health event does not cancel escape controls', () => {const b=fixture(),g=make(b);g.beginEscape('urgent');const before=b.stops;b.health=2;b.emit('health');if(b.stops!==before)throw Error('escape event interfered');g.escape('still alive');g.close()});
check('guard listeners restored', () => {const b=fixture(),h=b.listenerCount('health'),d=b.listenerCount('death'),g=make(b);g.close();g.close();if(b.listenerCount('health')!==h||b.listenerCount('death')!==d)throw Error('listeners leaked')});
console.log(JSON.stringify({scope:'LOCAL MOCK ONLY; not a game safety/retreat qualification',checks:results},null,2));
