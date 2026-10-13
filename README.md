# Islam in Japan

Japanese-first (`/ja`) and English (`/en`) Islamic education platform: a Next.js public site, Payload CMS
(`/admin`) and an AI-assisted editorial workflow, deployed as one application on PostgreSQL.

> Status: **Phase 1 (foundation)** complete — CMS schema, roles, editorial workflow, locale routing and design
> system. Public section pages, AI Content Studio and deployment docs follow in Phases 2–4.

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

## Project layout

```text
src/
  access/          role checks shared by collections
  app/(frontend)/[locale]/   public site (ja, en)
  app/(payload)/   Payload admin + REST/GraphQL API (generated)
  collections/     Articles, HistoryEvents, FAQs, Sources, Categories, Media, EditorialTopics, Users
  globals/         SiteSettings, Navigation, Homepage, Footer, ContactSettings, EditorialPolicy
  fields/, hooks/  shared field definitions, workflow and publish checks
  lib/             i18n, history date model, Payload client, site data loaders
  migrations/      database migrations
tests/unit, tests/int, tests/e2e
```
