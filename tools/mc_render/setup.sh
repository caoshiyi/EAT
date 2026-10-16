#!/usr/bin/env bash
# One-time setup of the offline renderers under .work/mc/render (pinned jars, each checksum-verified):
#   bash tools/mc_render/setup.sh [--pixel-perfection]
# BlueMap 5.16 CLI (MIT; the last release that runs on Java 21, later ones need Java 25), Chunky 2.5.0 snapshot 483
# (GPLv3) with its OpenCL renderer plugin 0.3.0 (GPLv3, needs the 2.5.0 snapshots), the vanilla 1.20.4 client jar
# (block models and textures; Mojang EULA, private use) and, with --pixel-perfection, the Pixel Perfection Legacy
# 13.21.2 resource pack (CC BY-SA 4.0) for renders to be published; imageio-ffmpeg 0.6.0 for timelapses.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
R="${MC_DIR:-$ROOT/.work/mc}/render"
JARS="$R/jars"
mkdir -p "$JARS/chunky" "$R/chunky/home/plugins" "$R/chunky/home/resources" "$R/bluemap/data"

fetch() {   # fetch URL DEST SHA256
    local url="$1" dest="$2" want="$3"
    if [ -f "$dest" ] && [ "$(sha256sum "$dest" | cut -d' ' -f1)" = "$want" ]; then return; fi
    curl -fsSL "$url" -o "$dest.part"
    local got
    got=$(sha256sum "$dest.part" | cut -d' ' -f1)
    [ "$got" = "$want" ] || { echo "$(basename "$dest") sha256 mismatch: $got != $want" >&2; exit 1; }
    mv "$dest.part" "$dest"
    echo "fetched $(basename "$dest")"
}

fetch https://github.com/BlueMap-Minecraft/BlueMap/releases/download/v5.16/bluemap-5.16-cli.jar \
    "$JARS/bluemap-5.16-cli.jar" 7940d561890373897f8f6be91a52e765461f40e5be4e1c4401004073ee0d2580

# Chunky's own update site serves its libraries by name; these are the ones snapshot 483 lists
CHUNKY_LIB=https://chunkyupdate.lemaik.de/lib
while read -r name sha; do
    fetch "$CHUNKY_LIB/$name" "$JARS/chunky/$name" "$sha"
done <<'EOF'
chunky-core-2.5.0-SNAPSHOT.483.gf10ef3f.jar f1223eecf4ca0e4fde8b5fd409437201918992db3255247bf15dc01f93c509bc
lz4-java-1.8.0.jar d74a3334fb35195009b338a951f918203d6bbca3d1d359033dc33edd1cadc9ef
commons-math3-3.2.jar 6268a9a0ea3e769fc493a21446664c0ef668e48c93d126791f6f3f757978fee2
gson-2.9.0.jar c96d60551331a196dac54b745aa642cd078ef89b6f267146b705f2c2cbef052d
fastutil-8.4.4.jar 3d7981b838c8fe8d8f1ef93c9ee4ebf6bd1091cc1c5847fe41db22d1648081e3
maven-artifact-3.9.9.jar 30f015d1c1a393e19c18cd4f43532089c36d4ca328608ce3dda78b74d3d31515
plexus-utils-3.5.1.jar 86e0255d4c879c61b4833ed7f13124e8bb679df47debb127326e7db7dd49a07b
EOF
fetch https://github.com/chunky-dev/chunky-opencl/releases/download/v0.3.0/chunky-opencl-0.3.0.jar \
    "$R/chunky/home/plugins/chunky-opencl-0.3.0.jar" d03af8ba385ce325f95e05467c251c80e1ed8ab851eebe06a4d46d9c60d6ad02

# the vanilla client jar, sha1 as Mojang's version manifest gives it; Chunky and BlueMap both read it
CLIENT="$JARS/minecraft-client-1.20.4.jar"
if [ ! -f "$CLIENT" ]; then
    curl -fsSL https://piston-data.mojang.com/v1/objects/fd19469fed4a4b4c15b2d5133985f0e3e7816a8a/client.jar -o "$CLIENT.part"
    got=$(sha1sum "$CLIENT.part" | cut -d' ' -f1)
    [ "$got" = fd19469fed4a4b4c15b2d5133985f0e3e7816a8a ] || { echo "client jar sha1 mismatch: $got" >&2; exit 1; }
    mv "$CLIENT.part" "$CLIENT"
    echo "fetched minecraft-client-1.20.4.jar"
fi
ln -sf "$CLIENT" "$R/chunky/home/resources/minecraft.jar"
ln -sf "$CLIENT" "$R/bluemap/data/minecraft-client-1.20.4.jar"

# ffmpeg for the timelapse (a static build inside the wheel), kept with the render tools rather than in site-packages
[ -d "$R/py/imageio_ffmpeg" ] || python3 -m pip install --quiet --target "$R/py" imageio-ffmpeg==0.6.0

if [ "${1:-}" = "--pixel-perfection" ]; then
    fetch "https://cdn.modrinth.com/data/6w3F4SEu/versions/GIKEbHOX/Pixel%20Perfection%20Legacy%2013.21.2.zip" \
        "$JARS/pixel-perfection-legacy-13.21.2.zip" 0fcd07036272b8051b80152f568f22d0b3817769a7b3be51f13c923f47118e71
fi
echo "render tools in $R"
