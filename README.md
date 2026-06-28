# 🧠 Claude Brain

A **self-improving work-memory for Claude Code.** It gives every new session your full background automatically, and it gets smarter on its own — distilling what you actually do into reusable memory while you sleep.

Inspired by Perplexity's "Brain" (a context graph that learns overnight), rebuilt as a local-first system for Claude Code on macOS and Windows.

> The problem it solves: every new Claude Code session starts cold. You re-explain who you are, what you're working on, and how you like to work — over and over. Claude Brain makes that context *persistent* and *auto-loading*, and keeps it current without you maintaining it by hand.

---

## What it does

1. **Auto-loads context into every session.** A `SessionStart` hook injects a compact, recency-weighted memory brief (~2k tokens) at the top of every Claude Code session — who you are, what's active, and how you work. No copy-pasting context ever again.
2. **Learns overnight.** A scheduled job scans your Claude Code session transcripts each night, distills the new work into structured memory pages (projects, lessons, people), and updates the brief. The memory compounds.
3. **Stays small and sharp.** It captures liberally but synthesizes ruthlessly — the always-loaded layer stays tiny; depth lives in linked pages pulled on demand.

## Architecture

```
  Every session                     Every night (scheduled)
 ───────────────                   ─────────────────────────
 SessionStart hook                  scan new transcripts
   loads overview.md     ◀──────┐     │
   + recency layer               │     ▼
        │                        │   headless `claude -p` distills them
        ▼                        │     │  → projects / lessons / people
   Claude session                │     ▼
   starts with full              └── updates overview.md  (ledger tracks
   background                          what's been processed, so nothing repeats)
```

Two layers, like human memory:
- **Wide context** (always loaded): `overview.md` — a structured brief, recency-weighted.
- **Task context** (on demand): `projects/`, `lessons/`, `people/` pages, pulled when a task needs them.

## How it works

| Step | Mechanism |
|---|---|
| **Capture** | Claude Code already writes session transcripts to `~/.claude/projects/`. Nothing to instrument. |
| **Scan** | `scan-sessions` finds transcripts new since the last run (tracked in a `ledger.json`). |
| **Synthesize** | A headless `claude -p` run reads the operating manual (`_CLAUDE.md`) and distills new sessions into memory pages, updating `overview.md`. |
| **Load** | A `SessionStart` hook prints `overview.md` + the freshest pages into each new session's context. |

Headless auth uses a long-lived token from `claude setup-token` (a background job can't refresh the interactive login), so the nightly run never prompts.

## Install

### macOS
```bash
# 1. Put your memory folder at ~/Documents/Brain (start from templates/)
# 2. Install scripts
mkdir -p ~/.claude/brain && cp macos/*.py macos/*.sh ~/.claude/brain/
chmod +x ~/.claude/brain/*.sh ~/.claude/brain/*.py
# 3. Register the SessionStart hook in ~/.claude/settings.json (see templates/)
# 4. Schedule nightly synthesis (launchd)
cp macos/com.brain.synthesize.plist ~/Library/LaunchAgents/   # edit paths first
launchctl load ~/Library/LaunchAgents/com.brain.synthesize.plist
# 5. Auth for the background job
claude setup-token   # save the token to ~/.claude/brain/oauth-token (chmod 600)
```

### Windows
Scripts are Node.js (ships with Claude Code — no Python needed). Install to `%USERPROFILE%\.claude\brain\`, register the `SessionStart` hook to run `node load_brain_context.js`, and schedule nightly synthesis with Task Scheduler:
```cmd
schtasks /Create /TN "BrainSynthesize" /SC DAILY /ST 03:00 /F /TR "node \"%USERPROFILE%\.claude\brain\synthesize.js\""
```
See [`windows/`](windows/) and [`templates/`](templates/).

## The memory format

Every page is written **for a future AI to read** — a "for future Claude" preamble, machine-readable frontmatter, confidence levels, recency markers, and `[[wikilinks]]`. The always-loaded `overview.md` has three parts: **Fixed context** (who you are), **Recent & active work** (recency-weighted, with real detail), and **How to work with you**. See [`templates/`](templates/) for the operating manual and examples.

## Repo guide

| Path | What it is |
|---|---|
| `macos/` | Python + bash scripts and the launchd job for macOS |
| `windows/` | Node.js scripts for Windows + Task Scheduler |
| `templates/_CLAUDE.md` | The operating manual the synthesis agent follows |
| `templates/overview.example.md` | Example of the always-loaded brief |
| `templates/lessons/` | Example "lesson" (performance memory) page |

## Design notes

- **Performance memory is the point.** The highest-value pages aren't "who I am" — they're *lessons*: what strategy worked, what needed correction. That's what makes the next session better, not just better-informed.
- **The ledger never false-commits.** If a nightly run fails (API overload, expired token), it does *not* mark sessions as processed — so nothing is silently lost; it retries next run.
- **Don't sync secrets or personal memory.** Keep your real memory pages and `oauth-token` local (see `.gitignore`). This repo is the *engine*, not anyone's data.

## License

MIT — see [LICENSE](LICENSE).
