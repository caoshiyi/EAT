#!/bin/bash
# Write this checkout's chess run configuration (.work/chess_run.json) for a named ladder, once; refuse to change it
# after the run has started. Both arms of a comparison use the same name, so they face the same opponents in the same order.
#   opus:  1500 1600 ... 2400   haiku: 1320 1400 1500 ... 2200   low: 1320 1400 1475 ... 2000 (steps of 75)
#   (10 levels; a rotation is 20 games; seed 1)
#   adaptive30: 1320 1400 1500 ... 3100 3190, no fixed order -- each rated game's opponent is drawn near the agents'
#   current rating (tools/chess_arena.py, "pairing": "adaptive") --, a 30-minute game clock ("clock_s": 1800), and the
#   opponent's level shown to the agents ("show_levels"; the other ladders keep their levels hidden), and no practice
#   games ("practice": false)
cd "$(dirname "$0")/.."
case "${1:-}" in
    opus)  L="[1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400]" ;;
    haiku) L="[1320, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200]" ;;
    low)   L="[1320, 1400, 1475, 1550, 1625, 1700, 1775, 1850, 1925, 2000]" ;;
    adaptive30) L="[1320, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3190]"
                X=', "pairing": "adaptive", "clock_s": 1800, "show_levels": true, "practice": false' ;;
    *) echo "ladder must be opus, haiku, low or adaptive30" >&2; exit 1 ;;
esac
WANT="{\"ladder\": $L, \"seed\": 1${X:-}}"
mkdir -p .work
if [ -f .work/chess_run.json ]; then
    [ "$(cat .work/chess_run.json)" = "$WANT" ] && exit 0
    # a configuration that adds later "phases" to this same base ladder and seed is this run, continued
    python3 -c "import json,sys; r=json.load(open('.work/chess_run.json')); w=json.loads(sys.argv[1]); sys.exit(0 if (r['ladder'],r['seed'])==(w['ladder'],w['seed']) and 'phases' in r else 1)" "$WANT" && exit 0
    echo "this checkout already has a different run configuration (.work/chess_run.json); not changed" >&2; exit 1
fi
echo "$WANT" > .work/chess_run.json
