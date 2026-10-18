// Bot host of the minecraft task: four mineflayer bodies (p1..p4), the program runner and a local HTTP API used only
// by tools/mc_arena.py, plus a third-person prismarine view per body. Started and supervised by `mc_arena.py up`.
//
// Environment: MC_DIR (.work/mc), MC_HOST/MC_PORT (the server), MC_API_SOCK (MC_DIR/run/api.sock: the API's unix
// socket), MC_VIEW_PORT (3001: p1, 3002: p2, ...). What a body may attack, use, dig or place on: sight.js.
'use strict'
const fs = require('fs')
const http = require('http')
const path = require('path')
const util = require('util')
const vm = require('vm')
const { builtinModules } = require('module')
const sight = require('./sight')
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const MC_DIR = process.env.MC_DIR || path.resolve(__dirname, '../../.work/mc')
const RECORDS = path.join(MC_DIR, 'records')
const LOCKS = path.join(MC_DIR, 'locks.json')
const HOST = process.env.MC_HOST || '127.0.0.1'
const PORT = parseInt(process.env.MC_PORT || '25565')
const API_SOCK = process.env.MC_API_SOCK || path.join(MC_DIR, 'run', 'api.sock')
const VIEW_PORT = parseInt(process.env.MC_VIEW_PORT || '3001')
const VERSION = '1.20.4'
const PLAYERS = ['p1', 'p2', 'p3', 'p4']
const DEFAULT_TIMEOUT = 60
const MAX_TIMEOUT = 600
const MAX_LOG = 100000          // characters of program output kept per program
const MAX_RETURN = 100000       // characters of JSON return value
const MAX_BUFFER = 300          // chat lines / background lines kept per body between programs
sight.install(VERSION)

fs.mkdirSync(RECORDS, { recursive: true })

function now () { return new Date().toISOString() }
function append (file, rec) { fs.appendFileSync(path.join(RECORDS, file), JSON.stringify(rec) + '\n') }
function log (...a) { console.log(now(), ...a) }
function r1 (x) { return Math.round(x * 10) / 10 }
function push (arr, item) { arr.push(item); if (arr.length > MAX_BUFFER) arr.splice(0, arr.length - MAX_BUFFER) }

// ---- program sandbox (vm contexts scope programs; they are not a security boundary: the audit is the backstop) ----

// Built-ins that start processes, open sockets, touch files or reach the host's internals.
const DENIED = new Set(['child_process', 'cluster', 'worker_threads', 'net', 'tls', 'http', 'https', 'http2', 'dgram',
  'dns', 'fs', 'inspector', 'vm', 'module', 'process', 'v8', 'wasi', 'sqlite', 'test', 'repl', 'trace_events'])
const PACKAGES = /^(mineflayer|mineflayer-pathfinder|vec3|minecraft-data|prismarine-(?!viewer)[a-z-]+)(\/.*)?$/

function programRequire (name) {
  const bare = String(name).replace(/^node:/, '')
  const root = bare.split('/')[0]
  if (DENIED.has(root) || root.startsWith('_') || bare.split('/').includes('..')) throw new Error(`require('${name}') is not allowed in programs`)
  if (builtinModules.includes(bare)) return require(bare)
  if (PACKAGES.test(bare)) return require(require.resolve(bare, { paths: [__dirname] }))
  throw new Error(`require('${name}'): programs may load Node built-ins and the installed mineflayer packages ` +
    '(mineflayer, mineflayer-pathfinder, vec3, minecraft-data, prismarine-*)')
}

