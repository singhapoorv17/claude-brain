#!/usr/bin/env python3
"""SessionStart hook: inject the Brain (overview + recency layer) into every
Claude Code session, memory-efficiently. Portable — resolves paths from $HOME."""
import os, glob, datetime

BRAIN = os.path.expanduser("~/Documents/Brain")
OVERVIEW = os.path.join(BRAIN, "overview.md")

def main():
    if not os.path.isfile(OVERVIEW):
        return
    print("# 🧠 Your Brain — background work-memory (auto-loaded, compressed)")
    print("Your living memory across all Claude sessions: who you are and what's "
          "active. Treat as background context. Read the linked [[pages]] from the "
          "Brain folder ONLY when the current task needs that depth.\n")
    with open(OVERVIEW) as f:
        print(f.read().strip())
    pages = [p for p in glob.glob(os.path.join(BRAIN, "**", "*.md"), recursive=True)
             if os.path.basename(p) not in ("overview.md", "log.md", "_CLAUDE.md")
             and f"{os.sep}raw{os.sep}" not in p]
    pages.sort(key=os.path.getmtime, reverse=True)
    if pages:
        print("\n## Freshest activity (recent = weight higher)")
        for p in pages[:6]:
            rel = os.path.relpath(p, BRAIN)
            d = datetime.date.fromtimestamp(os.path.getmtime(p)).isoformat()
            print(f"- {rel} (updated {d})")
    print(f"\nFull Brain at {BRAIN} — pull task-specific pages on demand.")

if __name__ == "__main__":
    main()
