#!/usr/bin/env python3
"""Brain session scanner (portable). Finds Claude Code transcripts new/modified
since the last synthesis run. State in ledger.json keyed by path -> mtime.

Usage: list | paths | baseline | commit FILE"""
import json, glob, os, sys

PROJECTS = os.path.expanduser("~/.claude/projects")
LEDGER = os.path.expanduser("~/.claude/brain/ledger.json")
# Exclude the Brain's own project dir — synthesis runs cd into it and write their
# own transcripts there; ingesting those would create a self-referential loop.
EXCLUDE_SUBSTR = ("Documents-Brain",)

def load():
    try:
        with open(LEDGER) as f: return json.load(f)
    except Exception:
        return {"processed": {}, "exports": {}}

def save(d):
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    with open(LEDGER, "w") as f: json.dump(d, f, indent=2)

def transcripts():
    out = []
    for p in glob.glob(os.path.join(PROJECTS, "*", "*.jsonl")):
        proj = os.path.basename(os.path.dirname(p))
        if any(s in proj for s in EXCLUDE_SUBSTR):
            continue
        out.append(p)
    return sorted(out)

def pending():
    led = load()["processed"]
    return [p for p in transcripts() if os.path.getmtime(p) > led.get(p, 0) + 1]

def proj(p): return os.path.basename(os.path.dirname(p))

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    if cmd == "list":
        p = pending()
        if not p: print("No new sessions since last synthesis."); return
        print(f"{len(p)} pending session(s):")
        for f in p: print(f"  [{proj(f)}] {os.path.basename(f)} ({os.path.getsize(f)//1024} KB)")
    elif cmd == "paths":
        for f in pending(): print(f)
    elif cmd == "baseline":
        d = load(); d["processed"] = {p: os.path.getmtime(p) for p in transcripts()}
        save(d); print(f"Baseline set: {len(d['processed'])} transcript(s) marked processed.")
    elif cmd == "commit" and len(sys.argv) > 2:
        d = load(); n = 0
        for ln in open(sys.argv[2]):
            p = ln.strip()
            if p and os.path.exists(p): d["processed"][p] = os.path.getmtime(p); n += 1
        save(d); print(f"Committed {n} session(s) to ledger.")
    else:
        print(__doc__); sys.exit(1)

if __name__ == "__main__":
    main()
