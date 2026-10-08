#!/bin/bash
# Launch a team of Claude agents based on TEAM_CONFIG.md
# Called by launch_stateless.sh — not meant to be run directly.
#
# Usage: bash launch_team.sh <task> <iteration> <team_config_path> <team_output_path> [max_team_size]
# Stdout: total team cost (float) — captured by launch_stateless.sh
# All logging goes to stderr so stdout is clean for the cost value.

set -euo pipefail

unset ANTHROPIC_API_KEY

TASK="$1"
ITER="$2"
TEAM_CONFIG="$3"
TEAM_OUTPUT="$4"
MAX_TEAM_SIZE="${5:-3}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

# Create a workspace for this iteration's outputs
ITER_DIR="$PROJECT_DIR/agent_team/iter_${ITER}"
mkdir -p "$ITER_DIR"
cp "$TEAM_CONFIG" "$ITER_DIR/team_config.md"

# Parse roles, prompts, timeouts and phases structurally (prompts may contain their own
# "## Workflow" / "## Success Criteria" / "Phase N:" text)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
mapfile -t PHASE_LINES < <(python3 "$SCRIPT_DIR/parse_team_config.py" "$TEAM_CONFIG" "$ITER_DIR" "$TASK" "$MAX_TEAM_SIZE")
ROLES=()
for PHASE_ROLES_CSV in "${PHASE_LINES[@]}"; do
    IFS=',' read -ra PHASE_ROLES <<< "$PHASE_ROLES_CSV"
    ROLES+=("${PHASE_ROLES[@]}")
done

echo "[launch_team] Iteration $ITER — launching ${#ROLES[@]} agent(s): ${ROLES[*]}" >&2

# Set AGENT_TIMEOUT_ENFORCE=1 to kill an agent after the Timeout its role declares
launch_agent() {
    local ROLE="$1"
    local PROMPT_FILE="$ITER_DIR/${ROLE}_prompt.txt"
    local AGENT_OUTPUT="$ITER_DIR/${ROLE}_output.json"
    local LIMIT=()
    if [ "${AGENT_TIMEOUT_ENFORCE:-0}" = "1" ] && [ -f "$ITER_DIR/${ROLE}_timeout" ]; then
        LIMIT=(timeout --signal=TERM --kill-after=60 "$(< "$ITER_DIR/${ROLE}_timeout")m")
    fi

    echo "[launch_team] Starting agent: $ROLE" >&2
    # Prompt goes through stdin: argv breaks on prompts starting with '-' and on >128KB prompts
    "${LIMIT[@]}" claude --print --dangerously-skip-permissions --output-format json ${CLAUDE_EXTRA_DISALLOWED:+--disallowedTools "$CLAUDE_EXTRA_DISALLOWED"} \
        < "$PROMPT_FILE" > "$AGENT_OUTPUT" 2> "$ITER_DIR/${ROLE}_stderr.txt"
    echo "[launch_team] Agent '$ROLE' finished (exit $?)." >&2
}

# Launch agents in phases (disable set -e to prevent agent failures from killing the loop)
set +e
PHASE_NUM=0
for PHASE_ROLES_CSV in "${PHASE_LINES[@]}"; do
    [ -z "$PHASE_ROLES_CSV" ] && continue
    PHASE_NUM=$((PHASE_NUM + 1))
    IFS=',' read -ra PHASE_ROLES <<< "$PHASE_ROLES_CSV"
    echo "[launch_team] === Phase $PHASE_NUM: ${PHASE_ROLES[*]} ===" >&2

    PIDS=()
    for ROLE in "${PHASE_ROLES[@]}"; do
        launch_agent "$ROLE" &
        PIDS+=($!)
    done

    echo "[launch_team] Waiting for phase $PHASE_NUM (${#PIDS[@]} agent(s))..." >&2
    for PID in "${PIDS[@]}"; do
        wait "$PID" || echo "[launch_team] Agent PID $PID exited with code $?" >&2
    done
    echo "[launch_team] Phase $PHASE_NUM complete." >&2
done
set -e

echo "[launch_team] All phases finished." >&2

# Official score of the kernel the team left in place, independent of agents' self-reports.
# Override EVAL_CMD to pick a GPU or activate an environment, e.g.
#   EVAL_CMD='source $EAT_VENV/bin/activate && HIP_VISIBLE_DEVICES=$(ops/pick_eval_gpu.sh) python tools/eval_amd_kda_mi350x.py'
EVAL_CMD="${EVAL_CMD:-python tools/eval_${TASK}.py}"
echo "[launch_team] Official eval: $EVAL_CMD" >&2
bash -c "$EVAL_CMD" > "$ITER_DIR/official_eval.txt" 2>&1 || true

# Sum up costs from all agents
TEAM_TOTAL_COST=$(python3 -c "
import json, glob

total = 0.0
for f in glob.glob('$ITER_DIR/*_output.json'):
    try:
        with open(f) as fh:
            d = json.load(fh)
        total += d.get('total_cost_usd', 0)
    except:
        pass
print(round(total, 4))
")

echo "[launch_team] Team cost for iteration $ITER: \$$TEAM_TOTAL_COST" >&2

# Collect results into TEAM_OUTPUT.md
{
    echo "# Team Output — Iteration $ITER"
    echo "Task: $TASK"
    echo "Date: $(date -Iseconds)"
    echo "Agents: ${ROLES[*]}"
    echo "Team cost: \$$TEAM_TOTAL_COST"
    echo ""

    echo "## Current Score (official eval run by the harness after the team finished)"
    tail -25 "$ITER_DIR/official_eval.txt"
    echo ""

    if [ -f "$SCRIPT_DIR/OPERATOR_NOTES.md" ]; then
        cat "$SCRIPT_DIR/OPERATOR_NOTES.md"
        echo ""
    fi

    echo "## Git Log (this iteration)"
    git log --oneline -10 2>/dev/null || echo "(no commits)"
    echo ""

    for ROLE in "${ROLES[@]}"; do
        AGENT_JSON="$ITER_DIR/${ROLE}_output.json"
        echo "## Agent: $ROLE"
        if [ -f "$AGENT_JSON" ]; then
            python3 -c "
import json
with open('$AGENT_JSON') as f:
    d = json.load(f)
cost = d.get('total_cost_usd', 0)
text = d.get('result', '')
print(f'Cost: \${cost}')
print(f'Duration: {d.get(\"duration_ms\", 0) / 1000:.0f}s')
print()
lines = text.split('\n')
for line in lines[-80:]:
    print(line)
" 2>/dev/null || echo "(parse error)"
        else
            echo "(no output)"
        fi
        echo ""
    done

    echo "## Current kernel.cu (first 50 lines)"
    head -50 "tasks/$TASK/kernel.cu" 2>/dev/null || echo "(not found)"
    echo ""

    if [ -f "tasks/$TASK/results.tsv" ]; then
        echo "## Results History"
        cat "tasks/$TASK/results.tsv"
        echo ""
    fi

} > "$TEAM_OUTPUT"

echo "[launch_team] Team output written to $TEAM_OUTPUT" >&2

echo "$TEAM_TOTAL_COST"