function makeContext (body) {
  // Callbacks of timers outlive programs: their output and errors go to the body's background log.
  const guard = (fn, args) => {
    try {
      const r = fn(...args)
      if (r && typeof r.catch === 'function') r.catch(e => push(body.background, `error in a timer callback: ${fmtError(e)}`))
    } catch (e) { push(body.background, `error in a timer callback: ${fmtError(e)}`) }
  }
  const ctx = {
    setTimeout: (fn, ms, ...a) => setTimeout(() => guard(fn, a), ms),
    setInterval: (fn, ms, ...a) => setInterval(() => guard(fn, a), ms),
    setImmediate: (fn, ...a) => setImmediate(() => guard(fn, a)),
    clearTimeout, clearInterval, clearImmediate, queueMicrotask, structuredClone,
    Buffer, URL, URLSearchParams, TextEncoder, TextDecoder, AbortController, AbortSignal, EventTarget, Event,
    performance, atob, btoa
  }
  ctx.global = ctx
  return vm.createContext(ctx, { name: `${body.name} programs` })
}

// The `bot` a program receives: the body's bot, cut off once the program times out so a leftover loop stops acting.
// Listeners it registers are contained: their errors go to the background log, and they are removed on timeout.
function botHandle (body, prog) {
  const real = body.bot
  const wrapped = new WeakMap()
  const contain = (fn) => {
    if (typeof fn !== 'function') return fn
    if (!wrapped.has(fn)) {
      wrapped.set(fn, function (...a) {
        if (prog.cancelled) return
        try {
          const r = fn.apply(this, a)
          if (r && typeof r.catch === 'function') r.catch(e => push(body.background, `error in a listener of program #${prog.n}: ${fmtError(e)}`))
        } catch (e) { push(body.background, `error in a listener of program #${prog.n}: ${fmtError(e)}`) }
      })
    }
    return wrapped.get(fn)
  }
  const add = (method) => (event, fn) => {
    const w = contain(fn)
    prog.listeners.push([event, w])
    real[method](event, w)
    return proxy
  }
  const remove = (event, fn) => { real.removeListener(event, wrapped.get(fn) || fn); return proxy }
  const own = {
    on: add('on'), addListener: add('addListener'), once: add('once'),
    prependListener: add('prependListener'), prependOnceListener: add('prependOnceListener'),
    off: remove, removeListener: remove
  }
  const proxy = new Proxy(real, {
    get (target, prop) {
      if (prog.cancelled) {
        throw new Error(`program #${prog.n} on ${body.name} timed out: its bot is stopped. Helpers kept on global that ` +
          'captured that bot no longer work; give helpers the bot as a parameter.')
      }
      if (Object.prototype.hasOwnProperty.call(own, prop)) return own[prop]
      return Reflect.get(target, prop, target)
    }
  })
  return proxy
}

function fmtError (e) {
  if (e && typeof e === 'object' && e.stack) {
    const lines = String(e.stack).split('\n')
    return lines.slice(0, 25).join('\n') + (lines.length > 25 ? `\n    ... ${lines.length - 25} more frames` : '')
  }
  return String(e)
}

function jsonSafe (v) {
  const seen = new WeakSet()
  let s
  try {
    s = JSON.stringify(v, (k, x) => {
      if (typeof x === 'bigint') return x.toString()
      if (typeof x === 'function') return `[function ${x.name || 'anonymous'}]`
      if (x && typeof x === 'object') {
        const tag = Object.prototype.toString.call(x)
        if (tag === '[object Map]') return Object.fromEntries(x)
        if (tag === '[object Set]') return Array.from(x)
        if (tag === '[object Error]') return { error: String(x) }
        if (seen.has(x)) return '[repeated reference]'
        seen.add(x)
      }
      return x
    })
  } catch (e) { return `[not serializable: ${e.message}]` }
  if (s === undefined) return null
  if (s.length > MAX_RETURN) return { truncated: true, json_prefix: s.slice(0, MAX_RETURN) }
  return JSON.parse(s)
}

// ---- bodies ----

const bodies = {}
for (const name of PLAYERS) {
  bodies[name] = { name, bot: null, spawned: false, dead: false, connects: 0, global: null, running: null,
    chat: [], background: [], movements: null, retry: 0, lastDeathMsg: null, pendingDeath: null }
  bodies[name].global = makeContext(bodies[name])
}
let programSeq = 0
try {
  for (const line of fs.readFileSync(path.join(RECORDS, 'programs.jsonl'), 'utf8').split('\n')) {
    if (line.trim()) programSeq = Math.max(programSeq, JSON.parse(line).n || 0)
  }
} catch (e) { if (e.code !== 'ENOENT') throw e }

