# Islam in Japan

Japanese-first (`/ja`) and English (`/en`) Islamic education platform: a Next.js public site, Payload CMS
(`/admin`) and an AI-assisted editorial workflow, deployed as one application on PostgreSQL.

> Status: **Phases 1–3** complete — CMS, roles and editorial workflow; public website (home, Discover Islam,
> History of Islam in Japan timeline, Muslim Life, FAQ, articles, search, about/policies, contact), SEO, draft preview, and
> the AI Content Studio. Deployment hardening and documentation (Phase 4) follow.

## Requirements

- Node.js ≥ 20.9 (developed on Node 26)
- pnpm 10 (`npm i -g pnpm@10` — Node ≥ 25 no longer ships corepack)
- Docker (for local PostgreSQL and optional MinIO)

## Local setup

```bash
pnpm install
cp .env.example .env
# set PAYLOAD_SECRET in .env:  openssl rand -hex 32
pnpm db:up            # starts PostgreSQL (creates islaminjapan + islaminjapan_test databases)
pnpm migrate          # applies database migrations
pnpm seed             # optional: categories, navigation, policies + editorial DRAFTS (nothing is published)
pnpm dev              # http://localhost:3000 → redirects to /ja
```

Open http://localhost:3000/admin and create the first account — **the first account automatically becomes Admin**.
Create further Editor / Author accounts from *Users*.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev server, production build, production server |
| `pnpm typecheck` / `pnpm lint` | TypeScript and ESLint |
| `pnpm test:unit` | Pure unit tests (no database) |
| `pnpm test:int` | Integration tests against `DATABASE_URL_TEST` (schema is reset on every run) |
| `pnpm test:e2e` | Playwright browser tests (starts/reuses the dev server; needs `pnpm exec playwright install chromium`) |
| `pnpm migrate:create <name>` | Generate a migration after changing collections/globals |
| `pnpm migrate` | Apply pending migrations |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm seed` | Idempotent seed: categories, navigation, homepage, policy texts, and 17 article / 9 FAQ / 4 timeline **drafts** |

Schema changes always go through migrations (`push` is disabled), so development, test and production databases
share one reproducible schema history.

## Editorial model (summary)

- **Roles (server-enforced):** Admin — everything; Editor — review, approve, publish, verify sources; Author —
  write and edit own drafts, cannot approve or publish.
- **Workflow:** Idea → Researching → Draft → In review → Approved → Published. Publishing requires *Approved*.
- **Articles** are separate documents per language, linked by a shared *translation group ID*, so Japanese and
  English versions are reviewed and published independently.
- **History events / FAQs** use localized fields plus an editor-controlled *Published languages* list; the public
  API only returns them in published languages. No language fallback is ever shown as a translation.
- **Publish guards:** articles need a reviewer, all flagged claims resolved, and only verified sources; history
  events need a *Verified* fact-check and at least one verified source.
- **Sources:** a source can be marked *Verified* only by an editor who confirms its contents were actually consulted
  — a URL alone is never treated as evidence. Unverified sources and research notes are never public.

## Seed content — read before publishing

`pnpm seed` creates starting drafts (Japanese, plus English for two core articles). They were drafted with AI
assistance during setup, are recorded as such in *AI provenance*, and list the claims that still need evidence.
**No sources are seeded and nothing is published.** Before publishing any item an editor must review the text,
attach verified sources, resolve every flagged claim, approve it and publish. Timeline items are research leads
only (status *In research*) until verified. The privacy policy text is a draft that requires legal review.

Re-running the seed never overwrites existing records or editor changes to globals.

## Public site behaviour

- **Draft preview:** the *Preview* button in the admin opens `/preview?path=…`, which enables preview only for a
  signed-in CMS user. Drafts are never visible to anyone else, and previews are `noindex`.
- **Search engines:** indexing is **off** by default (`robots.txt` disallows all and pages are `noindex`). An admin
  enables it in *Site settings → Allow search engine indexing* at launch. Sitemap: `/sitemap.xml`; RSS:
  `/ja/rss.xml`, `/en/rss.xml`.
- **Contact form:** inquiries are stored in *Inquiries* (editors/admins only). Email notification is sent only when
  the `SMTP_*` variables and a recipient in *Contact settings* are configured; otherwise the queue is the only
  channel and the admin shows “Email not configured”. Abuse protection: validation, honeypot, minimum fill time,
  and a 5-per-hour limit keyed on a salted hash of the IP (raw IPs are never stored).
- **Rendering:** pages are server-rendered per request, so `pnpm build` does not need a database (it does need
  `PAYLOAD_SECRET`). Caching is a Phase 4 item.

## AI Content Studio (`/admin/ai-studio`)

Editors and authors fill in a brief (topic, content type, language, audience, level, purpose, style, length),
select **verified** sources and add research notes, then: generate an outline → edit it → generate a draft →
improve / simplify / generate SEO text / suggest related FAQs and topics → save to the CMS as a draft →
translate into a separate linked draft → preview → submit for review. The editorial-calendar section suggests
topics on demand and adds only the ones an editor selects.

**Provider.** Claude Code is the development tool; the website's runtime AI is the **OpenAI API** (official
`openai` TypeScript SDK, **Responses API**, structured outputs via `zodTextFormat`). No other AI provider is
used by the application.

| Setting | Default | Notes |
|---|---|---|
| `OPENAI_API_KEY` | — | Server-side only. Without it the Studio shows "not configured" and the API returns `503 not_configured`. |
| `OPENAI_MODEL` | `gpt-6.1-sol` | Main model: drafts, rewrites, simplification, translation. |
| `OPENAI_FAST_MODEL` | `gpt-6-luna` | Fast model: outlines, SEO metadata, suggestions, topic ideas. |
| `AI_MAX_OUTPUT_TOKENS` | `6000` | Per-response cap; reasoning tokens count toward it — raise it if long Japanese drafts are cut off. |
| `AI_MONTHLY_BUDGET_USD` | `20` | Site-wide guard on **estimated** spend per calendar month (Asia/Tokyo). |
| `OPENAI_STORE` | `false` | Sent as `store` on every request. |
| `AI_HOURLY_REQUEST_LIMIT` / `AI_DAILY_TOKEN_BUDGET` | `30` / `600000` | Per-user limits. |
| `AI_PRICE_INPUT_PER_MTOK` / `AI_PRICE_OUTPUT_PER_MTOK` | — | Price overrides for models outside the built-in table. |

Verify model availability and prices for your OpenAI account before launch; both models are configurable.

- **Structured, validated output:** title, summary, outline, body blocks, SEO, category, tags, `usedSourceIds`,
  `claimsRequiringVerification`, editorial notes. The response status, refusals and truncation are checked
  first; the JSON is then validated again with Zod on the server. The body is converted to Lexical rich text as
  plain text only — model HTML is never rendered.
- **Evidence rules:** only verified sources are sent, and only their approved excerpts (never research notes),
  in the lower-trust `input`; the editorial policy is the server-controlled `instructions`. A source without
  excerpts is labelled "bibliographic only — not fetched". Source IDs returned by the model are re-checked on
  the server; unknown IDs are dropped and reported. A model-produced citation is never treated as proof.
- **Human control:** output is saved only as an unpublished draft owned by the user, with the AI's flagged claims
  in *Claims requiring verification* (publishing is blocked until an editor resolves them) and *AI provenance*
  (model, prompt-template version, time, user, sources). Updating a saved draft replaces only the AI-authored
  text/SEO fields, keeps sources, claim resolutions and workflow status, and is refused if anyone edited the
  article since it was loaded. Every save is a new version.
- **Safeguards and logging:** per-user hourly limit (in-flight requests count) and rolling 24-hour token budget,
  site-wide monthly estimated-spend budget, 5-minute timeout with up to 2 SDK retries (exponential backoff),
  clear errors for missing key, unavailable model, quota, rate limits, refusals, invalid output and truncation.
  The *AI usage* log records user, action, model, tier, prompt version, request ID, tokens, estimated cost and
  outcome — never prompts or generated text.
- **Cost figures are estimates** from token counts and list prices, not the amount billed by OpenAI.
- **Data retention:** requests are sent with `store: false` by default. This controls response storage for
  later retrieval; it is **not** a zero-data-retention guarantee — OpenAI's API data-retention policy still
  applies. Confirm the current policy (and any zero-retention agreement) for your account before handling
  sensitive material.
- **Not a religious authority:** prompts forbid invented verses, hadith numbers, quotations, URLs or history and
  forbid rulings (fatwa). Policy and templates live in `src/prompts/` and are versioned in
  `src/prompts/versions.ts`.
- **Tests:** unit and integration tests use a mocked OpenAI client / fake provider and never call the API.
  `AI_LIVE_TEST=1 pnpm test:ai-live` runs an optional live smoke test (two small **paid** requests).

## History of Islam in Japan (`/[locale]/history-of-islam-in-japan`)

This section covers the history of **Islam and Muslim communities in Japan** — how Islam was encountered or
reached Japan, and how Muslim people, mosques, organizations and education developed — **not** general Japanese
history. Each timeline event records its date or range with precision (exact / month / year / circa / decade /
range / unknown), location, sources, uncertainty notes and differing accounts, and needs a verified fact-check,
at least one verified source and a reviewer before it can be published. Profiles of pioneers, scholars,
communities, mosques and associations are articles of type *Profile*. The former path `/islam-in-japan`
redirects permanently.

## Project layout

```text
src/
  access/          role checks shared by collections
  app/(frontend)/[locale]/   public site (ja, en)
  app/(payload)/   Payload admin + REST/GraphQL API (generated)
  collections/     Articles, HistoryEvents, FAQs, Sources, Categories, Media, EditorialTopics, Users
  globals/         SiteSettings, Navigation, Homepage, Footer, ContactSettings, EditorialPolicy
  fields/, hooks/  shared field definitions, workflow and publish checks
  features/contact/  contact form, validation, rate-limited submission service
  features/ai-studio/  AI Studio admin view, endpoints, generation/save services, limits
  lib/ai/          OpenAI provider adapter, schemas, config, errors
  prompts/         editorial/citation policy and prompt builders
  lib/             i18n, history dates, content loaders, SEO, rich-text builder, Payload client
  seed/            idempotent seed script and draft content
  migrations/      database migrations
tests/unit, tests/int, tests/e2e
```
