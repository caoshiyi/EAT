#!/bin/bash
# Report (never change) whether a run's skill is a valid Agent Skill: Anthropic's skill-creator quick_validate.py for
# the frontmatter rules, plus the spec's "name must match the parent directory", and the SKILL.md body length
# (the guide recommends under 500 lines). Prints one line.
#   bash ops/chess_skill_check.sh [SKILL_DIR]        (default: .claude/skills/chess of this checkout)
cd "$(dirname "$0")/.."
D="${1:-.claude/skills/chess}"
V="${SKILL_VALIDATOR:-$HOME/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator/scripts/quick_validate.py}"
[ -f "$D/SKILL.md" ] || { echo "skill: no $D/SKILL.md yet"; exit 1; }
if [ -f "$V" ]; then v=$(python3 "$V" "$D" 2>&1 | tail -1); else v="validator not found ($V)"; fi
name=$(python3 -c "import re,sys; m=re.match(r'^---\n(.*?)\n---', open(sys.argv[1]).read(), re.S); print(re.search(r'^name:\s*(\S+)', m.group(1), re.M).group(1) if m and re.search(r'^name:', m.group(1), re.M) else '')" "$D/SKILL.md")
match=$([ "$name" = "$(basename "$D")" ] && echo "name matches folder" || echo "NAME '$name' != folder '$(basename "$D")'")
body=$(awk 'f>=2{n++} /^---$/{f++} END{print n+0}' "$D/SKILL.md")
files=$(find "$D" -type f | wc -l)
echo "skill: $v | $match | SKILL.md body $body lines | $files file(s)"
