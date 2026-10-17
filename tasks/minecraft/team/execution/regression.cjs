// Host-only tests. No arena, Minecraft connection, or live bot.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const root = process.cwd();
const physicsFile = root + '/tools/mc_arena/node_modules/mineflayer/lib/plugins/physics.js';
const source = fs.readFileSync(physicsFile, 'utf8');
const pause = ms => new Promise(r => setTimeout(r, ms));

async function ticksTest() {
  // Execute the exact installed waitForTicks implementation with an accelerated
  // host timeout. This tests its event dependency, not real server scheduling.
  const start = source.indexOf('  bot.waitForTicks = async function');
  const end = source.indexOf('\n  let respawnTimer', start);
  assert(start >= 0 && end > start);
  const bot = new EventEmitter();
  const delays = [];
  vm.runInNewContext(source.slice(start, end), {bot,
    setTimeout: (fn, ms) => { delays.push(ms); return setTimeout(fn, 15); },
    clearTimeout});
  const stopped = bot.waitForTicks(8).then(() => 'resolved', e => e.message);
  assert.match(await stopped, /Timeout waiting for 8 ticks after 5400ms/);
  assert.equal(bot.listenerCount('physicsTick'), 0);
  const active = bot.waitForTicks(3);
  for (let i = 0; i < 3; ++i) bot.emit('physicsTick');
  await active;
  assert.equal(bot.listenerCount('physicsTick'), 0);
  assert.deepEqual(delays, [5400, 5150]);
  console.log('PASS exact waitForTicks: inactive clock rejects; active clock resolves; listeners removed');
}

function physicsGateTest() {
  const start = source.indexOf('  function tickPhysics (now)');
  const end = source.indexOf('\n  // remove this', start);
  const bot = new EventEmitter();
  bot._client = {state: 'play'};
  bot.entity = {position: {x: 0}};
  bot.blockAt = () => ({});
  bot.physicsEnabled = true;
  let emitted = 0;
  bot.on('physicsTick', () => emitted++);
  const scope = vm.createContext({bot, shouldUsePhysics: true, controlState: {}, world: {},
    PlayerState: class {}, physics: {simulatePlayer: () => ({apply: () => {}})},
    updatePosition: () => {}});
  vm.runInContext(source.slice(start, end), scope);
  const mountLine = source.match(/  bot.on\('mount', \(\) => \{ shouldUsePhysics = false \}\)/)?.[0];
  assert(mountLine);
  vm.runInContext(mountLine, scope);
  vm.runInContext('tickPhysics(0)', scope);
  assert.equal(emitted, 1);
  bot.emit('mount');
  vm.runInContext('tickPhysics(50)', scope);
  assert.equal(emitted, 1);
  console.log('PASS exact physics gate + mount listener: mount suppresses physicsTick');
}

async function gotoTest() {
  const goto = require(root + '/tools/mc_arena/node_modules/mineflayer-pathfinder/lib/goto.js');
  const bot = new EventEmitter();
  let moving = false;
  bot.pathfinder = {setGoal: g => {moving = !!g; bot.emit('goal_updated', g);}};
  const goal = {};
  const pending = goto(bot, goal).catch(e => e);
  // Race timeout alone never calls setGoal: action remains active.
  assert.equal(await Promise.race([pending, pause(2).then(() => 'deadline')]), 'deadline');
  assert.equal(moving, true);
  bot.pathfinder.setGoal(null);
  const outcome = await pending;
  assert.equal(outcome.name, 'GoalChanged');
  assert.equal(moving, false);
  for (const name of ['goal_reached','path_update','goal_updated','path_stop']) {
    assert.equal(bot.listenerCount(name), 0);
  }
  console.log('PASS exact goto: race timeout leaves movement; setGoal(null) cancels and removes listeners');
}

async function continuationTest() {
  let cancelled = false, moved = false;
  const old = (async () => {await pause(15); moved = true;})();
  await Promise.race([old, pause(1)]);
  await old;
  assert.equal(moved, true);
  moved = false;
  const guarded = (async () => {await pause(15); if (cancelled) return; moved = true;})();
  await Promise.race([guarded, pause(1)]);
  cancelled = true;
  await guarded;
  assert.equal(moved, false);
  console.log('PASS synthetic continuation: timeout alone resumes late; guard prevents post-await movement');
}

function cleanupTest() {
  let cleared = false, dug = false, removed = false;
  const bot = {pathfinder: {setGoal: () => {throw Error('stopped bot');}},
    clearControlStates: () => {cleared = true;}, stopDigging: () => {dug = true;}};
  const errors = [];
  try {
    for (const [name, stop] of [['goal', () => bot.pathfinder.setGoal(null)],
      ['controls', () => bot.clearControlStates()], ['dig', () => bot.stopDigging()]]) {
      try {stop();} catch(e) {errors.push([name, e.message]);}
    }
  } finally { removed = true; }
  assert(cleared && dug && removed);
  assert.deepEqual(errors, [['goal', 'stopped bot']]);
  console.log('PASS synthetic cleanup: one throwing stop does not bypass remaining stops/listener cleanup');
}

(async () => {await ticksTest(); physicsGateTest(); await gotoTest();
  await continuationTest(); cleanupTest();})().catch(e => {console.error(e);process.exitCode=1;});