function state (body) {
  const b = body.bot
  if (!b || !body.spawned || !b.entity) return { connected: false }
  const p = b.entity.position
  return {
    connected: true,
    position: { x: r1(p.x), y: r1(p.y), z: r1(p.z) },
    dimension: b.game?.dimension,
    health: r1(b.health ?? 0),
    food: b.food,
    alive: !body.dead && (b.health ?? 0) > 0
  }
}

function inventory (b) {
  const counts = {}
  for (const it of b.inventory.items()) counts[it.name] = (counts[it.name] || 0) + it.count
  const armor = {}
  for (const [slot, where] of [[5, 'head'], [6, 'chest'], [7, 'legs'], [8, 'feet'], [45, 'offhand']]) {
    const it = b.inventory.slots[slot]
    if (it) armor[where] = it.name
  }
  return { items: counts, equipped: armor }
}

// A refused attack/use/dig/place (sight.js): in the program's output and its record, or the body's background log.
function noteRefusal (body, why, via) {
  log(`${body.name} refused (${via}): ${why}`)
  const prog = body.running
  if (!prog) { push(body.background, `REFUSED: ${why}`); return }
  prog.refusals.push({ time: now(), via, why })
  prog.note(`REFUSED: ${why}`)
}

function connect (body) {
  const bot = sight.connectBody(() => mineflayer.createBot({ host: HOST, port: PORT, username: body.name, auth: 'offline',
    version: VERSION, hideErrors: true, checkTimeoutInterval: 60000 }), (why, via) => noteRefusal(body, why, via))
  body.bot = bot
  body.spawned = false
  bot.loadPlugin(pathfinder)

  // No commands: a chat line starting with '/' is refused, and so is any command packet whatever sends it.
  const write = bot._client.write.bind(bot._client)
  Object.defineProperty(bot._client, 'write', { writable: false, configurable: false, value: (name, params) => {
    if (name === 'chat_command' || name === 'chat_command_signed') throw new Error('commands are not allowed (no /commands in this game)')
    return write(name, params)
  } })
  bot.once('inject_allowed', () => {     // after the plugins' own injection
    const chat = bot.chat
    bot.chat = (message) => {
      if (String(message).split('\n').some(l => l.trimStart().startsWith('/'))) throw new Error('commands are not allowed: bot.chat refuses messages starting with "/"')
      // mineflayer cuts a long message into 256-character pieces and sends a piece that starts with '/' as a command;
      // cut it here instead, never just before a '/', so text like "a/b" is never refused half way
      let rest = String(message)
      while (rest.length > 256) {
        let cut = 256
        while (cut > 1 && rest[cut] === '/') cut--
        chat(rest.slice(0, cut))
        rest = rest.slice(cut)
      }
      return chat(rest)
    }
    bot.whisper = () => { throw new Error('bot.whisper sends a /tell command, and commands are not allowed; use bot.chat') }
    const setMovements = bot.pathfinder.setMovements
    bot.pathfinder.setMovements = (m) => { body.movements = m; return setMovements(m) }
    guardMethods(body, bot)
  })

  bot.once('spawn', () => {
    body.connects += 1
    body.retry = 0
    log(`${body.name} spawned (connection ${body.connects})`)
    views[body.name]?.reset()
  })
  bot.on('spawn', () => { body.spawned = true; body.dead = false })
  bot.on('chat', (username, message) => {
    if (username !== body.name) push(body.chat, `${username}: ${message}`)
  })
  bot.on('message', (msg, position) => {
    if (position === 'chat') return
    const key = msg.translate || ''
    const text = msg.toString()
    if (key.startsWith('death.')) {
      push(body.chat, `[server] ${text}`)
      if (text.startsWith(body.name + ' ')) {
        body.lastDeathMsg = { text, at: Date.now() }
        if (body.pendingDeath) body.pendingDeath()
      }
    } else if (key.startsWith('chat.type.advancement.')) {
      push(body.chat, `[server] ${text}`)
    }
  })
  bot.on('death', () => {
    body.dead = true
    const st = state(body)
    const record = () => {
      clearTimeout(timer)
      body.pendingDeath = null
      const m = body.lastDeathMsg && Date.now() - body.lastDeathMsg.at < 5000 ? body.lastDeathMsg.text : null
      append('events.jsonl', { time: now(), type: 'death', player: body.name, cause: m || 'unknown (no death message)',
        position: st.position, dimension: st.dimension })
      log(`${body.name} died: ${m}`)
    }
    // The death message may arrive just after the death itself.
    const timer = setTimeout(record, 3000)
    if (body.lastDeathMsg && Date.now() - body.lastDeathMsg.at < 1000) record()
    else body.pendingDeath = record
  })
  bot.on('kicked', (reason) => {
    const strings = (x) => typeof x === 'string' ? [x] : (x && typeof x === 'object' ? Object.values(x).flatMap(strings) : [])
    const r = strings(reason).filter(x => !['compound', 'list', 'string'].includes(x)).join(' ')
    log(`${body.name} kicked: ${r}`)
    append('events.jsonl', { time: now(), type: 'kicked', player: body.name, reason: r })
  })
  bot.on('error', (e) => log(`${body.name} error: ${e.message}`))
  bot.on('end', (reason) => {
    body.spawned = false
    if (body.bot !== bot) return
    if (shuttingDown) return
    const delay = Math.min(30000, 2000 * 2 ** body.retry)
    body.retry += 1
    log(`${body.name} disconnected (${reason}); reconnecting in ${delay / 1000}s`)
    setTimeout(() => connect(body), delay)
  })
}

