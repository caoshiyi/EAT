// What a player with the vanilla 1.20.4 client can act on. The client sends an attack/use for the entity or block under
// its crosshair, and its pick ray stops at the first block; the server checks only reach. So the bot host checks sight:
// a target counts when some ray from the eye to a point on it is clear of blocks and within the client's reach.
//
// Enforced on every path a packet takes out of the bot host, for the bodies' own connections:
//   Client.prototype.write      use_entity / block_dig (start) / block_place: refused with an error the caller sees
//   net.Socket _writeGeneric    every frame on a body's socket is parsed; a targeted packet that the write above did
//                               not pass is checked again and dropped if refused (serializer, compressor, framer,
//                               writeRaw, socket.write/end: whatever bypasses Client.write ends here)
//   net.Socket connect          no outbound connection except the bot host's own bodies (no second client)
// The three are frozen (non-writable, non-configurable) and close over the originals.
'use strict'
const net = require('net')
const zlib = require('zlib')
const { Vec3 } = require('vec3')
const { Client } = require('minecraft-protocol')
const { createDeserializer } = require('minecraft-protocol/src/transforms/serializer')

// 1.20.4 client (GameRenderer.pick): blocks 4.5 and entities 3.0 in survival/adventure; creative 5.0 and 6.0.
const REACH = { survival: { block: 4.5, entity: 3.0 }, creative: { block: 5.0, entity: 6.0 } }
const FACES = ['bottom (-y)', 'top (+y)', 'north (-z)', 'south (+z)', 'west (-x)', 'east (+x)']
const NORMAL = [[0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]]
const GRID = [0.5, 0.1, 0.9]       // sample points per axis; the centre first, so a refusal names the central blocker
const EPS = 1e-4
const DRAGON_PARTS = 8             // a vanilla client targets the dragon's parts: ids dragon+1 .. dragon+8

const fmt = p => `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`
const r2 = x => Math.round(x * 100) / 100
const reach = bot => bot.game?.gameMode === 'creative' ? REACH.creative : REACH.survival
const eyeOf = bot => bot.entity.position.offset(0, bot.entity.eyeHeight ?? 1.62, 0)

// Distance along the unit ray from `o` to where it enters box b = [x0,y0,z0,x1,y1,z1]; 0 inside, Infinity if missed.
function entry (o, d, b) {
  let t0 = 0; let t1 = Infinity
  for (const [a, lo, hi] of [['x', b[0], b[3]], ['y', b[1], b[4]], ['z', b[2], b[5]]]) {
    if (Math.abs(d[a]) < 1e-12) { if (o[a] < lo || o[a] > hi) return Infinity; continue }
    let u = (lo - o[a]) / d[a]; let v = (hi - o[a]) / d[a]
    if (u > v) [u, v] = [v, u]
    t0 = Math.max(t0, u); t1 = Math.min(t1, v)
    if (t0 > t1) return Infinity
  }
  return t0
}

// The first block with a collision shape on the ray, if it is nearer than `dist`.
function blockerBefore (bot, eye, dir, dist) {
  const hit = bot.world.raycast(eye, dir, dist + 0.01)
  return hit && hit.intersect.distanceTo(eye) < dist - EPS ? hit : null
}

function entityTarget (bot, id) {
  const e = bot.entities[id]
  if (e) return e
  for (let k = 1; k <= DRAGON_PARTS; k++) {
    const d = bot.entities[id - k]
    if (d && d.name === 'ender_dragon') return d
  }
  return null
}

// null when the vanilla client could target the entity, else why not.
function entityRefusal (bot, entity) {
  const who = bot.username
  const what = `${entity.name || entity.type || 'entity'} #${entity.id}`
  if (entity === bot.entity) return `${what} is ${who} itself`
  const R = reach(bot).entity
  const eye = eyeOf(bot)
  const p = entity.position
  const w = entity.width ?? 0.6; const h = entity.height ?? 1.8
  const box = [p.x - w / 2, p.y, p.z - w / 2, p.x + w / 2, p.y + h, p.z + w / 2]
  let nearest = Infinity; let blocker = null
  for (const fx of GRID) {
    for (const fy of GRID) {
      for (const fz of GRID) {
        const q = new Vec3(box[0] + fx * w, box[1] + fy * h, box[2] + fz * w)
        const v = q.minus(eye); const len = v.norm()
        const dir = len < EPS ? new Vec3(0, 1, 0) : v.scaled(1 / len)
        const t = len < EPS ? 0 : entry(eye, dir, box)
        if (t > R + EPS) { nearest = Math.min(nearest, t); continue }
        const b = t > 0 ? blockerBefore(bot, eye, dir, t) : null
        if (!b) return null
        blocker = blocker || b
      }
    }
  }
  if (blocker) return `${what} not visible from ${who}'s eye (blocked by ${blocker.name} at ${fmt(blocker.position)})`
  return `${what} is out of reach: ${r2(nearest)} blocks from ${who}'s eye; the vanilla client reaches entities within ${R.toFixed(1)}`
}

