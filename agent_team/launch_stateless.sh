#!/bin/bash
# Supervisor-driven agent team experiment
# Prompts are passed to `claude --print` on stdin (argv fails on prompts starting with
# '-' and on prompts over 128KB).
# Supports two supervisor modes:
#   stateless  — each supervisor turn is a fresh Claude session (sees ONLY the last team's output)
#   persistent — one continuous Claude session across all iterations (full conversation history)
#
# Usage, from inside the task's git repository:
#   bash <EAT>/agent_team/launch_stateless.sh [--persistent|--stateless] [max_iterations] [max_team_size] [budget] [start_iter]
#   --persistent: supervisor keeps conversation history across iterations
#   --stateless:  supervisor gets a fresh session each iteration (default)
#   The task repository provides eat/task.md (the rules put into every agent's prompt), eat/eval.sh (the official eval,
#   ending with a line "SCORE: <x>") and optionally eat/env.sh (sourced first: venv, paths, GPUs, TEAM_WALL_MIN),
#   eat/pre_team.sh (run before each team), eat/snapshot.sh (after it) and eat/done.sh (exit 0 ends the run). The run's record
#   (team configs, agent outputs, evals, BUDGET.md) goes to eat/log/.
#   max_iterations: max supervisor turns (default: 20)
#   max_team_size: max agents per iteration (default: 3)
#   budget: total budget in dollars (default: 800)
#   start_iter: first iteration number when resuming a run (default: 1)
# Environment: EVAL_CMD (official eval run after each team, see launch_team.sh), RESUME_SESSION_ID (persistent mode:
#   continue an earlier supervisor session), CLAUDE_EXTRA_DISALLOWED (extra tools denied to every agent, e.g.
#   "WebSearch,WebFetch" for clean-room runs), SUPERVISOR_REFRESH_COST (persistent mode: hand over to a new
#   supervisor session after a supervisor turn that cost more than this many dollars; default off), EAT_PAUSE_FILE (wait before each iteration while this file exists),
#   SUPERVISOR_MODEL (model of the supervisor session), AGENT_MODELS (comma-separated models a role may pick with
#   **Model:**; roles without one use the default model)

set -euo pipefail

unset ANTHROPIC_API_KEY

# Parse mode flag
SUPERVISOR_MODE="stateless"
if [[ "${1:-}" == "--persistent" ]]; then
    SUPERVISOR_MODE="persistent"
    shift
elif [[ "${1:-}" == "--stateless" ]]; then
    shift
fi

MAX_ITERS="${1:-20}"
MAX_TEAM_SIZE="${2:-3}"
BUDGET="${3:-800}"
START_ITER="${4:-1}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "run this from inside the task's git repository" >&2; exit 1; }
REQUIREMENTS="$PROJECT_DIR/eat/task.md"
[ -f "$REQUIREMENTS" ] || { echo "$REQUIREMENTS not found: set the task up first (the eat skill, or ops/fetch_task.sh)" >&2; exit 1; }
[ -f "$PROJECT_DIR/eat/env.sh" ] && source "$PROJECT_DIR/eat/env.sh"
export EAT_HOME="$(cd "$SCRIPT_DIR/.." && pwd)" EAT_ROOT="$PROJECT_DIR"
# macOS has no GNU timeout: use the harness's shim
command -v timeout >/dev/null || export PATH="$EAT_HOME/ops/macbin:$PATH"
export TASK="${EAT_TASK:-$(basename "$PROJECT_DIR")}"
export EAT_RUN="$PROJECT_DIR/eat/log"
mkdir -p "$EAT_RUN"
TEAM_OUTPUT="$EAT_RUN/TEAM_OUTPUT.md"
TEAM_CONFIG="$EAT_RUN/TEAM_CONFIG.md"
BUDGET_LOG="$EAT_RUN/BUDGET.md"
CUMULATIVE_COST=0
MODEL_FIELD=""
[ -n "${AGENT_MODELS:-}" ] && MODEL_FIELD="**Model:** <one of: ${AGENT_MODELS//,/, }; omit the line for the default, ${ANTHROPIC_MODEL:-the CLI default}>"

# For persistent mode, generate a valid UUID session ID
# RESUME_SESSION_ID continues an earlier persistent supervisor session when restarting with START_ITER
SESSION_ID="${RESUME_SESSION_ID:-$(python3 -c "import uuid; print(uuid.uuid4())")}"

cd "$PROJECT_DIR"

