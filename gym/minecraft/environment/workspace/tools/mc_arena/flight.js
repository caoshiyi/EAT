// Flight recorder: what the bodies' own clients see, written for later study and replay; never read by agents.
// While any body is in the End: one row every 100 ms (dragons, crystals, players, projectiles near the island) and
// events as they happen (hurt, death, each body's swing/attack/dig/place packet with the sight verdict). Elsewhere: body
// positions once a second. Rows are buffered and written every few seconds as one gzip member appended to
// MC_DIR/records/flight/<UTC date>/flight_<HHMMSS>.jsonl.gz (a new file per bot host start and per UTC hour), so a
// crash loses at most one buffer and the file stays a valid gzip stream.
'use strict'
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const END_MS = 100                 // two game ticks
const OUT_MS = 1000
const FLUSH_MS = 5000
const ISLAND = 160                 // projectiles within this many blocks of (0, 0)
const PROJECTILES = new Set(['arrow', 'spectral_arrow', 'trident', 'dragon_fireball', 'fireball', 'small_fireball',
  'area_effect_cloud', 'snowball', 'egg', 'ender_pearl', 'potion', 'experience_bottle', 'firework_rocket'])

const r2 = x => Math.round(x * 100) / 100
const deg = rad => r2(((180 - rad * 180 / Math.PI) % 360 + 540) % 360 - 180)   // mineflayer yaw -> Minecraft degrees
const pdeg = rad => r2(-rad * 180 / Math.PI)
const pos = p => [r2(p.x), r2(p.y), r2(p.z)]
const inEnd = b => b && b.game && b.game.dimension === 'the_end'