// The block (and, if given, that face of it) as the vanilla client could target it:
// { face, cursor } of a clear ray's hit, or { refusal }.
function blockSight (bot, pos, face) {
  pos = new Vec3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z))
  const who = bot.username
  const block = bot.blockAt(pos)
  if (!block) return { refusal: `the block at ${fmt(pos)} is not loaded for ${who}` }
  const what = `${block.name} at ${fmt(pos)}` + (face != null ? ` (face ${FACES[face] ?? face})` : '')
  if (face != null && !NORMAL[face]) return { refusal: `${what}: no such face` }
  const R = reach(bot).block
  const eye = eyeOf(bot)
  const solid = block.shapes && block.shapes.length > 0
  const shapes = solid ? block.shapes : [[0, 0, 0, 1, 1, 1]]
  let nearest = Infinity; let blocker = null; let facing = false
  for (const f of face != null ? [face] : [0, 1, 2, 3, 4, 5]) {
    const n = NORMAL[f]
    const axis = n[0] ? 0 : n[1] ? 1 : 2
    for (const s of shapes) {
      const plane = (n[axis] > 0 ? s[axis + 3] : s[axis]) + [pos.x, pos.y, pos.z][axis]
      if ((([eye.x, eye.y, eye.z][axis]) - plane) * n[axis] <= EPS) continue   // the face looks away from the eye
      facing = true
      const [u, w] = [0, 1, 2].filter(a => a !== axis)
      for (const gu of GRID) {
        for (const gw of GRID) {
          const c = [0, 0, 0]
          c[axis] = plane
          c[u] = [pos.x, pos.y, pos.z][u] + s[u] + gu * (s[u + 3] - s[u])
          c[w] = [pos.x, pos.y, pos.z][w] + s[w] + gw * (s[w + 3] - s[w])
          const q = new Vec3(c[0], c[1], c[2])
          const v = q.minus(eye); const d = v.norm()
          if (d > R + EPS) { nearest = Math.min(nearest, d); continue }
          const dir = v.scaled(1 / d)
          const hit = bot.world.raycast(eye, dir, d + 0.01)
          const hd = hit ? hit.intersect.distanceTo(eye) : Infinity
          if (solid && hit && hit.position.equals(pos) && (face == null || hit.face === face)) {
            return { face: hit.face, cursor: hit.intersect.minus(pos) }
          }
          if (!solid && hd >= d - EPS) return { face: f, cursor: q.minus(pos) }
          if (hit && hd < d - EPS && !hit.position.equals(pos)) blocker = blocker || hit
        }
      }
    }
  }
  if (!facing) return { refusal: `${what} faces away from ${who}'s eye` }
  if (blocker) return { refusal: `${what} not visible from ${who}'s eye (blocked by ${blocker.name} at ${fmt(blocker.position)})` }
  if (nearest < Infinity) return { refusal: `${what} is out of reach: ${r2(nearest)} blocks from ${who}'s eye; the vanilla client reaches blocks within ${R.toFixed(1)}` }
  return { refusal: `${what} not visible from ${who}'s eye` }
}

// null when the packet is not a targeted one or the vanilla client could send it; else why it could not.
function packetRefusal (bot, name, params) {
  if (name !== 'use_entity' && name !== 'attack' && name !== 'block_dig' && name !== 'block_place') return null
  if (name === 'block_dig' && params?.status !== 0) return null   // only starting to dig targets a block
  if (!bot.entity || !bot.world) return `${bot.username} is not in the world`
  if (name === 'use_entity' || name === 'attack') {
    const id = name === 'attack' ? params?.entityId : params?.target
    const e = entityTarget(bot, id)
    return e ? entityRefusal(bot, e) : `entity #${id} is not known to ${bot.username}'s client`
  }
  const loc = params?.location
  if (!loc) return 'no target block'
  return blockSight(bot, loc, name === 'block_place' ? params.direction : null).refusal || null
}

// Packets reported to a body's onAction (the flight recorder), refused or not.
const ACTIONS = new Set(['use_entity', 'block_dig', 'block_place', 'arm_animation'])

const keyOf = (name, p) => name === 'block_dig' ? `${name}:${p.status}:${fmt(p.location)}`
  : name === 'block_place' ? `${name}:${fmt(p.location)}:${p.direction}`
    : `${name}:${p.target ?? p.entityId}:${p.mouse ?? ''}`

// ---- the frozen guards ----

const clients = new WeakMap()     // a body's Client -> { bot, approved: [[key, time]], onRefuse }
const sockets = new WeakMap()     // that client's socket -> the same record
let allowConnect = 0
let installed = false

function freeze (obj, prop, value) {
  Object.defineProperty(obj, prop, { value, writable: false, configurable: false, enumerable: false })
}