// Methods that would otherwise wait on a refused packet (or leave the bot mid-action) check sight first; every packet
// is checked again in sight.js. activateBlock clicks a face the client can see when the one asked for is hidden.
function guardMethods (body, bot) {
  const refuse = (why) => { noteRefusal(body, why, 'call'); throw new Error(`REFUSED: ${why}`) }
  const seeBlock = (block, face = null) => {
    if (!block || !block.position) return null
    const s = sight.blockSight(bot, block.position, face)
    return s.refusal ? refuse(s.refusal) : s
  }
  const faceOf = (v) => v && (v.y < 0 ? 0 : v.y > 0 ? 1 : v.z < 0 ? 2 : v.z > 0 ? 3 : v.x < 0 ? 4 : v.x > 0 ? 5 : null)
  const NORMALS = [[0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]]
  const { dig, activateBlock, openBlock, openEntity, sleep, craft } = bot
  bot.dig = async (block, ...a) => { seeBlock(block); return dig(block, ...a) }
  bot.activateBlock = async (block, direction, cursorPos) => {
    const want = faceOf(direction)
    if (want != null && !sight.blockSight(bot, block.position, want).refusal) return activateBlock(block, direction, cursorPos)
    const s = seeBlock(block)
    return activateBlock(block, new Vec3(...NORMALS[s.face]), s.cursor)
  }
  bot.openBlock = async (block, ...a) => { seeBlock(block); return openBlock(block, ...a) }
  bot.openEntity = async (entity, ...a) => {
    const why = entity && sight.entityRefusal(bot, sight.entityTarget(bot, entity.id) || entity)
    if (why) refuse(why)
    return openEntity(entity, ...a)
  }
  bot.sleep = async (bedBlock, ...a) => { seeBlock(bedBlock); return sleep(bedBlock, ...a) }
  bot.craft = async (recipe, count, table, ...a) => { seeBlock(table); return craft(recipe, count, table, ...a) }
}

// ---- programs ----

