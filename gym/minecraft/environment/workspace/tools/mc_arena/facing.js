// Records each body's facing from its view's position events (a bot host started before /status reported facing
// still sends it there), so the viewer's map can turn with the body without restarting the bot host.
//   node tools/mc_arena/facing.js OUT_JSON            (views on 127.0.0.1:3001..3004, MC_VIEW_PORT)
const fs = require('fs')
const io = require('socket.io-client')
const out = process.argv[2]
const base = parseInt(process.env.MC_VIEW_PORT || '3001')
const facing = {}
const players = ['p1', 'p2', 'p3', 'p4']
players.forEach((p, i) => {
  const s = io(`http://127.0.0.1:${base + i}`, { path: '/socket.io', reconnectionDelay: 5000 })
  s.on('position', d => { if (d && d.yaw !== undefined) facing[p] = { yaw: Math.round(d.yaw * 100) / 100, time: Date.now() } })
  s.on('loadChunk', () => {})   // the view streams the world too; ignored
})
setInterval(() => {
  try { fs.writeFileSync(out + '.tmp', JSON.stringify(facing)); fs.renameSync(out + '.tmp', out) } catch (e) {}
}, 1000)
