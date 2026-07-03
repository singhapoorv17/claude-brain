# Operating Manual — Brain (do-brain)

> Read this file before doing anything in this directory. This is a **do-brain**: a self-improving memory of *what the owner does and has done*, distilled from their Claude Code session history. The synthesis agent reads this manual every night to know how to maintain the memory.

## What this brain is for

- **Wide context** (always loaded): `overview.md` — a structured memory brief auto-injected into every session. Three parts: **(I) Fixed context** (who the owner is — stable), **(II) Recent & active work** (recency-weighted, freshest first, WITH real detail per item), **(III) How to work with them**. Target ~2–8k tokens; detailed, not a bare index.
- **Task context** (pulled on demand): `projects/`, `lessons/`, `people/` pages.
- **Performance memory** (the point): `lessons/` — what strategies worked, what needed correction. This is what makes future work better, not just better-informed.
- **Judgment memory** (what makes it *their* brain): `principles/` — the owner's own operating principles, extracted by running every input through `self/thinking-lens.md`. Lessons are how *Claude* should execute; principles are how *the owner* decides and acts. A brain that only stores knowledge is a filing cabinet; extracting the judgment is what makes it learn the way a person does. Top active principles surface in `overview.md` so they shape everything produced in the owner's name.

## Folder map

| Folder | Holds |
|---|---|
| `self/` | Identity, background, working style — plus `thinking-lens.md`, the judgment filter (how the owner thinks + their active identity vectors) |
| `projects/` | One page per real project — arc, stack, decisions, state |
| `lessons/` | Performance memory — one page per reusable lesson (how Claude executes) |
| `principles/` | Judgment memory — one page per operating principle (how the owner decides/acts): Trigger, Rule, Why, Provenance, Status |
| `people/` | Collaborators and contacts |
| `overview.md` | Always-loaded wide-context brief (keep rich but bounded) |

## Page conventions (AI-first)

Every page: a **"For future Claude" preamble** (2–3 sentences), **frontmatter** (`title`, `type`, `tags`, `created`, `updated`, `sources`), **recency markers** on time-bound facts, **confidence** levels where it matters (`stated | high | medium | speculation`), and **`[[wikilinks]]`** liberally. Every claim traceable to the session it came from.

## The synthesis loop (how this brain updates itself)

Runs nightly via the scheduled job. Each run:
1. **Scan** for unprocessed sessions (`scan-sessions` lists transcripts new since last run).
2. **Read** each pending session — extract the *human* turns first (intent, corrections, identity live there).
3. **Distill ruthlessly.** For each session: new facts about the owner → `self/`; real project work → `projects/`; a strategy that worked or needed correction → `lessons/` (priority output); **a judgment the owner voiced or enforced** (a standard they held work to, a correction revealing how they decide, a "we should always/never X") → run it through `self/thinking-lens.md` into `principles/` (equal priority to lessons); new person → `people/`. **Skip low-signal sessions** — note them processed, don't manufacture pages.
4. **Update `overview.md`** — keep its 3-part structure; add new work near the top of Part II under the right recency tier, demote aging entries down the tiers (full detail lives on the linked page). Keep Part I stable.
5. **Record** processed sessions in the ledger so nothing repeats.
6. **Append** a one-line entry to `log.md`.

### Synthesis quality rules
- A lesson must be **reusable and specific** — "key X off the unique Y," not "be careful."
- A principle must be **prescriptive, first-person, and conditioned on who the owner is** — "When I <situation>, I <rule>, because <why>" — never a restatement of what a source or session said. Knowledge is what happened; judgment is what the owner does differently next.
- Keep the top 4–6 **active principles** surfaced in `overview.md` (one line each, linked); rotate as principles are added or superseded.
- Prefer **updating** an existing page over creating a near-duplicate. Merge, don't accrete.
- On contradiction: note both claims with sources, resolve by recency; don't silently overwrite.

## The judgment layer (what makes the brain intuitive)

Every input — a session, an ingested article, a conversation — yields **two** outputs:
1. **Knowledge**: what the source says (descriptive).
2. **Judgment**: what the owner, given who they are and how they think, should learn and apply going forward (prescriptive, first-person).

Most memory systems capture only #1. The judgment layer captures #2 via `self/thinking-lens.md`, a page that codifies the owner's named thinking modes (each grounded in real examples from their history) and their active identity vectors (founder, operator, writer, investor, …). The extraction procedure, for every input: which identity vector does this touch → what is the mechanism under the story → what would the owner do differently → phrase as "When I <situation>, I <rule>, because <why>" → durable? then `principles/<slug>.md`, else note it inline. If a companion read-vault (articles/sources wiki) exists, its ingest step runs the same lens and promotes durable judgments here — the one sanctioned write from the read-vault into the brain. If an input genuinely yields no judgment, say so; never force one.

*Canonical example:* an article reports that AI bots leave telltale patterns when commenting on posts. Knowledge = "bots leave telltales." Judgment for an owner who publishes AI-assisted writing = "When I publish AI-assisted writing, no telltales survive — they are disrespectful to the reader, sloppy, and dishonest." The article never prescribes; the lens does.

## Do not
- Don't modify session transcripts — they are read-only source.
- Don't let `overview.md` bloat past ~10k tokens — it's paid on every session.
- Don't fabricate. If something is unknown, leave a `> [!question]` gap.
