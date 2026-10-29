#!/usr/bin/env bash
# One-time setup of the minecraft task: vanilla 1.20.4 server under .work/mc/server, its configuration, node deps.
#   MC_SEED=<seed> bash tasks/minecraft/setup.sh      (no MC_SEED: a random seed; the seed is kept in .work/mc/seed)
# Re-running keeps the world and its seed; to start a new world move .work/mc/server/world away first.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MC="${MC_DIR:-$ROOT/.work/mc}"
SRV="$MC/server"
VERSION=1.20.4
PLAYERS="p1 p2 p3 p4"
mkdir -p "$SRV" "$MC/records"

if [ ! -f "$SRV/server.jar" ]; then
    url=$(curl -fsSL https://piston-meta.mojang.com/mc/game/version_manifest_v2.json |
          python3 -c "import json,sys; print(next(v['url'] for v in json.load(sys.stdin)['versions'] if v['id']=='$VERSION'))")
    read -r jar sha < <(curl -fsSL "$url" | python3 -c "import json,sys; s=json.load(sys.stdin)['downloads']['server']; print(s['url'], s['sha1'])")
    curl -fsSL "$jar" -o "$SRV/server.jar.part"
    got=$(sha1sum "$SRV/server.jar.part" | cut -d' ' -f1)
    [ "$got" = "$sha" ] || { echo "server.jar sha1 mismatch: $got != $sha" >&2; exit 1; }
    mv "$SRV/server.jar.part" "$SRV/server.jar"
    echo "$sha  server.jar ($VERSION)" > "$SRV/server.jar.sha1"
fi

echo "eula=true" > "$SRV/eula.txt"

# The seed is fixed once the world exists.
if [ -f "$MC/seed" ]; then
    SEED=$(cat "$MC/seed")
    if [ -n "${MC_SEED:-}" ] && [ "$MC_SEED" != "$SEED" ]; then
        [ -d "$SRV/world" ] && { echo "world exists with seed $SEED; MC_SEED=$MC_SEED ignored (move $SRV/world away for a new world)" >&2; } || SEED="$MC_SEED"
    fi
else
    SEED="${MC_SEED:-$(python3 -c 'import random; print(random.randint(-2**63, 2**63 - 1))')}"
fi
echo "$SEED" > "$MC/seed"

[ -s "$MC/rcon.secret" ] || { python3 -c 'import secrets; print(secrets.token_hex(16))' > "$MC/rcon.secret"; }
chmod 600 "$MC/rcon.secret"

cat > "$SRV/server.properties" <<EOF
server-ip=127.0.0.1
server-port=${MC_PORT:-25565}
online-mode=false
enforce-secure-profile=false
difficulty=easy
gamemode=survival
force-gamemode=true
hardcore=false
pvp=true
enable-command-block=false
spawn-protection=0
max-players=8
white-list=true
enforce-whitelist=true
allow-flight=false
level-name=world
level-seed=$SEED
enable-rcon=true
rcon.port=${MC_RCON_PORT:-25575}
rcon.password=$(cat "$MC/rcon.secret")
broadcast-rcon-to-ops=false
broadcast-console-to-ops=false
op-permission-level=0
function-permission-level=2
enable-query=false
motd=EAT minecraft arena
view-distance=10
simulation-distance=10
sync-chunk-writes=true
EOF

# Offline-mode players: uuid = nameUUIDFromBytes("OfflinePlayer:" + name)
python3 - "$SRV" $PLAYERS <<'EOF'
import hashlib, json, sys, uuid
srv, names = sys.argv[1], sys.argv[2:]
def offline(n):
    b = bytearray(hashlib.md5(f"OfflinePlayer:{n}".encode()).digest())
    b[6] = (b[6] & 0x0f) | 0x30
    b[8] = (b[8] & 0x3f) | 0x80
    return str(uuid.UUID(bytes=bytes(b)))
json.dump([{"uuid": offline(n), "name": n} for n in names], open(f"{srv}/whitelist.json", "w"), indent=2)
json.dump([], open(f"{srv}/ops.json", "w"))
EOF

(cd "$ROOT/tools/mc_arena" && npm ci --no-audit --no-fund --loglevel=error)
echo "minecraft $VERSION ready in $SRV (seed $SEED); start with: python3 tools/mc_arena.py up"
