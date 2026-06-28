# Operating Manual — Brain (do-brain)

> Read this file before doing anything in this directory. This is a **do-brain**: a self-improving memory of *what the owner does and has done*, distilled from their Claude Code session history. The synthesis agent reads this manual every night to know how to maintain the memory.

## What this brain is for

- **Wide context** (always loaded): `overview.md` — a structured memory brief auto-injected into every session. Three parts: **(I) Fixed context** (who the owner is — stable), **(II) Recent & active work** (recency-weighted, freshest first, WITH real detail per item), **(III) How to work with them**. Target ~2–8k tokens; detailed, not a bare index.
- **Task context** (pulled on demand): `projects/`, `lessons/`, `people/` pages.
- **Performance memory** (the point): `lessons/` — what strategies worked, what needed correction. This is what makes future work better, not just better-informed.

## Folder map

| Folder | Holds |
|---|---|
| `self/` | Identity, background, working style |
| `projects/` | One page per real project — arc, stack, decisions, state |
| `lessons/` | Performance memory — one page per reusable lesson |
| `people/` | Collaborators and contacts |
| `overview.md` | Always-loaded wide-context brief (keep rich but bounded) |

## Page conventions (AI-first)

Every page: a **"For future Claude" preamble** (2–3 sentences), **frontmatter** (`title`, `type`, `tags`, `created`, `updated`, `sources`), **recency markers** on time-bound facts, **confidence** levels where it matters (`stated | high | medium | speculation`), and **`[[wikilinks]]`** liberally. Every claim traceable to the session it came from.

## The synthesis loop (how this brain updates itself)

Runs nightly via the scheduled job. Each run:
1. **Scan** for unprocessed sessions (`scan-sessions` lists transcripts new since last run).
2. **Read** each pending session — extract the *human* turns first (intent, corrections, identity live there).
3. **Distill ruthlessly.** For each session: new facts about the owner → `self/`; real project work → `projects/`; a strategy that worked or needed correction → `lessons/` (priority output); new person → `people/`. **Skip low-signal sessions** — note them processed, don't manufacture pages.
4. **Update `overview.md`** — keep its 3-part structure; add new work near the top of Part II under the right recency tier, demote aging entries down the tiers (full detail lives on the linked page). Keep Part I stable.
5. **Record** processed sessions in the ledger so nothing repeats.
6. **Append** a one-line entry to `log.md`.

### Synthesis quality rules
- A lesson must be **reusable and specific** — "key X off the unique Y," not "be careful."
- Prefer **updating** an existing page over creating a near-duplicate. Merge, don't accrete.
- On contradiction: note both claims with sources, resolve by recency; don't silently overwrite.

## Do not
- Don't modify session transcripts — they are read-only source.
- Don't let `overview.md` bloat past ~10k tokens — it's paid on every session.
- Don't fabricate. If something is unknown, leave a `> [!question]` gap.
