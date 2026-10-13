# Islam in Japan

Japanese-first (`/ja`) and English (`/en`) Islamic education platform: a Next.js public site, Payload CMS
(`/admin`) and an AI-assisted editorial workflow, deployed as one application on PostgreSQL.

> Status: **Phases 1–2** complete — CMS, roles and editorial workflow; public website (home, Discover Islam,
> Islam in Japan timeline, Muslim Life, FAQ, articles, search, about/policies, contact), SEO and draft preview.
> AI Content Studio (Phase 3) and deployment hardening (Phase 4) follow.

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
  lib/             i18n, history dates, content loaders, SEO, rich-text builder, Payload client
  seed/            idempotent seed script and draft content
  migrations/      database migrations
tests/unit, tests/int, tests/e2e
```