# A resumed Claude session reports its total cost so far: book only the increase since that session was last booked
SUP_BOOKED="$EAT_RUN/.supervisor_booked_cost.json"
session_delta() {
    python3 - "$SUP_BOOKED" "$1" "$2" <<'PY'
import json, sys
path, sid, total = sys.argv[1], sys.argv[2], float(sys.argv[3] or 0)
try:
    booked = json.load(open(path))
except Exception:
    booked = {}
prev = booked.get(sid, 0.0)
booked[sid] = max(prev, total)
json.dump(booked, open(path, "w"))
print(round(max(total - prev, 0.0), 6))
PY
}


add_cost() {
    local iter="$1" role="$2" cost="$3" score="${4:-}"
    CUMULATIVE_COST=$(python3 -c "print(round($CUMULATIVE_COST + $cost, 4))")
    echo "| $iter | $role | $cost | $CUMULATIVE_COST | $score |" >> "$BUDGET_LOG"
    echo "[budget] +\$$cost ($role) — cumulative: \$$CUMULATIVE_COST / \$$BUDGET"
}

extract_score() {
    local iter_dir="$1"
    python3 -c "
import re, os
official = '$iter_dir/official_eval.txt'
m = re.findall(r'^SCORE:\s*([-\d.]+)', open(official).read(), re.M) if os.path.exists(official) else []
print(m[-1] if m else 'N/A')
"
}

check_budget() {
    if (( $(python3 -c "print(1 if $CUMULATIVE_COST >= $BUDGET else 0)") )); then
        echo "[budget] \$$BUDGET budget exhausted. Stopping."
        return 1
    fi
    return 0
}

extract_cost() {
    local json_file="$1"
    python3 -c "
import json, sys
try:
    with open('$json_file') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                d = json.loads(line)
                print(d.get('total_cost_usd', 0))
                sys.exit(0)
            except: continue
    print(0)
except:
    print(0)
"
}

# Build the supervisor system prompt (used once in persistent mode, every time in stateless)
build_supervisor_system_prompt() {
    cat <<SYSTEM_PROMPT
You are the supervisor of an agent team that optimizes a task (its rules are below).
Task: $TASK (repository: $PROJECT_DIR)

CRITICAL: Your final output MUST end with the ---BEGIN TEAM_CONFIG--- / ---END TEAM_CONFIG--- block in the exact template format shown below. You may read files and run eval commands to inform your decisions, but you MUST NOT spawn agents or modify the task's files — your ONLY deliverable is the team configuration block. Do NOT skip the template.

## Your instructions
$(cat "$SCRIPT_DIR/SUPERVISOR.md")

$(cat "$REQUIREMENTS")

The official eval, run by the harness after every team: `bash eat/eval.sh` (its last line is the score).

## Constraints
- **Maximum team size: $MAX_TEAM_SIZE agents.** Do not define more than $MAX_TEAM_SIZE roles. If you need more specialization, combine responsibilities into fewer roles.
SYSTEM_PROMPT
}

# Handover note for a new supervisor session that takes over a run in progress
build_handover_note() {
    local iter="$1"
    [ "$iter" -le 1 ] && return 0
    cat <<HANDOVER

## Handover
You are a new supervisor taking over this run at iteration $iter; earlier supervisor sessions ran iterations 1-$((iter - 1)).
Before you write the team configuration:
1. Read the record: at least the last three iterations' eat/log/iter_*/team_config.md and official_eval.txt,
   eat/log/BUDGET.md, the task's results log, and the agents' notes they point to.
2. Begin the configuration with a "## Reflection" section that assesses the team design itself (roles, team size,
   phases, how the agents share the eval resources) against the score trajectory, and states what you
   keep or change and why. You are not bound by the previous supervisors' team design.
HANDOVER
}

# Build the per-iteration prompt
build_iter_prompt() {
    local iter="$1"
    cat <<ITER_PROMPT
## Iteration $iter

## Budget
Total budget: \$$BUDGET. Spent so far: \$$CUMULATIVE_COST. Remaining: \$$(python3 -c "print(round($BUDGET - $CUMULATIVE_COST, 2))").
Design the team size and agent timeouts accordingly — do not overspend.

## Last team's output
$(cat "$TEAM_OUTPUT")

## Your job now
1. REFLECT on the last team's output above. What worked? What didn't? Where is the team stuck?
2. EVOLVE the team. Decide on roles, prompts, and workflow for the NEXT team.
3. Ensure the Hard Requirements above are included verbatim in every agent's prompt.
4. Use **## Workflow** to define execution phases. Agents in the same phase run in parallel; phases run sequentially.

Write the new team configuration to stdout in EXACTLY this format:

---BEGIN TEAM_CONFIG---
# Team Configuration — Iteration $iter
## Task
$TASK

## Roles
For each role, specify:
### Role: <role_name>
**Prompt:**
<the full prompt this agent will receive, including task context, what files to read, what to do, eval commands to run>
**Working Directory:** $PROJECT_DIR
**Timeout:** <minutes, e.g. 60>
$MODEL_FIELD

## Workflow
Agents launch in phases. Agents within the same phase run in parallel. Phases run sequentially.
- Phase 1: <role_a>, <role_b>
- Phase 2: <role_c>
(Add more phases as needed. Use agent role names exactly as defined above.)

## Success Criteria
<what score or outcome should the team achieve this iteration>
---END TEAM_CONFIG---
ITER_PROMPT
}

