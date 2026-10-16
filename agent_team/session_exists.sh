#!/bin/bash
# Exit 0 if session ID already has a conversation for the agent CLI in use (EAT_AGENT_CLI: claude, or codex_cli.py).
# Usage: session_exists.sh ID
ID="${1:?session id}"
case "${EAT_AGENT_CLI:-claude}" in
    *codex_cli.py) [ -s "${CODEX_SESSION_MAP:-$HOME/.codex/eat_sessions}/$ID" ] ;;
    *) compgen -G "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/projects/*/$ID.jsonl" > /dev/null ;;
esac
