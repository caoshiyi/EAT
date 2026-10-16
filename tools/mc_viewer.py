#!/usr/bin/env python3
"""Live, read-only viewer of a minecraft run: the four bodies' third-person views (prismarine-viewer, served by the bot
host on ports 3001..3004) in a 2x2 grid, and beside them the milestones, each body's state, the chat, the deaths and
each player's last program with its output.

    python tools/mc_viewer.py [--port 17779] [--host 0.0.0.0]

Reads the world's files, .work/mc/records/ and the bot host's /status on every poll and never writes. The page polls
/data.json every 3 s.
"""
import argparse
import json
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import eval_minecraft as E  # noqa: E402
import mc_arena as A  # noqa: E402


def tail_jsonl(name: str, max_bytes: int = 4_000_000) -> list[dict]:
    """The records in the last max_bytes of a jsonl file (whole lines only)."""
    p = A.RECORDS / name
    if not p.exists():
        return []
    with open(p, "rb") as f:
        f.seek(0, 2)
        size = f.tell()
        f.seek(max(0, size - max_bytes))
        data = f.read().decode(errors="replace")
    lines = data.splitlines()
    if size > max_bytes:
        lines = lines[1:]
    out = []
    for line in lines:
        try:
            out.append(json.loads(line))
        except ValueError:
            pass
    return out


def first_program_time() -> str | None:
    p = A.RECORDS / "programs.jsonl"
    try:
        with open(p) as f:
            return json.loads(f.readline()).get("time")
    except (OSError, ValueError):
        return None


CODEX_SESSIONS = Path(os.environ.get("CODEX_HOME", Path.home() / ".codex")) / "sessions"
_usage = {"at": 0, "data": None}


def codex_usage() -> dict | None:
    """The ChatGPT plan's limits (latest Codex session) and this run's tokens (Codex sessions started in this checkout),
    re-read at most every 30 s."""
    if time.time() - _usage["at"] < 30:
        return _usage["data"]
    root, run, limits, latest = str(A.ROOT), {"input": 0, "cached": 0, "output": 0, "sessions": 0}, None, 0
    for f in CODEX_SESSIONS.rglob("rollout-*.jsonl") if CODEX_SESSIONS.exists() else []:
        mine, total, rl = False, None, None
        try:
            for line in open(f, errors="replace"):
                if '"session_meta"' in line:
                    mine = json.loads(line).get("payload", {}).get("cwd", "").startswith(root)
                elif '"token_count"' in line:
                    info = json.loads(line).get("payload", {})
                    total = (info.get("info") or {}).get("total_token_usage") or total
                    rl = info.get("rate_limits") or rl
        except (OSError, ValueError):
            continue
        if rl and f.stat().st_mtime > latest:
            latest, limits = f.stat().st_mtime, rl
        if mine and total:
            run["sessions"] += 1
            run["input"] += total.get("input_tokens", 0)
            run["cached"] += total.get("cached_input_tokens", 0)
            run["output"] += total.get("output_tokens", 0)
    windows = []
    for k in ("primary", "secondary"):
        w = (limits or {}).get(k)
        if w:
            windows.append({"minutes": w.get("window_minutes"), "used": w.get("used_percent"), "resets_at": w.get("resets_at")})
    _usage.update(at=time.time(), data={"plan": (limits or {}).get("plan_type"), "windows": windows, "run": run,
                                        "as_of": latest or None})
    return _usage["data"]


def build() -> dict:
    ms, deaths = E.milestones(record=False)
    try:
        status = A.api("GET", "/status", timeout=3)
    except (OSError, ValueError):
        status = None
    progs = tail_jsonl("programs.jsonl")
    last = {}
    for p in progs:
        if not p.get("refused"):
            last[p["player"]] = {k: p.get(k) for k in ("n", "time", "role", "code", "output", "error", "return",
                                                         "duration_s", "timed_out")}
    events = tail_jsonl("events.jsonl")
    chat = tail_jsonl("chat.jsonl", 400_000)
    return {
        "milestones": [{"name": m["name"], "reached": m["reached"][:1]} for m in ms],
        "status": status,
        "players": list(A.PLAYERS),
        "last": last,
        "chat": chat[-40:],
        "deaths": [e for e in events if e["type"] == "death"][-25:],
        "death_counts": deaths,
        "restarts": [e for e in events if e["type"] == "restart"][-10:],
        "programs": sum(1 for p in progs if not p.get("refused")),
        "start": first_program_time(),
        "usage": codex_usage(),
    }


