# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # production build
npm run lint             # eslint (flat config, eslint-config-next)
npm run verify           # check every citation in the dataset; exits 1 on failure
npx tsc --noEmit         # typecheck
```

There is no test framework. `npm run verify` is the test suite that matters: it re-checks every
`Source` URL in the dataset and is what CI gates on. It makes live network requests to government
sites, so it takes a minute and needs connectivity. Run it after any change under `lib/data/`,
`lib/timeline.ts`, `lib/regions.ts` or `lib/verify.ts` — the GitHub workflow runs it on pushes
touching exactly those paths.

To exercise a cron route locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/sync-bans
```

## Architecture

Next.js 16 App Router, React 19, Tailwind v4 (`@theme` tokens in `app/globals.css`, no config file),
shadcn/ui in `components/ui/` (style `radix-nova`), `@/*` → repo root.

**The dataset is TypeScript source, not a database.** `lib/data/{colours,additives,practices}.ts`
export `Ingredient[]` arrays; `lib/ingredients.ts` concatenates and sorts them into `INGREDIENTS`
and exposes the query/aggregate functions every page and API route uses. Editing data means editing
those three files and running `npm run verify`. There is no migration, seed, or fetch step.

Everything hangs off `lib/types.ts`. Read it first — its comments carry the domain rules.

**Sources are interned.** Every citation comes from the `S` object in `lib/data/sources.ts` rather
than being written inline, so a URL appears once and `lib/verify.ts` has a finite set to check.
Federal Register labels embed the published citation in parentheses — `"... (90 FR 4628)"` — and
`verify.ts` parses that out and compares it against what the Federal Register API returns for the
document number in the URL. Keep that format when adding a Federal Register source or the identity
check silently degrades to a mere link check.

**Two schedulers, two different jobs** (`vercel.json` + `.github/workflows/verify-sources.yml`):

- `/api/cron/verify-sources` (11:00 and 23:00 UTC) re-checks claims already published. Returns 503
  when unhealthy. Mirrored by GitHub Actions, which opens/closes an issue. Also surfaced at
  `/status` and `GET /api/verify` (6h revalidate).
- `/api/cron/sync-bans` (14:00 UTC) looks for *new* rules from the Federal Register and openFDA. It
  writes to a review queue (`data/review-queue.json` via `lib/review-queue.ts`) and **never** to the
  site. A human promotes confirmed changes into `lib/timeline.ts`.

Both require `CRON_SECRET` and refuse to run without it rather than defaulting to open.

Two Vercel cron entries rather than one `0 11,23 * * *`: the Hobby plan rejects multi-hour
expressions, so the two entries carry distinct `?run=` query strings to be distinct jobs.

**Rendering.** Ingredient and food-category pages are statically generated via
`generateStaticParams`. Live-data pages (`/recalls`, `/status`) use `revalidate`. API responses go
through `json()` in `lib/api.ts`, which applies CORS and a 1h shared cache — use it rather than
`NextResponse.json` directly. `/api/openapi` is a hand-maintained schema; update it when endpoints
or query params change.

## Domain rules the code enforces

These are the invariants worth preserving; the tone of the whole codebase follows from them.

- **`banned` ≠ `not-authorised`.** The US runs a negative list (legal until revoked); the other five
  regions run positive lists (only listed substances may be used). A substance can be absent from an
  EU list with no regulator having examined it. Never collapse these two statuses, in the UI, the
  API, or the counts.
- **`phase-out` means still legal.** A revocation sets a compliance date; `lib/shelf.ts` derives the
  "is this still on shelves?" answer purely from dates already in the dataset.
- **Recalls are events, not rules.** `/recalls` (openFDA) is deliberately walled off from the
  substance database and is never evidence that an ingredient is banned. The sync job never promotes
  an openFDA item on its own.
- **Product data is weaker evidence.** `lib/products.ts` pulls crowd-sourced Open Food Facts label
  photos; a record means *a label someone photographed once listed this*, not that a named company
  sells it today. The UI must say so, and must never make a factual claim about a real business.
- **Blocked ≠ broken.** `lib/verify.ts` reports bot-blocking hosts (EFSA, federalregister.gov HTML)
  and timeouts as `blocked`, which does not fail the run.
- **Attribute, don't assert.** `whyRestricted` states the regulator's stated reason. Permitted is not
  a claim of safety; banned is not a claim of harm.

Prose and identifiers use British spelling (`colour`, `authorised`, `not-authorised`), except when
quoting a US document title ("Color Additive Status List").