function readLocks () {
  try { return JSON.parse(fs.readFileSync(LOCKS, 'utf8')) } catch (e) { return {} }
}
function writeLocks (locks) {
  fs.writeFileSync(LOCKS + '.tmp', JSON.stringify(locks, null, 1))
  fs.renameSync(LOCKS + '.tmp', LOCKS)
}
// Who is asking: the agent process (codex exec / claude --print) nearest above the process that opened the connection.
// Found from the socket itself (SO_PEERCRED: the pid that connected), so it cannot be claimed: not by EAT_ROLE, not by
// a direct HTTP request, not by an agent an agent starts (that one is its own agent). null when no agent is above (a
// person or the harness).
function peerAgent (sock) {
  try {
    // Node has no SO_PEERCRED; a python3 child reads it from the connection's fd, passed as its fd 3
    const r = require('child_process').spawnSync('python3', ['-c', 'import socket,struct;s=socket.socket(fileno=3);' +
      'print(struct.unpack("3i",s.getsockopt(socket.SOL_SOCKET,socket.SO_PEERCRED,12))[0]);s.detach()'],
    { stdio: ['ignore', 'pipe', 'ignore', sock._handle.fd], encoding: 'utf8', timeout: 10000 })
    let pid = r.stdout.trim()
    if (!/^\d+$/.test(pid) || pid === '0') return null
    for (let n = 0; pid && pid !== '1' && n < 64; n++) {
      const argv = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0')
      const exe = path.basename(argv[0] || '')
      if ((exe === 'codex' && argv.includes('exec')) || (exe === 'claude' && argv.includes('--print'))) {
        const start = fs.readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ')[19]
        return `${pid}:${start}`
      }
      pid = fs.readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ')[1]
    }
  } catch (e) {}
  return null
}

function ownerName (o) { return `role '${o.role}'` + (o.iter ? ` (iteration ${o.iter})` : '') }

function refuse (req, reason) {
  append('programs.jsonl', { n: null, time: now(), iteration: req.iter || null, role: req.role, agent: req.agent || null, player: req.player,
    code: String(req.code ?? ''), refused: reason })
  return { refused: reason }
}

