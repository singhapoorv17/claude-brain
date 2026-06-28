#!/usr/bin/env node
// SessionStart hook (Node, cross-platform): inject the Brain (overview + recency
// layer) into every Claude Code session, memory-efficiently. Resolves from homedir.
const fs = require("fs"), os = require("os"), path = require("path");

const BRAIN = path.join(os.homedir(), "Documents", "Brain");
const OVERVIEW = path.join(BRAIN, "overview.md");
if (!fs.existsSync(OVERVIEW)) process.exit(0);

console.log("# 🧠 Your Brain — background work-memory (auto-loaded, compressed)");
console.log("Your living memory across all Claude sessions: who you are and what's "
  + "active. Treat as background context. Read the linked [[pages]] from the Brain "
  + "folder ONLY when the current task needs that depth.\n");
console.log(fs.readFileSync(OVERVIEW, "utf8").trim());

// recency layer — recent work weighs higher
function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "raw") out = out.concat(walk(p)); }
    else if (e.name.endsWith(".md") && !["overview.md","log.md","_CLAUDE.md"].includes(e.name)) out.push(p);
  }
  return out;
}
let pages = [];
try { pages = walk(BRAIN); } catch {}
pages.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
if (pages.length) {
  console.log("\n## Freshest activity (recent = weight higher)");
  for (const p of pages.slice(0, 6)) {
    const d = new Date(fs.statSync(p).mtimeMs).toISOString().slice(0, 10);
    console.log(`- ${path.relative(BRAIN, p).replace(/\\/g, "/")} (updated ${d})`);
  }
}
console.log(`\nFull Brain at ${BRAIN} — pull task-specific pages on demand.`);
