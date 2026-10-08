#!/bin/bash
# Recreate the reference clones listed in refs.txt (name, url, commit) under $EAT_REFS.
set -euo pipefail
source "$(dirname "$0")/../../ops/env.sh"
mkdir -p "$EAT_REFS"
while read -r name url commit; do
    d=$EAT_REFS/$name
    [ -d "$d/.git" ] || git init -q "$d"
    git -C "$d" fetch -q --depth 1 "$url" "$commit" && git -C "$d" checkout -q FETCH_HEAD
    echo "$name $(git -C "$d" rev-parse --short=12 HEAD)"
done < "$(dirname "$0")/refs.txt"
