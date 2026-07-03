#!/usr/bin/env node
// Brain synthesis runner (Node, cross-platform). Scans for new Claude Code sessions
// and, if any, runs a headless Claude pass that distills them into the Brain per its
// _CLAUDE.md. Idempotent via the ledger. Processes up to MAX_PER_RUN sessions per run
// (run repeatedly to drain a large first-time backlog). Auth via a long-lived token
// from `claude setup-token` (a scheduled task can't refresh the keychain/login token).
//   node synthesize.js
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const HOME = os.homedir();
const BRAIN = path.join(HOME, "Documents", "Brain");
const MACH = path.join(HOME, ".claude", "brain");
const SCAN = path.join(MACH, "scan-sessions.js");
const PENDING_FILE = path.join(MACH, "pending.txt");
const LOG = path.join(MACH, "synthesize.log");
const TOKEN_FILE = path.join(MACH, "oauth-token");
const MODEL = "sonnet";
const MAX_PER_RUN = 10;

const ts = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const logln = s => fs.appendFileSync(LOG, `[${ts()}] ${s}\n`);
const sleep = ms => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch {} };

fs.mkdirSync(MACH, { recursive: true });
logln("--- synthesis run start ---");

if (fs.existsSync(TOKEN_FILE)) {
  process.env.CLAUDE_CODE_OAUTH_TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim();
} else {
  logln("WARNING: no oauth-token file — headless auth will likely 401. Run: claude setup-token");
}

let pending = [];
try { pending = execFileSync("node", [SCAN, "paths"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean); } catch {}
if (!pending.length) { logln("nothing new; exiting"); process.exit(0); }

const batch = pending.slice(0, MAX_PER_RUN);
fs.writeFileSync(PENDING_FILE, batch.join("\n") + "\n");
logln(`${pending.length} pending; processing ${batch.length} this run`);

const PROMPT = `You are the autonomous Brain synthesis agent. Read the operating manual at "${path.join(BRAIN, "_CLAUDE.md")}" and follow its synthesis loop exactly. The list of unprocessed Claude Code transcript paths to distill this run is in ${PENDING_FILE} (read it). Distill ruthlessly into self/ projects/ lessons/ principles/ people/ tools/ — including judgments the owner voiced or enforced, run through self/thinking-lens.md into first-person principles/ pages — maintain overview.md per its rules, and append a one-line entry to "${path.join(BRAIN, "log.md")}". Run silently and make the edits directly.`;

let ok = false, delay = 30000;
const logFd = fs.openSync(LOG, "a");
for (let i = 1; i <= 4; i++) {
  logln(`attempt ${i}/4`);
  const r = spawnSync("claude", ["-p", PROMPT, "--model", MODEL, "--dangerously-skip-permissions"],
    { cwd: BRAIN, env: process.env, shell: true, stdio: ["ignore", logFd, logFd] });
  if (r.status === 0) { ok = true; break; }
  logln(`attempt ${i} failed (status ${r.status}); backing off ${delay/1000}s`);
  sleep(delay); delay *= 2;
}
fs.closeSync(logFd);

if (ok) {
  try { console.log(execFileSync("node", [SCAN, "commit", PENDING_FILE], { encoding: "utf8" })); } catch {}
  logln("--- synthesis run done ---");
  const remaining = pending.length - batch.length;
  if (remaining > 0) logln(`${remaining} still pending — run again to continue draining.`);
} else {
  logln("!! all 4 attempts failed; NOT committing ledger (will retry next run)");
  process.exit(1);
}