# Run supervisor and write output to $EAT_RUN/.supervisor_output.json
run_supervisor() {
    local iter="$1"

    if [ "$SUPERVISOR_MODE" = "persistent" ]; then
        local fresh=0
        if [ "$iter" -eq "$START_ITER" ] && [ -z "${RESUME_SESSION_ID:-}" ]; then fresh=1; fi
        if [ "$REFRESH_NEXT" -eq 1 ]; then
            SESSION_ID="$(python3 -c "import uuid; print(uuid.uuid4())")"
            fresh=1
            REFRESH_NEXT=0
        fi
        if [ "$fresh" -eq 1 ]; then
            # New session: system prompt (+ handover note after iteration 1) + iter prompt
            echo "[supervisor] Starting persistent session ($SESSION_ID)..."
            local full_prompt
            full_prompt="$(build_supervisor_system_prompt)
$(build_handover_note "$iter")

$(build_iter_prompt "$iter")"
            claude --print ${SUPERVISOR_MODEL:+--model "$SUPERVISOR_MODEL"} --dangerously-skip-permissions --output-format json --disallowedTools "Agent,Write,Edit,NotebookEdit${CLAUDE_EXTRA_DISALLOWED:+,$CLAUDE_EXTRA_DISALLOWED}" \
                --session-id "$SESSION_ID" \
                < <(printf '%s\n' "$full_prompt") > $EAT_RUN/.supervisor_output.json 2>>"$EAT_RUN/supervisor_stderr.log"
        else
            # Subsequent iterations: resume same session with just the iter prompt
            echo "[supervisor] Resuming persistent session ($SESSION_ID)..."
            claude --print ${SUPERVISOR_MODEL:+--model "$SUPERVISOR_MODEL"} --dangerously-skip-permissions --output-format json --disallowedTools "Agent,Write,Edit,NotebookEdit${CLAUDE_EXTRA_DISALLOWED:+,$CLAUDE_EXTRA_DISALLOWED}" \
                --resume "$SESSION_ID" \
                < <(build_iter_prompt "$iter") > $EAT_RUN/.supervisor_output.json 2>>"$EAT_RUN/supervisor_stderr.log"
        fi
    else
        # Stateless: fresh session each time with everything
        echo "[supervisor] Starting fresh session..."
        local full_prompt
        full_prompt="$(build_supervisor_system_prompt)

$(build_iter_prompt "$iter")"
        claude --print ${SUPERVISOR_MODEL:+--model "$SUPERVISOR_MODEL"} --dangerously-skip-permissions --output-format json --disallowedTools "Agent,Write,Edit,NotebookEdit${CLAUDE_EXTRA_DISALLOWED:+,$CLAUDE_EXTRA_DISALLOWED}" \
            < <(printf '%s\n' "$full_prompt") > $EAT_RUN/.supervisor_output.json 2>>"$EAT_RUN/supervisor_stderr.log"
    fi
}

# Initialize budget tracking
if [ ! -f "$BUDGET_LOG" ]; then
    cat > "$BUDGET_LOG" <<EOF