function readVarInt (buf, off) {
  let v = 0
  for (let i = 0; i < 5; i++) {
    if (off + i >= buf.length) return null
    const b = buf[off + i]
    v |= (b & 0x7f) << (7 * i)
    if (!(b & 0x80)) return [v, i + 1]
  }
  return null
}

function install (version) {
  if (installed) return
  installed = true
  const md = require('minecraft-data')(version)
  const ids = new Set()
  const mappings = md.protocol.play.toServer.types.packet[1][0].type[1].mappings
  for (const [id, name] of Object.entries(mappings)) {
    if (['use_entity', 'attack', 'block_dig', 'block_place'].includes(name)) ids.add(parseInt(id, 16))
  }
  const parser = createDeserializer({ state: 'play', isServer: true, version })

  const write = Client.prototype.write
  freeze(Client.prototype, 'write', function (name, params) {
    const rec = clients.get(this)
    if (rec) {
      const why = packetRefusal(rec.bot, name, params)
      if (rec.onAction && ACTIONS.has(name)) {
        try { rec.onAction(name, params, why) } catch (e) {}
      }
      if (why) {
        rec.onRefuse(why, 'call')
        throw new Error(`REFUSED: ${why}`)
      }
      if (ids.size && ['use_entity', 'attack', 'block_dig', 'block_place'].includes(name)) {
        const now = Date.now()
        rec.approved = rec.approved.filter(([, t]) => now - t < 10000)
        rec.approved.push([keyOf(name, params), now])
      }
    }
    return write.call(this, name, params)
  })

  // Every frame a body's socket sends: a targeted packet that Client.write did not pass is checked again here.
  const writeGeneric = net.Socket.prototype._writeGeneric
  freeze(net.Socket.prototype, '_writeGeneric', function (writev, data, encoding, cb) {
    const rec = sockets.get(this)
    if (!rec || !rec.played) return writeGeneric.call(this, writev, data, encoding, cb)
    const parts = writev ? Array.from(data, c => c.chunk ?? c) : [data]
    const bufs = parts.map((c, i) => Buffer.isBuffer(c) ? c : Buffer.from(c, writev ? (data[i].encoding || 'utf8') : encoding))
    const buf = bufs.length === 1 ? bufs[0] : Buffer.concat(bufs)
    const keep = []
    let off = 0
    while (off < buf.length) {
      const len = readVarInt(buf, off)
      if (!len || off + len[1] + len[0] > buf.length) { rec.onRefuse(`raw bytes on ${rec.bot.username}'s connection that are not whole packets (${buf.length - off} bytes dropped)`, 'socket'); break }
      const frame = buf.subarray(off, off + len[1] + len[0])
      off += len[1] + len[0]
      let why = null
      try {
        let pkt = frame.subarray(len[1])
        if (rec.client.compressionThreshold >= 0) {
          const dl = readVarInt(pkt, 0)
          pkt = dl[0] === 0 ? pkt.subarray(dl[1]) : zlib.inflateSync(pkt.subarray(dl[1]))
        }
        const id = readVarInt(pkt, 0)
        if (ids.has(id[0])) {
          const { name, params } = parser.parsePacketBuffer(pkt).data
          const k = keyOf(name, params)
          const i = rec.approved.findIndex(([x]) => x === k)
          if (i >= 0) rec.approved.splice(i, 1)
          else why = packetRefusal(rec.bot, name, params)
        }
      } catch (e) { why = `a packet on ${rec.bot.username}'s connection that does not parse (${e.message})` }
      if (why) rec.onRefuse(`${why} (raw packet dropped)`, 'socket')
      else keep.push(frame)
    }
    if (keep.length === 0) { if (typeof cb === 'function') process.nextTick(cb); return }
    return writeGeneric.call(this, false, keep.length === 1 ? keep[0] : Buffer.concat(keep), 'buffer', cb)
  })

  const connect = net.Socket.prototype.connect
  freeze(net.Socket.prototype, 'connect', function (...args) {
    if (allowConnect <= 0) throw new Error('REFUSED: the bot host opens no connections besides its own four bodies')
    return connect.apply(this, args)
  })
}

// Opens a body's connection (the only connections allowed) and puts it under the guards. onAction(name, params,
// refusal) hears every swing/attack/dig/place the client tries to send.
function connectBody (create, onRefuse, onAction = null) {
  allowConnect++
  let bot
  try { bot = create() } finally { allowConnect-- }
  const rec = { bot, client: bot._client, approved: [], onRefuse, onAction, played: false }
  clients.set(bot._client, rec)
  const watch = (s) => { if (s) sockets.set(s, rec) }
  watch(bot._client.socket)
  bot._client.on('connect', () => watch(bot._client.socket))
  bot.once('login', () => { rec.played = true })
  return bot
}

module.exports = { install, connectBody, blockSight, entityRefusal, packetRefusal, entityTarget, REACH }