PAGE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Minecraft arena</title>
<style>
:root { --bg:#f6f7f9; --card:#fff; --ink:#1d2330; --mute:#6b7280; --line:#e3e6eb; --ok:#1f8a4c; --bad:#c0392b; --acc:#2f6fdb; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
header { padding:10px 16px; display:flex; gap:16px; align-items:baseline; border-bottom:1px solid var(--line); background:var(--card); }
header h1 { font-size:17px; margin:0; } header span { color:var(--mute); }
main { display:grid; grid-template-columns:minmax(0,1fr) 430px; gap:12px; padding:12px; height:calc(100vh - 46px); }
.views { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:8px; min-height:0; }
.view { position:relative; background:#cfd6df; border-radius:8px; overflow:hidden; border:1px solid var(--line); }
.view iframe { width:100%; height:100%; border:0; }
.view .tag { position:absolute; left:8px; top:8px; background:rgba(255,255,255,.92); border-radius:6px; padding:3px 8px; font-size:12.5px; }
.side { overflow-y:auto; display:flex; flex-direction:column; gap:10px; min-height:0; }
.card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
.card h2 { font-size:13px; text-transform:uppercase; letter-spacing:.04em; color:var(--mute); margin:0 0 6px; }
.ms { display:grid; grid-template-columns:18px 1fr auto; gap:2px 6px; font-size:13px; }
.ms .y { color:var(--ok); font-weight:600; } .ms .n { color:#b8bec7; } .ms small { color:var(--mute); }
.body { border-top:1px solid var(--line); padding:6px 0; font-size:13px; } .body:first-of-type { border-top:0; }
.body b { display:inline-block; width:24px; } .mute { color:var(--mute); } .dead { color:var(--bad); font-weight:600; }
.chat div, .deaths div { font-size:13px; padding:1px 0; }
pre { margin:4px 0 0; background:#f3f4f6; border-radius:6px; padding:6px 8px; font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;
      max-height:160px; overflow:auto; white-space:pre-wrap; word-break:break-word; }
details summary { cursor:pointer; font-size:13px; }
.err { color:var(--bad); }
#stairs svg { width:100%; height:auto; display:block; } #stairs text { font-size:10.5px; fill:var(--mute); }
.bar { height:8px; background:#eceff3; border-radius:4px; overflow:hidden; margin:3px 0 6px; } .bar i { display:block; height:100%; background:var(--acc); }
@media (max-width: 900px) { main { grid-template-columns:1fr; height:auto; } .views { height:80vh; } }
</style></head><body>
<header><h1>Minecraft arena</h1><span id="sum"></span></header>
<main>
  <section class="views" id="views"></section>
  <aside class="side">
    <div class="card"><h2>The run, step by step</h2><div id="stairs"></div></div>
    <div class="card"><h2>Milestones</h2><div class="ms" id="ms"></div></div>
    <div class="card"><h2>Usage (Codex, ChatGPT plan)</h2><div id="usage" class="mute">no Codex usage yet</div></div>
    <div class="card"><h2>Bodies</h2><div id="bodies"></div></div>
    <div class="card chat"><h2>Chat</h2><div id="chat"></div></div>
    <div class="card deaths"><h2>Deaths</h2><div id="deaths"></div></div>
    <div class="card"><h2>Last program per player</h2><div id="progs"></div></div>
  </aside>
</main>
<script>
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const t = s => s ? new Date(s).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '';
const seenConnects = {};
let open = {};
function views(players, status) {
  const box = document.getElementById('views');
  players.forEach((p, i) => {
    let v = document.getElementById('v-' + p);
    const port = 3001 + i;
    if (!v) {
      v = document.createElement('div'); v.className = 'view'; v.id = 'v-' + p;
      v.innerHTML = `<iframe src="${location.protocol}//${location.hostname}:${port}/" title="${p}"></iframe><div class="tag"></div>`;
      box.appendChild(v);
    }
    const s = status && status[p];
    const c = s ? s.connects : null;
    if (c != null && seenConnects[p] != null && c !== seenConnects[p]) v.querySelector('iframe').src += '';   // body reconnected
    if (c != null) seenConnects[p] = c;
    v.querySelector('.tag').innerHTML = `<b>${p}</b> ` + (s && s.connected ? `${esc(s.dimension)} · ♥ ${s.health} · 🍗 ${s.food}` : 'offline');
  });
}
const PCOL = {p1:'#1aa1b5', p2:'#8e5bd6', p3:'#e08a1e', p4:'#3f9a4e'};
function stairs(d) {
  const W = 400, H = 250, L = 104, R = 10, T = 8, B = 26;
  const short = n => n.replace(/\s*\(.*\)$/, '').replace(/^Ender Dragon defeated$/, 'dragon');
  const names = ['bare hands'].concat(d.milestones.map(m => short(m.name)));
  const t0 = d.start ? Date.parse(d.start) : null;
  const pts = d.milestones.map((m, i) => m.reached[0] ? {i: i + 1, t: Date.parse(m.reached[0].time), p: m.reached[0].player} : null).filter(Boolean)
                .sort((a, b) => a.t - b.t);
  const now = Date.now();
  const hrs = t0 ? Math.max(1, (now - t0) / 3.6e6) : 1;
  const step = hrs <= 3 ? 0.5 : hrs <= 8 ? 1 : hrs <= 24 ? 3 : 6;
  const X = h => L + (W - L - R) * h / (Math.ceil(hrs / step) * step), Y = i => H - B - (H - B - T) * i / (names.length - 1);
  let g = '';
  names.forEach((n, i) => g += `<line x1="${L}" x2="${W - R}" y1="${Y(i)}" y2="${Y(i)}" stroke="#eef0f3"/><text x="${L - 6}" y="${Y(i) + 3.5}" text-anchor="end">${esc(n)}</text>`);
  for (let h = 0; h <= Math.ceil(hrs / step) * step + 1e-9; h += step) g += `<text x="${X(h)}" y="${H - 8}" text-anchor="middle">${h}h</text>`;
  if (t0) {
    let level = 0, x = X(0);
    pts.forEach(q => {
      const xq = X(Math.max(0, (q.t - t0) / 3.6e6));
      g += `<line x1="${x}" x2="${xq}" y1="${Y(level)}" y2="${Y(level)}" stroke="#9aa3ae" stroke-width="2"/>`;
      const top = Math.max(level, q.i);
      g += `<line x1="${xq}" x2="${xq}" y1="${Y(level)}" y2="${Y(top)}" stroke="${PCOL[q.p] || '#555'}" stroke-width="2.5"/><circle cx="${xq}" cy="${Y(q.i)}" r="3.5" fill="${PCOL[q.p] || '#555'}"><title>${esc(names[q.i])}: ${esc(q.p)} at +${((q.t - t0) / 3.6e6).toFixed(2)}h</title></circle>`;
      level = top; x = xq;
    });
    g += `<line x1="${x}" x2="${X(hrs)}" y1="${Y(level)}" y2="${Y(level)}" stroke="#9aa3ae" stroke-width="2" stroke-dasharray="3 3"/>`;
  }
  const legend = Object.entries(PCOL).map(([p, c]) => `<span style="color:${c}">● ${p}</span>`).join(' &nbsp;');
  document.getElementById('stairs').innerHTML = `<svg viewBox="0 0 ${W} ${H}">${g}</svg><div style="font-size:12px">${legend} <span class="mute">· hours since the first program; each step coloured by who reached it first</span></div>`;
}
function usage(u) {
  if (!u || (!u.windows.length && !u.run.sessions)) return;
  const win = m => m >= 10080 ? 'weekly' : m >= 300 ? (m / 60) + '-hour' : m + '-min';
  const rows = u.windows.map(w => `<div>${win(w.minutes)} limit: <b>${w.used}%</b> used <span class="mute">· resets ${t(new Date(w.resets_at * 1000))}</span></div><div class="bar"><i style="width:${Math.min(100, w.used)}%"></i></div>`).join('');
  const k = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'k' : n;
  const r = u.run;
  document.getElementById('usage').innerHTML = `${u.plan ? '<div class="mute">plan: ' + esc(u.plan) + '</div>' : ''}${rows}<div>this run: ${k(r.input)} input tokens (${r.input ? Math.round(100 * r.cached / r.input) : 0}% cached), ${k(r.output)} output, ${r.sessions} Codex sessions</div>${u.as_of ? '<div class="mute">limits as of ' + t(new Date(u.as_of * 1000)) + '</div>' : ''}`;
}
function render(d) {
  stairs(d); usage(d.usage);
  const st = d.status;
  views(d.players, st);
  const n = d.milestones.filter(m => m.reached.length).length;
  const deaths = Object.values(d.death_counts).reduce((a, b) => a + b, 0);
  document.getElementById('sum').textContent = `${n} of ${d.milestones.length} milestones · ${d.programs} programs · ${deaths} deaths · ${d.restarts.length ? d.restarts.length + ' recent restarts' : 'no restarts'}` + (st ? '' : ' · bot host not reachable');
  document.getElementById('ms').innerHTML = d.milestones.map(m => {
    const r = m.reached[0];
    return `<span class="${r ? 'y' : 'n'}">${r ? '✓' : '○'}</span><span>${esc(m.name)}</span><small>${r ? esc(r.player) + ' · ' + t(r.time) : ''}</small>`;
  }).join('');
  document.getElementById('bodies').innerHTML = d.players.map(p => {
    const s = st && st[p];
    if (!s || !s.connected) return `<div class="body"><b>${p}</b> <span class="mute">offline</span></div>`;
    const pos = s.position, inv = s.inventory.items;
    const items = Object.entries(inv).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`).join(', ') || 'empty';
    const who = s.controller ? s.controller.role : 'free';
    return `<div class="body"><b>${p}</b> ${s.alive ? '' : '<span class="dead">dead</span> '}(${pos.x}, ${pos.y}, ${pos.z}) ${esc(s.dimension)} · ♥ ${s.health} · 🍗 ${s.food} · <span class="mute">${esc(who)}${s.running ? ' · running #' + s.running.n : ''}</span>
      <div class="mute">held: ${esc(s.held || 'nothing')} · ${esc(items)}</div></div>`;
  }).join('');
  document.getElementById('chat').innerHTML = d.chat.slice().reverse().map(c => `<div><span class="mute">${t(c.time)}</span> <b>${esc(c.player)}</b>: ${esc(c.text)}</div>`).join('') || '<span class="mute">no chat yet</span>';
  document.getElementById('deaths').innerHTML = d.deaths.slice().reverse().map(e => `<div><span class="mute">${t(e.time)}</span> ${esc(e.cause)}</div>`).join('') || '<span class="mute">none</span>';
  document.querySelectorAll('#progs details').forEach(x => open[x.dataset.p] = x.open);
  document.getElementById('progs').innerHTML = d.players.map(p => {
    const g = d.last[p];
    if (!g) return `<div class="body"><b>${p}</b> <span class="mute">no program yet</span></div>`;
    const res = g.error ? `<pre class="err">${esc(g.error)}</pre>` : (g.return != null ? `<pre>${esc(JSON.stringify(g.return))}</pre>` : '');
    return `<details data-p="${p}" ${open[p] ? 'open' : ''}><summary><b>${p}</b> #${g.n} · ${esc(g.role)} · ${g.duration_s} s${g.timed_out ? ' · timed out' : ''} <span class="mute">${t(g.time)}</span></summary>
      <pre>${esc(g.code)}</pre>${g.output ? `<pre>${esc(g.output)}</pre>` : ''}${res}</details>`;
  }).join('');
}
async function poll() {
  try { render(await (await fetch('data.json', {cache: 'no-store'})).json()); } catch (e) { document.getElementById('sum').textContent = 'viewer not reachable'; }
  setTimeout(poll, 3000);
}
poll();
</script></body></html>
"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] == "/data.json":
            body, ctype = json.dumps(build()).encode(), "application/json"
        elif self.path.split("?")[0] in ("/", "/index.html"):
            body, ctype = PAGE.encode(), "text/html; charset=utf-8"
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("content-type", ctype)
        self.send_header("content-length", str(len(body)))
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=17779)
    ap.add_argument("--host", default="0.0.0.0")
    a = ap.parse_args()
    print(f"minecraft viewer on http://{a.host}:{a.port}/", flush=True)
    ThreadingHTTPServer((a.host, a.port), Handler).serve_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
