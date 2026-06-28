#!/bin/bash
# Brain nightly synthesis runner (portable). Scans for new Claude Code sessions and,
# if there's fresh work, runs a headless Claude pass that distills it into the Brain
# per the Brain's _CLAUDE.md. Idempotent via the ledger. Run by launchd nightly, or
# by hand: bash ~/.claude/brain/synthesize.sh
set -euo pipefail

CLAUDE="$(command -v claude || echo "$HOME/.local/bin/claude")"
BRAIN="$HOME/Documents/Brain"
SCAN="$HOME/.claude/brain/scan-sessions.py"
PENDING_FILE="$HOME/.claude/brain/pending.txt"
LOG="$HOME/.claude/brain/synthesize.log"
TOKEN_FILE="$HOME/.claude/brain/oauth-token"
MODEL="sonnet"

ts() { date "+%Y-%m-%d %H:%M:%S"; }
echo "[$(ts)] --- synthesis run start ---" >> "$LOG"

# Headless auth: a background job can't refresh the subscription OAuth token from the
# login keychain, so use a long-lived token from `claude setup-token`.
if [ -f "$TOKEN_FILE" ]; then
  export CLAUDE_CODE_OAUTH_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
else
  echo "[$(ts)] WARNING: no $TOKEN_FILE — headless auth will likely 401. Run: claude setup-token" >> "$LOG"
fi

PENDING="$(/usr/bin/python3 "$SCAN" paths || true)"
if [ -z "$PENDING" ]; then
  echo "[$(ts)] nothing new; exiting" >> "$LOG"; exit 0
fi
echo "$PENDING" > "$PENDING_FILE"
echo "[$(ts)] $(echo "$PENDING" | wc -l | tr -d ' ') pending session(s)" >> "$LOG"

PROMPT="You are the autonomous Brain synthesis agent. Read the operating manual at \"$BRAIN/_CLAUDE.md\" and follow its synthesis loop exactly. The list of unprocessed Claude Code transcript paths to distill this run is in $PENDING_FILE (read it). Distill ruthlessly into self/ projects/ lessons/ people/ tools/, maintain overview.md per its rules, and append a one-line entry to \"$BRAIN/log.md\". Run silently and make the edits directly."

cd "$BRAIN"
ATTEMPTS=4; DELAY=30; ok=0
for i in $(seq 1 $ATTEMPTS); do
  echo "[$(ts)] attempt $i/$ATTEMPTS" >> "$LOG"
  if "$CLAUDE" -p "$PROMPT" --model "$MODEL" --dangerously-skip-permissions >> "$LOG" 2>&1; then
    ok=1; break
  fi
  echo "[$(ts)] attempt $i failed; backing off ${DELAY}s" >> "$LOG"
  sleep "$DELAY"; DELAY=$((DELAY*2))
done

if [ "$ok" = "1" ]; then
  /usr/bin/python3 "$SCAN" commit "$PENDING_FILE" >> "$LOG" 2>&1
  echo "[$(ts)] --- synthesis run done ---" >> "$LOG"
else
  echo "[$(ts)] !! all $ATTEMPTS attempts failed; NOT committing ledger (will retry next run)" >> "$LOG"
  exit 1
fi