async function runProgram (req) {
  const body = bodies[req.player]
  if (!body) return { refused: `unknown player '${req.player}' (players: ${PLAYERS.join(', ')})` }
  if (typeof req.code !== 'string' || !req.code.trim()) return refuse(req, 'empty program')
  if (!req.role) return refuse(req, 'no role given (the CLI sends EAT_ROLE)')
  // the lock holds the agent process, not the role name it gives: a name can be set by anyone
  const me = { role: String(req.role), iter: req.iter ? String(req.iter) : '', agent: req.agent || null }
  const same = o => o.role === me.role && o.iter === me.iter && (o.agent || null) === me.agent
  const locks = readLocks()
  const held = locks[body.name]
  if (held && !held.agent && me.agent && held.role === me.role && held.iter === me.iter) {   // a lock from before agents were recorded
    held.agent = me.agent
    writeLocks(locks)
  }
  if (held && !same(held)) {
    return refuse(req, `${body.name} is controlled by ${ownerName(held)} in this iteration; no other agent may run programs on it`)
  }
  if (!held) {
    const other = Object.entries(locks).find(([p, o]) => same(o) || (me.agent && o.agent === me.agent))
    if (other) return refuse(req, `this agent already controls ${other[0]}; an agent controls only one body`)
  }
  if (body.running) {
    const r = body.running
    return refuse(req, `${body.name} is already running program #${r.n} (started ${Math.round((Date.now() - r.start) / 1000)}s ago); one program per body at a time`)
  }
  if (!body.spawned) return refuse(req, `${body.name} is not in the game right now (reconnecting); try again shortly`)
  if (!held) {
    locks[body.name] = { ...me, since: now() }
    writeLocks(locks)
  }

  let timeout = Number(req.timeout ?? DEFAULT_TIMEOUT)
  if (!(timeout > 0)) timeout = DEFAULT_TIMEOUT
  timeout = Math.min(timeout, MAX_TIMEOUT)
  const prog = { n: ++programSeq, start: Date.now(), cancelled: false, listeners: [], out: [], outLen: 0, done: false,
    refusals: [] }
  body.running = prog
  const background = body.background.splice(0)
  const emit = (stream) => (...args) => {
    const line = util.format(...args)
    if (prog.done) { push(body.background, `[program #${prog.n} ${stream}] ${line}`); return }
    if (prog.outLen > MAX_LOG) return
    prog.outLen += line.length + 1
    prog.out.push(prog.outLen > MAX_LOG ? '[output truncated]' : (stream === 'stderr' ? '[err] ' : '') + line)
  }
  prog.note = emit('stderr')
  const progConsole = { log: emit('stdout'), info: emit('stdout'), debug: emit('stdout'), warn: emit('stderr'),
    error: emit('stderr'), dir: (o) => emit('stdout')(util.inspect(o, { depth: 4 })) }

  let ret, error = null, timedOut = false
  const handle = prog.handle = botHandle(body, prog)
  try {
    const src = `(async function (bot, Movements, goals, require, console) {\n${req.code}\n})`
    const fn = new vm.Script(src, { filename: `${body.name}-program-${prog.n}.js`, lineOffset: -1 }).runInContext(body.global)
    let timer
    const timeoutP = new Promise(resolve => { timer = setTimeout(() => resolve(TIMED_OUT), timeout * 1000) })
    const run = fn(handle, Movements, goals, programRequire, progConsole)
    run.catch(() => {})
    const r = await Promise.race([run, timeoutP])
    clearTimeout(timer)
    if (r === TIMED_OUT) timedOut = true
    else ret = r
  } catch (e) {
    error = fmtError(e)
  }
  if (timedOut) stopBody(body, prog)
  prog.done = true
  body.running = null

  const res = {
    n: prog.n,
    player: body.name,
    duration_s: r1((Date.now() - prog.start) / 1000),
    timed_out: timedOut,
    output: prog.out.join('\n'),
    return: timedOut || error ? null : jsonSafe(ret),
    error: timedOut ? `timed out after ${timeout}s: the program was stopped (pathfinder, controls and digging stopped; ` +
      'its bot no longer responds). Output above is what it logged until then.' : error,
    background: background.join('\n'),
    state: state(body),
    chat: body.chat.splice(0)
  }
  append('programs.jsonl', { n: prog.n, time: new Date(prog.start).toISOString(), iteration: req.iter || null, role: me.role, agent: me.agent,
    player: body.name, code: req.code, timeout, duration_s: res.duration_s, timed_out: timedOut, output: res.output,
    return: res.return, error: res.error, background: res.background, state: res.state,
    ...(prog.refusals.length ? { refused_actions: prog.refusals } : {}) })
  return res
}
const TIMED_OUT = Symbol('timed out')

function stopBody (body, prog) {
  prog.cancelled = true
  const b = body.bot
  for (const [event, fn] of prog.listeners) b.removeListener(event, fn)
  try { b.pathfinder.setGoal(null) } catch (e) {}
  try { b.clearControlStates() } catch (e) {}
  try { if (b.targetDigBlock) b.stopDigging() } catch (e) {}
  try { b.deactivateItem() } catch (e) {}
  // Movements built on the stopped handle would fail inside the pathfinder from now on.
  if (body.movements && body.movements.bot === prog.handle) {
    try { b.pathfinder.setMovements(new Movements(b)) } catch (e) {}
  }
}

// ---- views: one third-person prismarine view per body, kept across reconnects ----