# Budget Tracker (\$$BUDGET total)
| Iteration | Role | Cost (\$) | Cumulative (\$) | Score |
|-----------|------|----------|----------------|-------|
EOF
else
    # Recover cumulative cost from existing log (cumulative is 4th column)
    LAST_COST=$(python3 -c "
import sys
with open('$BUDGET_LOG') as f:
    lines = f.readlines()
for line in reversed(lines):
    parts = [p.strip() for p in line.split('|')]
    if len(parts) >= 5:
        try:
            print(float(parts[4]))
            sys.exit(0)
        except (ValueError, IndexError): continue
print(0)
")
    if [ -n "$LAST_COST" ] && [ "$LAST_COST" != "0" ]; then
        CUMULATIVE_COST="$LAST_COST"
        echo "[budget] Resuming with cumulative cost: \$$CUMULATIVE_COST"
    fi
fi

# Initialize TEAM_OUTPUT.md for first iteration (no prior team)
if [ ! -f "$TEAM_OUTPUT" ]; then
    cat > "$TEAM_OUTPUT" << EOF
# Team Output — Iteration 0 (Bootstrap)
Task: $TASK
No prior team has run yet. This is the first iteration.
Current best score: N/A (no attempts yet)
Current solution: the start state of the repository (see eat/task.md)

## Directive
Start with a solo optimizer.
EOF
fi

echo "Supervisor mode: $SUPERVISOR_MODE"
echo ""

# Persistent mode: after an iteration whose supervisor turn (with its retries) cost more than SUPERVISOR_REFRESH_COST
# dollars, the next iteration starts a new supervisor session with a handover note; unset or 0 disables
SUPERVISOR_REFRESH_COST="${SUPERVISOR_REFRESH_COST:-0}"
REFRESH_NEXT=0

for ITER in $(seq "$START_ITER" "$MAX_ITERS"); do
    echo ""
    echo "============================================"
    echo "  SUPERVISOR ITERATION $ITER / $MAX_ITERS"
    echo "  Task: $TASK  |  Mode: $SUPERVISOR_MODE  |  Budget: \$$CUMULATIVE_COST / \$$BUDGET"
    echo "  $(date)"
    echo "============================================"
    echo ""

    # Operator pause (e.g. for a held-out eval): wait between iterations while the pause file exists
    if [ -n "${EAT_PAUSE_FILE:-}" ] && [ -f "$EAT_PAUSE_FILE" ]; then
        echo "[launch] paused before iteration $ITER ($EAT_PAUSE_FILE exists)"
        while [ -f "$EAT_PAUSE_FILE" ]; do sleep 60; done
        echo "[launch] resumed at iteration $ITER"
    fi

    # ---- SUPERVISOR TURN ----
    run_supervisor "$ITER"

    # Track supervisor cost
    SUP_COST=$(extract_cost $EAT_RUN/.supervisor_output.json | tr -d '[:space:]')
    [ "$SUPERVISOR_MODE" = "persistent" ] && SUP_COST=$(session_delta "$SESSION_ID" "$SUP_COST")
    add_cost "$ITER" "supervisor" "$SUP_COST"
    TURN_COST="$SUP_COST"
    check_budget || break

    # Extract the text from JSON output (take first valid JSON line), fall back to raw
    python3 "$SCRIPT_DIR/extract_result.py" $EAT_RUN/.supervisor_output.json > $EAT_RUN/.supervisor_raw.txt 2>/dev/null || cp $EAT_RUN/.supervisor_output.json $EAT_RUN/.supervisor_raw.txt

    # Extract TEAM_CONFIG block
    if grep -q "BEGIN TEAM_CONFIG" $EAT_RUN/.supervisor_raw.txt; then
        sed -n '/---BEGIN TEAM_CONFIG---/,/---END TEAM_CONFIG---/p' $EAT_RUN/.supervisor_raw.txt > "$TEAM_CONFIG"
    else
        cp $EAT_RUN/.supervisor_raw.txt "$TEAM_CONFIG"
    fi

    # Retry up to 5 times if no roles found (supervisor didn't follow template)
    for RETRY in $(seq 1 5); do
        if grep -q "^### Role:" "$TEAM_CONFIG"; then
            break
        fi
        echo "[supervisor] WARNING: No roles found in config. Retry $RETRY/5..."

        RETRY_PROMPT="$(cat <<RETRY_PROMPT
You previously produced a team configuration but it did NOT follow the required format.
The output MUST contain lines starting with exactly '### Role: <name>' for each agent role.

Here is the format you MUST follow. Output ONLY this block, nothing else before or after:

---BEGIN TEAM_CONFIG---
# Team Configuration — Iteration $ITER
## Task
$TASK

## Roles

### Role: <role_name>
**Prompt:**
<full prompt for this agent>
**Working Directory:** $PROJECT_DIR
**Timeout:** <minutes>
$MODEL_FIELD

(repeat ### Role: for each additional agent, max $MAX_TEAM_SIZE)

## Workflow
Agents launch in phases. Phases run sequentially, agents within a phase run in parallel.
- Phase 1: <role_a>, <role_b>
- Phase 2: <role_c>

## Success Criteria
<target>
---END TEAM_CONFIG---

Here is what you wrote last time (reformat it into the template above):
$(cat "$TEAM_CONFIG")
RETRY_PROMPT
        )"

        if [ "$SUPERVISOR_MODE" = "persistent" ]; then
            claude --print ${SUPERVISOR_MODEL:+--model "$SUPERVISOR_MODEL"} --dangerously-skip-permissions --output-format json --disallowedTools "Agent,Write,Edit,NotebookEdit${CLAUDE_EXTRA_DISALLOWED:+,$CLAUDE_EXTRA_DISALLOWED}" \
                --resume "$SESSION_ID" \
                < <(printf '%s\n' "$RETRY_PROMPT") > $EAT_RUN/.supervisor_retry.json 2>>"$EAT_RUN/supervisor_stderr.log"
        else
            claude --print ${SUPERVISOR_MODEL:+--model "$SUPERVISOR_MODEL"} --dangerously-skip-permissions --output-format json --disallowedTools "Agent,Write,Edit,NotebookEdit${CLAUDE_EXTRA_DISALLOWED:+,$CLAUDE_EXTRA_DISALLOWED}" \
                < <(printf '%s\n' "$RETRY_PROMPT") > $EAT_RUN/.supervisor_retry.json 2>>"$EAT_RUN/supervisor_stderr.log"
        fi

        RETRY_COST=$(extract_cost $EAT_RUN/.supervisor_retry.json | tr -d '[:space:]')
        [ "$SUPERVISOR_MODE" = "persistent" ] && RETRY_COST=$(session_delta "$SESSION_ID" "$RETRY_COST")
        add_cost "$ITER" "supervisor-retry-$RETRY" "$RETRY_COST"
        TURN_COST=$(python3 -c "print(${TURN_COST:-0} + ${RETRY_COST:-0})")
        check_budget || break 2

        python3 "$SCRIPT_DIR/extract_result.py" $EAT_RUN/.supervisor_retry.json > $EAT_RUN/.supervisor_retry_raw.txt 2>/dev/null
        if grep -q "BEGIN TEAM_CONFIG" $EAT_RUN/.supervisor_retry_raw.txt; then
            sed -n '/---BEGIN TEAM_CONFIG---/,/---END TEAM_CONFIG---/p' $EAT_RUN/.supervisor_retry_raw.txt > "$TEAM_CONFIG"
        else
            cp $EAT_RUN/.supervisor_retry_raw.txt "$TEAM_CONFIG"
        fi
        echo "[supervisor] Retry $RETRY config written to $TEAM_CONFIG"
    done

    echo "[supervisor] Team config written to $TEAM_CONFIG"
    echo ""

    # ---- LAUNCH TEAM ----
    echo "[team] Launching team for iteration $ITER..."
    TEAM_COST=$(bash "$SCRIPT_DIR/launch_team.sh" "$ITER" "$TEAM_CONFIG" "$TEAM_OUTPUT" "$MAX_TEAM_SIZE" | tr -d '[:space:]')

    # Extract score from agent JSON outputs
    CURRENT_SCORE=$(extract_score "$EAT_RUN/iter_${ITER}")
    echo "[score] Iteration $ITER score: $CURRENT_SCORE"

    add_cost "$ITER" "team" "$TEAM_COST" "$CURRENT_SCORE"
    check_budget || break

    # Commit all changes from this iteration
    echo "[git] Committing iteration $ITER results..."
    git add -A || echo "[git] add failed; continuing"
    git commit -m "iter $ITER: task=$TASK cost=\$$TEAM_COST cumulative=\$$CUMULATIVE_COST score=$CURRENT_SCORE" --allow-empty 2>/dev/null || true

    # A task with an end (the game is won, all games are played) says so through eat/done.sh exiting 0
    if [ -f eat/done.sh ] && bash eat/done.sh >/dev/null 2>&1; then
        echo "[loop] eat/done.sh reports the task is finished. Stopping."
        break
    fi

    if [ "$SUPERVISOR_MODE" = "persistent" ] \
            && python3 -c "import sys; sys.exit(0 if 0 < $SUPERVISOR_REFRESH_COST < ${TURN_COST:-0} else 1)"; then
        echo "[supervisor] Turn cost \$$TURN_COST > \$$SUPERVISOR_REFRESH_COST: new supervisor session from iteration $((ITER + 1))"
        REFRESH_NEXT=1
    fi

    echo "[team] Iteration $ITER complete. Results in $TEAM_OUTPUT"
    echo ""
    echo "[loop] Moving to next supervisor iteration..."
done

echo ""
echo "============================================"
echo "  SUPERVISOR EXPERIMENT COMPLETE"
echo "  Mode: $SUPERVISOR_MODE"
echo "  Total iterations: $ITER"
echo "  Total cost: \$$CUMULATIVE_COST"
echo "============================================"