function create ({ dir, bodies, registry, log }) {
  const keyIdx = name => n => (registry.entitiesByName[name]?.metadataKeys || []).indexOf(n)
  const DRAGON_HP = keyIdx('ender_dragon')('health')
  const DRAGON_PHASE = keyIdx('ender_dragon')('phase')
  const PLAYER_HP = keyIdx('player')('health')

  let buf = []
  let file = null
  let fileHour = null
  let writing = Promise.resolve()
  let last = 0
  const prev = new Map()           // dragon id -> [t, x, y, z] for its velocity
  const recent = new Map()         // event key -> time (the same hurt seen by several bodies is one event)

  const rec = (row) => { buf.push(JSON.stringify(row)) }

  function target () {
    const d = new Date()
    const hour = d.toISOString().slice(0, 13)
    if (hour !== fileHour || !file) {
      fileHour = hour
      const day = path.join(dir, d.toISOString().slice(0, 10))
      fs.mkdirSync(day, { recursive: true })
      file = path.join(day, `flight_${d.toISOString().slice(11, 19).replace(/:/g, '')}.jsonl.gz`)
    }
    return file
  }

  function flush () {
    if (!buf.length) return
    const data = buf.join('\n') + '\n'
    buf = []
    const f = target()
    writing = writing.then(() => new Promise(resolve => zlib.gzip(data, (e, z) => {
      if (e) { log(`flight: gzip failed: ${e.message}`); return resolve() }
      fs.appendFile(f, z, e2 => { if (e2) log(`flight: write failed: ${e2.message}`); resolve() })
    })))
  }

  function flushSync () {
    if (!buf.length) return
    try { fs.appendFileSync(target(), zlib.gzipSync(buf.join('\n') + '\n')) } catch (e) { log(`flight: final write failed: ${e.message}`) }
    buf = []
  }

  function bodyRow (body) {
    const b = body.bot
    if (!b || !body.spawned || !b.entity) return { name: body.name, connected: false }
    return { name: body.name, pos: pos(b.entity.position), yaw: deg(b.entity.yaw), pitch: pdeg(b.entity.pitch),
      health: r2(b.health ?? 0), food: b.food, held: b.heldItem ? b.heldItem.name : null, dim: b.game?.dimension }
  }

  function sample () {
    const t = Date.now()
    const list = Object.values(bodies)
    const end = list.filter(x => x.spawned && inEnd(x.bot))
    if (!end.length) {
      if (t - last < OUT_MS) return
      last = t
      rec({ t, k: 'pos', players: list.map(bodyRow) })
      return
    }
    last = t
    const seen = new Map()         // entity id -> entity, from every body in the End (ids are the server's)
    for (const x of end) for (const e of Object.values(x.bot.entities)) if (!seen.has(e.id)) seen.set(e.id, e)
    const dragons = []; const crystals = []; const others = []; const shots = []
    const bodyIds = new Set(end.map(x => x.bot.entity.id))
    for (const e of seen.values()) {
      if (e.name === 'ender_dragon') {
        const p = e.position
        const q = prev.get(e.id)
        const dt = q ? (t - q[0]) / 1000 : 0
        prev.set(e.id, [t, p.x, p.y, p.z])
        dragons.push({ id: e.id, pos: pos(p), yaw: deg(e.yaw), pitch: pdeg(e.pitch),
          vel: dt > 0 && dt < 1 ? [r2((p.x - q[1]) / dt), r2((p.y - q[2]) / dt), r2((p.z - q[3]) / dt)] : null,
          health: e.metadata?.[DRAGON_HP] ?? null, phase: e.metadata?.[DRAGON_PHASE] ?? null })
      } else if (e.name === 'end_crystal') {
        crystals.push({ id: e.id, pos: pos(e.position) })
      } else if (e.type === 'player' && !bodyIds.has(e.id)) {
        others.push({ name: e.username, id: e.id, pos: pos(e.position), yaw: deg(e.yaw), pitch: pdeg(e.pitch),
          health: e.metadata?.[PLAYER_HP] ?? null, dim: 'the_end' })
      } else if (PROJECTILES.has(e.name) && Math.hypot(e.position.x, e.position.z) < ISLAND) {
        shots.push({ id: e.id, type: e.name, pos: pos(e.position) })
      }
    }
    for (const id of prev.keys()) if (!seen.has(id)) prev.delete(id)
    rec({ t, k: 'end', dragons, crystals, players: list.map(bodyRow).concat(others), projectiles: shots })
  }

  function entityInfo (e) {
    return e ? { id: e.id, type: e.name || e.type, name: e.username, pos: e.position ? pos(e.position) : null } : null
  }

  // Hurt and death as each body's client hears them; outside the End only the players'.
  function watch (body, bot) {
    const ev = (kind) => (e) => {
      if (!e || !(inEnd(bot) || e.type === 'player')) return
      const t = Date.now()
      const key = `${kind}:${e.id}`
      if (t - (recent.get(key) || 0) < 150) return
      recent.set(key, t)
      if (recent.size > 500) for (const [k, v] of recent) if (t - v > 1000) recent.delete(k)
      const row = { t, k: kind, entity: entityInfo(e), seen_by: body.name, dim: bot.game?.dimension }
      if (e.name === 'ender_dragon') row.health = e.metadata?.[DRAGON_HP] ?? null
      rec(row)
    }
    bot.on('entityHurt', ev('hurt'))
    bot.on('entityDead', ev('dead'))
  }

  // Every swing/attack/dig/place packet a body's client tries to send, with the sight verdict.
  const VERB = { arm_animation: 'swing', block_place: 'place' }
  function action (body, bot, name, params, refusal, resolve) {
    let row
    if (name === 'use_entity') {
      const kind = params.mouse === 1 ? 'attack' : 'interact'
      const tgt = resolve(params.target)
      row = { k: kind, target: params.target, entity: entityInfo(tgt) }
    } else if (name === 'block_dig') {
      if (params.status !== 0 && params.status !== 2) return
      row = { k: params.status === 0 ? 'dig_start' : 'dig_finish', block: [params.location.x, params.location.y, params.location.z] }
      const b = bot.blockAt?.(params.location)
      if (b) row.name = b.name
    } else if (name === 'block_place') {
      row = { k: 'place', block: [params.location.x, params.location.y, params.location.z], face: params.direction,
        held: bot.heldItem ? bot.heldItem.name : null }
    } else if (VERB[name]) {
      row = { k: VERB[name] }
    } else return
    rec({ t: Date.now(), ...row, player: body.name, accepted: !refusal, ...(refusal ? { refusal } : {}),
      at: bot.entity ? pos(bot.entity.position) : null, dim: bot.game?.dimension })
  }

  function refused (body, why, via) { rec({ t: Date.now(), k: 'refused', player: body.name, via, refusal: why }) }

  const tick = setInterval(() => { try { sample() } catch (e) { log(`flight: sample failed: ${e.message}`) } }, END_MS)
  const flusher = setInterval(flush, FLUSH_MS)
  tick.unref(); flusher.unref()
  rec({ t: Date.now(), k: 'start', pid: process.pid })
  return {
    watch,
    action,
    refused,
    stop () { clearInterval(tick); clearInterval(flusher); rec({ t: Date.now(), k: 'stop' }); flushSync() }
  }
}

module.exports = { create }