const views = {}
function startView (body, port) {
  const express = require('express')
  const { setupRoutes } = require('prismarine-viewer/lib/common')
  const { WorldView } = require('prismarine-viewer/viewer/lib/worldView')
  const app = express()
  const server = http.createServer(app)
  const io = require('socket.io')(server, { path: '/socket.io' })
  setupRoutes(app, '')
  const sockets = new Set()
  io.on('connection', (socket) => {
    const bot = body.bot
    if (!bot || !body.spawned) { socket.disconnect(); return }
    sockets.add(socket)
    socket.emit('version', bot.version)
    const worldView = new WorldView(bot.world, 6, bot.entity.position, socket)
    worldView.init(bot.entity.position)
    const onMove = () => {
      socket.emit('position', { pos: bot.entity.position, yaw: bot.entity.yaw, addMesh: true })
      worldView.updatePosition(bot.entity.position)
    }
    bot.on('move', onMove)
    worldView.listenToBot(bot)
    socket.on('disconnect', () => {
      bot.removeListener('move', onMove)
      worldView.removeListenersFromBot(bot)
      sockets.delete(socket)
    })
  })
  server.listen(port, '0.0.0.0', () => log(`view of ${body.name} on :${port}`))
  views[body.name] = { reset: () => { for (const s of sockets) s.disconnect(true) } }
}

// ---- HTTP API (on a unix socket, MC_API_SOCK; used by tools/mc_arena.py) ----

function status () {
  const locks = readLocks()
  const out = {}
  for (const body of Object.values(bodies)) {
    const s = state(body)
    if (s.connected) {
      const b = body.bot
      s.held = b.heldItem ? `${b.heldItem.name} x${b.heldItem.count}` : null
      s.inventory = inventory(b)
      s.yaw = Math.round(b.entity.yaw * 100) / 100   // facing, for the viewer's map camera; not in program results
      s.pitch = Math.round(b.entity.pitch * 100) / 100
    }
    s.controller = locks[body.name] || null
    s.running = body.running ? { n: body.running.n, for_s: r1((Date.now() - body.running.start) / 1000) } : null
    s.connects = body.connects
    s.view_port = VIEW_PORT + PLAYERS.indexOf(body.name)
    out[body.name] = s
  }
  return out
}

function readBody (req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

const api = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }
  try {
    if (req.method === 'GET' && req.url === '/health') {
      const spawned = Object.fromEntries(Object.values(bodies).map(b => [b.name, b.spawned]))
      return send(200, { ready: Object.values(spawned).every(Boolean), spawned })
    }
    if (req.method === 'GET' && req.url === '/status') return send(200, status())
    if (req.method === 'POST' && req.url === '/run') {
      const agent = peerAgent(req.socket)   // read before the body: the client may close as soon as it has sent it
      return send(200, await runProgram({ ...(await readBody(req)), agent }))
    }
    if (req.method === 'POST' && req.url === '/locks/clear') {
      writeLocks({})
      append('events.jsonl', { time: now(), type: 'locks_cleared' })
      return send(200, { cleared: true })
    }
    send(404, { error: 'not found' })
  } catch (e) {
    send(500, { error: fmtError(e) })
  }
})

let shuttingDown = false
function shutdown () {
  if (shuttingDown) return
  shuttingDown = true
  log('shutting down')
  api.close()
  const ends = Object.values(bodies).filter(b => b.bot).map(b => new Promise(resolve => {
    b.bot.once('end', resolve)
    try { b.bot.quit('bot host stopping') } catch (e) { resolve() }
  }))
  // Bodies leave the server cleanly; a server that is already gone never answers, hence the bound.
  Promise.race([Promise.all(ends), new Promise(resolve => setTimeout(resolve, 5000))]).then(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// A unix socket reaches agents whose network namespace has no route to the host's 127.0.0.1 (agent_team/no_net.py).
fs.mkdirSync(path.dirname(API_SOCK), { recursive: true })
try { fs.unlinkSync(API_SOCK) } catch (e) { if (e.code !== 'ENOENT') throw e }
api.listen(API_SOCK, () => { fs.chmodSync(API_SOCK, 0o600); log(`api on ${API_SOCK}`) })
PLAYERS.forEach((name, i) => {
  startView(bodies[name], VIEW_PORT + i)
  connect(bodies[name])
})

// Once started, a program's stray async error must not take the other bodies down.
process.on('uncaughtException', (e) => log('uncaught exception:', fmtError(e)))
process.on('unhandledRejection', (e) => log('unhandled rejection:', fmtError(e)))
