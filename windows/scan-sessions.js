#!/usr/bin/env node
// Brain session scanner (Node, cross-platform). Finds Claude Code transcripts
// new/modified since the last synthesis run. State in ledger.json (path -> mtime).
// Usage: node scan-sessions.js [list|paths|baseline|commit <file>]
const fs = require("fs"), os = require("os"), path = require("path");

const PROJECTS = path.join(os.homedir(), ".claude", "projects");
const LEDGER = path.join(os.homedir(), ".claude", "brain", "ledger.json");
// Exclude the Brain's own project dir (synthesis runs cd into it and write transcripts there).
const EXCLUDE = ["Documents-Brain", "Documents\\Brain"];

function load() {
  try { return JSON.parse(fs.readFileSync(LEDGER, "utf8")); }
  catch { return { processed: {}, exports: {} }; }
}
function save(d) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.writeFileSync(LEDGER, JSON.stringify(d, null, 2));
}
function transcripts() {
  let out = [];
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECTS); } catch { return out; }
  for (const d of dirs) {
    if (EXCLUDE.some(s => d.includes(s))) continue;
    const dir = path.join(PROJECTS, d);
    let files = [];
    try { files = fs.readdirSync(dir); } catch { continue; }
    for (const f of files) if (f.endsWith(".jsonl")) out.push(path.join(dir, f));
  }
  return out.sort();
}
function mtime(p) { return fs.statSync(p).mtimeMs / 1000; }
function pending() {
  const led = load().processed;
  return transcripts().filter(p => mtime(p) > (led[p] || 0) + 1);
}

const cmd = process.argv[2] || "list";
if (cmd === "list") {
  const p = pending();
  if (!p.length) { console.log("No new sessions since last synthesis."); }
  else { console.log(`${p.length} pending session(s):`);
    for (const f of p) console.log(`  ${path.basename(path.dirname(f))}/${path.basename(f)} (${Math.round(fs.statSync(f).size/1024)} KB)`); }
} else if (cmd === "paths") {
  for (const f of pending()) console.log(f);
} else if (cmd === "baseline") {
  const d = load(); d.processed = {}; for (const p of transcripts()) d.processed[p] = mtime(p);
  save(d); console.log(`Baseline set: ${Object.keys(d.processed).length} transcript(s) marked processed.`);
} else if (cmd === "commit" && process.argv[3]) {
  const d = load(); let n = 0;
  for (const ln of fs.readFileSync(process.argv[3], "utf8").split(/\r?\n/)) {
    const p = ln.trim();
    if (p && fs.existsSync(p)) { d.processed[p] = mtime(p); n++; }
  }
  save(d); console.log(`Committed ${n} session(s) to ledger.`);
} else {
  console.log("Usage: node scan-sessions.js [list|paths|baseline|commit <file>]"); process.exit(1);
}
