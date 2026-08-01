# CLAUDE.md — Countist Marketing

**Type:** Marketing site for Countist under STRUCTURL / FYLUM LLC (DBA Structurl)
**Status:** LIVE
**Tech:** Astro (static site generation) + a minimal hand-rolled Node `http` server — no framework backend
**Not to be confused with:** `Countist-App` (the actual product at app.countist.app — separate repo, separate deploy)

---

## Standing Instruction — Connect CLAUDE_OS Every Session
*Added 2026-08-01.* This file auto-loads at session start because it lives in the connected project folder. `~/Projects/CLAUDE_OS` does not — it's a separate folder and has to be requested explicitly. Call `request_cowork_directory` on `~/Projects/CLAUDE_OS` early in every session (start, any milestone/update during the day, and before any end-of-session handoff write) so TASKS.md, session_log.md, and the memory/ directory are reachable. This is the only mechanism available from inside a session without a dedicated app-level connected-folders setting.

---

## What It Is

Static Astro marketing site for Countist (privacy-first subscription tracker, see `memory/projects/countist.md` in CLAUDE_OS for full product context). Pages: home (`index.astro`, largest file at ~46KB — the primary landing page), `pricing`, `faqs`, `join`, `contact`, `privacy`, `terms`. No CMS, no database — content lives directly in the `.astro` files.

## Structure

```
src/pages/       One .astro file per route (index, pricing, faqs, join, contact, privacy, terms)
src/layouts/     Shared layout components
public/          Static assets
scripts/         Build-time scripts — generate-og.mjs runs pre-build to generate OG share images via satori + resvg
server.js        Hand-rolled Node http server that serves the Astro-built dist/ folder in production (no Express)
astro.config.mjs
railway.toml     Railway deploy config
```

`server.js` is deliberately minimal: no Express, just Node's built-in `http` module with a small MIME-type map and file-existence-based routing (tries exact path, then `path/index.html`, then `path.html`). It also handles one explicit redirect: `/home` → `/`. If new redirects are needed, add them to the `REDIRECTS` object at the top of the file.

## Tech Stack

Astro 4.x, satori + @resvg/resvg-js (OG image generation at build time via `scripts/generate-og.mjs`, runs as the `prebuild` npm script), plain Node `http` for serving. No React/Vue/Svelte islands currently in use. No backend framework, no database.

## Deployment

Railway (`railway.toml`): nixpacks builder, `buildCommand = "npx astro build"`, `startCommand = "node server.js"`, healthcheck `/`. This is Railway-hosted, **not Netlify** — verified 2026-07-31 in a prior session when this fact was needed to correct a wrong assumption about a different repo (Countist-Marketing was the one actually checked and confirmed Railway-hosted at that time; don't assume otherwise without re-verifying).

## Known Items (not yet investigated further this session)

- Recent commits (7/29) fixed a sticky-FAQ-header bug and an unreliable mobile image-hide rule on the FAQ page — both CSS-only fixes, verified in headless Chromium per the commit message. No outstanding issue flagged.
- OG image generation (satori/resvg) runs at build time via the `prebuild` script — if OG images ever look stale after a content change, check that `scripts/generate-og.mjs` actually ran (Railway's nixpacks build should invoke `prebuild` automatically via npm's lifecycle hooks, but this hasn't been explicitly verified in a live deploy log).

---

## CLAUDE_OS End-of-Session Handoff

**Trigger:** the session ends, or Shane says "wrap up" / "log this" / "update memory".

**TASKS.md is the single source of truth for project execution history.** If work isn't written there, it did not happen as far as every future session is concerned. Write all five sections. Do not summarize in chat instead of writing the files.

**1. TASKS.md — append under TODAY** (`~/Projects/CLAUDE_OS/TASKS.md`), using these headings:
- **SHIPPED** — commits with hashes, one line each: what changed and why
- **FOUND** — bugs or issues discovered, fixed or only flagged
- **DECIDED** — judgment calls made, and the reasoning
- **WRONG** — anything asserted mid-session that turned out false and had to be corrected. **Never omit these.** Highest-value lines in the log; they never appear in a commit message.
- **OPEN** — what's left, split into what needs Shane's hands vs. what a future session can pick up

**2. This file (`CLAUDE.md`)** — architecture changes, new pages, deployment gotchas, footer date.

**3. session_log.md** (`~/Projects/CLAUDE_OS/memory/session_log.md`) — one 3-line entry (Date | Focus | Output/Decision), drop the oldest to keep 3, bump "Last updated".

**4. NOTION SYNC block** — append inside the same TASKS.md entry. Notion is the live task system and every session reconciles against it:

```
### NOTION SYNC
- DONE: <exact Notion task name> — <evidence: commit hash or how verified>
- PROGRESS: <task name> — <what moved, what remains>
- ADD: <new task name> | Initiative | Priority | Due date
- BLOCKED: <task name> — <what is blocking it>
```

Only mark **DONE** what is complete and verified. Partial work is **PROGRESS**. If this session's work has no matching Notion task, **ADD** it. If this session has Notion access, execute directly and append "(executed)"; otherwise leave the block for Cowork or the 11pm sync.
Tasks DB: `https://www.notion.so/ff5498a4a3134532b209aac6f93b3738` · data source `collection://dc8dd72b-71df-469a-898f-696421ff95d4`

**5. Memory — route anything durable to the right file:** founding insights → `memory/core-insights.md` · decisions with rationale → `memory/decisions.md` · cross-project facts → `CLAUDE_OS/CLAUDE.md` · project deep context → `memory/projects/countist.md` (shared with Countist-App — this is the marketing-site half of the same product)

**Fallback:** the `claude-code-eod-sync` Cowork scheduled task runs at 11pm ET daily and synthesizes a TASKS.md entry if none exists, and backfills `session_log.md` if the session skipped it. As of 2026-08-01 this repo is included in that task's git-commit scan (via GitHub API, all 10 active repos) — manual TASKS.md logging is still good practice, the fallback is a safety net.

---

*Shane Trost / Structurl — Countist Marketing — Handoff scaffolding added 2026-08-01*