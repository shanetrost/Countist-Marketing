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

## Analytics

**Direct GA4 tag since 2026-09-14 (`dbc3a37`); Google Tag Manager removed.** `src/layouts/Layout.astro` loads `G-W7QZSNR0EC` (property 517169966, "Countist Landing Page") in an `is:inline` block, plus a click listener that sends `cta_click` (`cta_label` = link text, `cta_page` = page path) on any link to `app.countist.app/join`. It's a port of the old container GTM-WSP5GF5C, which also held that event. Keep `is:inline`: without it Astro bundles the script into a deferred module and `gtag` stops being global. The privacy page (`src/pages/privacy.astro`) names Google Analytics; change the tag and the policy together, starting with the canonical `~/Projects/CLAUDE_OS/legal/policies/PRIVACY_countist.md`. The app at app.countist.app has its own tag (`G-HRM1ZG5JB4`, Countist-App repo), whose fate is an open decision.

## Deployment

Railway (`railway.toml`): nixpacks builder, `buildCommand = "npx astro build"`, `startCommand = "node server.js"`, healthcheck `/`. This is Railway-hosted, **not Netlify** — verified 2026-07-31 in a prior session when this fact was needed to correct a wrong assumption about a different repo (Countist-Marketing was the one actually checked and confirmed Railway-hosted at that time; don't assume otherwise without re-verifying).

**The red "Workers Builds: countist-marketing" check on every PR is a known false alarm — ignore it, it does not block merging (found 2026-09-14).** A Cloudflare Workers Git integration left over from a May 1 experiment (PR #1, `cloudflare/workers-autoconfig`, closed) still builds this repo. It fails in 0s on every non-`master` branch — PR #2 (May), PR #3 (Aug 31), PR #4 (Sep 14) all show it — and succeeds on every `master` commit. A 0s failure means the build never started: it's Cloudflare's branch-build setup, not the diff. The Worker does not serve the live site: `curl -sI https://countist.app/` returns `x-railway-request-id` (Railway origin behind the Cloudflare proxy). The check isn't required, so GitHub still shows "Able to merge." To silence it, disconnect the repo under Cloudflare → Workers & Pages → `countist-marketing` → Settings → Builds, after first confirming Settings → Domains & Routes has no route or custom domain on it (not yet checked). Don't delete the Worker without that check.

## Contact Form

**`/contact` given a real form for the first time (2026-08-22).** Previously mailto-only — found while reconciling the portfolio-wide "One Front Door" contact-form consolidation against what's actually live; the original audit missed this repo entirely (it treated Countist as having no public lead form, not realizing this marketing site has its own `/contact` separate from the `Countist-App` product). Added a form (name/email/message) using this site's existing but previously-unused Webflow form component classes (`form_fields`, `form_field`, `form_button`, `form_message-success`/`-error` in `public/css/countist.css`) rather than inventing new styles. POSTs to the shared intake service (`product: "Countist"`, `type: "Contact"`) — see `~/Projects/CLAUDE_OS/TASKS.md` 2026-08-22 for the full migration. The mailto CTA above the form stays as the fast path.

**Also fixed:** the intake service's `ALLOWED_ORIGINS` only had `app.countist.app` (the product app's domain) — this site's real domain, `countist.app`, was missing and would have silently CORS-blocked every real submission. Fixed on the intake service side (Railway env var), not in this repo.

## Known Items (not yet investigated further this session)

- Recent commits (7/29) fixed a sticky-FAQ-header bug and an unreliable mobile image-hide rule on the FAQ page — both CSS-only fixes, verified in headless Chromium per the commit message. No outstanding issue flagged.
- OG image generation (satori/resvg) runs at build time via the `prebuild` script — if OG images ever look stale after a content change, check that `scripts/generate-og.mjs` actually ran (Railway's nixpacks build should invoke `prebuild` automatically via npm's lifecycle hooks, but this hasn't been explicitly verified in a live deploy log).

---

## Legal pages (2026-09-18)

- `/privacy` renders `src/content/privacy-body.html`, generated from `~/Projects/CLAUDE_OS/legal/policies/``PRIVACY_countist.md` (one policy for the site, web app and iOS). `terms.astro` names the party **Fylum Agency LLC d/b/a Structurl**; it previously said "Structurl, LLC", which is not an entity. The footer reads © Structurl.
- **`Layout.astro`'s signed-in redirect skips `/privacy` and `/terms` (PR #7). Keep that exemption.** Without it, a visitor with a Clerk `__client_uat` cookie is bounced to the app, and since the app links to `countist.app/privacy`, signed-in users could never read the policy.
- A stray empty `.git_write_test` (2026-09-18 13:57, apparently from a crashed Cowork write probe, which also left a stale `.git/index.lock`) is untracked; don't commit it.

## CLAUDE_OS End-of-Session Handoff

**Trigger:** the session ends, or Shane says "wrap up" / "log this" / "update memory".

**TASKS.md is the single source of truth for project execution history.** If work isn't written there, it did not happen as far as every future session is concerned. Write all five sections. Do not summarize in chat instead of writing the files.

**1. TASKS.md — append under TODAY** (`~/Projects/CLAUDE_OS/TASKS.md`), using these headings:
- **SHIPPED** — commits with hashes, one line each: what changed and why
- **FOUND** — bugs or issues discovered, fixed or only flagged
- **DECIDED** — judgment calls made, and the reasoning
- **WRONG** — anything asserted mid-session that turned out false and had to be corrected. **Never omit these.** Highest-value lines in the log; they never appear in a commit message.
- **OPEN** — what's left, split into what needs Shane's hands vs. what a future session can pick up

**2. This file (`CLAUDE.md`)** — architecture changes, new pages, deployment gotchas, footer date. **Doc edits auto-commit, locked 2026-08-30 (Shane's call, portfolio-wide) — commit and push directly rather than leaving it uncommitted for later review**, same as code already does here. Full rationale: `~/Projects/CLAUDE_OS/memory/decisions.md`.

**3. session_log.md** (`~/Projects/CLAUDE_OS/memory/session_log.md`) — **one row per calendar day, not per session.** Changed 2026-08-31: the old keep-3-sessions rule let a single busy day consume the whole table, and on 2026-08-30 it did. Mechanics, all five required: (a) if today's row already exists, APPEND a short clause to its cells; never rewrite or regenerate an existing row. (b) Read that row immediately before appending; if it already carries this session's identifier, you already wrote it, stop. (c) Cap each day-row at roughly 400 words; at the cap, compress that row's oldest clauses rather than growing it. (d) Keep 5 day-rows, dropping the oldest DAY from the correct end of this oldest-first table. (e) Detail stays in TASKS.md; the row points, it does not narrate. Bump "Last updated".

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