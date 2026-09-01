# Food Ban Tracker

Every food additive banned or restricted in the United States — federal and state — set against the
same substance's status in the EU, UK, Canada, Australia/NZ and Japan. Every record links to the
government document it came from.

## Run it

```bash
npm install
npm run dev
```

## The one design decision worth knowing about

The US runs a **negative list** (lawful until an authorisation is revoked). The EU, UK, Canada,
Australia/NZ and Japan run **positive lists** (only what is listed may be used). So a substance can
be absent from a European list without any regulator having examined it.

The schema therefore keeps `banned` and `not-authorised` as distinct statuses everywhere, including
in the API. Collapsing them is the most common error in popular coverage of this subject and it
materially inflates the "banned in Europe" headline counts.

## Structure

```
app/
  page.tsx                    Home — stat tiles, what's new, US-as-outlier
  database/                   Searchable, filterable table
  ingredients/[slug]/         Detail: federal, state, six regions, history
  foods/  foods/[category]/  Browse by food type rather than by substance
  recalls/                    Live FDA food recalls (openFDA, hourly cache)
  compare/                    Region × substance status matrix
  changes/                    Full verified timeline
  api-docs/  about/           API reference; sources and method
  api/                        REST endpoints (see below)
lib/
  types.ts                    Status vocabulary and record shapes
  regions.ts                  Regulators, status metadata, severity ordering
  data/                       The dataset — colours, additives, practices
  food-categories.ts          Food-type taxonomy and the substance mapping
  recalls.ts                  openFDA enforcement feed
  timeline.ts                 Verified changes to the legal record
  review-queue.ts             Storage for the daily sync's candidates
```

## API

Free, keyless, CORS-open, cached an hour at the edge. Machine-readable schema at `/api/openapi`.

| Endpoint | |
|---|---|
| `GET /api/ingredients` | `?region= &status= &category= &search= &hasStateAction=` |
| `GET /api/ingredients/:slug` | Full record plus change history |
| `GET /api/latest` | `?limit=` (1–100) |
| `GET /api/compare` | `?ids=red-3,titanium-dioxide&regions=US,EU,UK` |
| `GET /api/regions` | Regulators and the status vocabulary |
| `GET /api/recalls` | `?limit= &classification= &ongoing=` — live openFDA feed |

Every record carries `status`, `effective_date` and `source_url` so a consumer can always trace a
claim back to the primary document.

## Verification — how the data stays correct

Linking to a primary source is a promise, and a promise nobody re-checks decays quietly. Two
checks run against **every citation in the dataset**:

1. **Reachability** — the URL is requested and redirects followed.
2. **Identity** — for Federal Register citations, the published reference (`90 FR 4628`) is parsed
   out of the source label and compared against what the API returns for that document number.

The second check is the one that matters. A rule can be replaced by an unrelated notice while still
answering HTTP 200 — this project shipped exactly that bug, with a brominated vegetable oil citation
resolving to an antidumping notice about raw honey from Brazil. A link checker sees nothing wrong.

```bash
npm run verify          # exits non-zero on a changed or dead citation — safe to gate a deploy
```

### When it runs

Twice a day, morning and evening, from two independent places — so a failure in
one does not mean the check silently stops.

| Where | Schedule | On failure |
|---|---|---|
| **GitHub Actions** | 11:00 and 23:00 UTC, plus every push touching the dataset | Fails the run and opens an issue; closes it when sources verify again |
| **Vercel cron** | 11:00 and 23:00 UTC | Returns `503`, visible in the Vercel dashboard |
| `/status` | On demand, cached 6h | Renders failures publicly |
| `GET /api/verify` | On demand, cached 6h | `503` when unhealthy |
| `npm run verify` | Manual / CI | Exits `1` — safe to gate a deploy |

Times are UTC and chosen to land morning and evening US Eastern (11:00 UTC is
07:00 EDT, 23:00 UTC is 19:00 EDT). Neither scheduler observes daylight saving,
and Vercel may fire anywhere inside the scheduled hour.

**Why two entries rather than one `0 11,23 * * *`:** Vercel's Hobby plan allows
100 cron jobs per project but only one run per day each, and a multi-hour
expression is rejected at deploy time. Two entries with distinct query strings
are two daily jobs, which is allowed.

Hosts that refuse bots but serve browsers (EFSA behind Cloudflare) are reported as **not checkable**
rather than broken — calling a live page dead is its own kind of wrong.

## Daily sync

`vercel.json` schedules `/api/cron/sync-bans` for 14:00 UTC. Where verification protects claims
already published, this job looks for new ones. It pulls from two free, keyless,
official sources:

- **Federal Register** — FDA `RULE` documents matching food/colour additive terms. An actual
  authorisation revocation appears here first.
- **openFDA Food Enforcement** — recalls. A recent-activity signal, not evidence of a ban, so items
  from this source are never promoted on their own.

Both feed a **review queue**, not the site. Neither emits a clean "X is now banned" record, and
machine-reading legal prose into a status is precisely where errors would enter. A person confirms
what each document did, then promotes it into `lib/timeline.ts`.

This works: the first live run flagged that Orange B had been revoked by final order on 2026-07-23
(91 FR 46276, effective 2026-09-08) while the seeded dataset still had it as `pending` — and that
Citrus Red No. 2 got only a *proposed* rule the same day, so it correctly stayed `pending`.

Set `CRON_SECRET` (see `.env.example`); Vercel sends it as `Authorization: Bearer $CRON_SECRET`.
Without it the endpoint refuses to run rather than defaulting to open.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/sync-bans
```

**The queue is a JSON file** under `data/`, which suits a small append-mostly list read by a human.
Vercel's filesystem is ephemeral, so move `lib/review-queue.ts` to Postgres before relying on it in
production — `enqueue`/`listQueue` are the only two functions to reimplement.

## Recalls are not bans

`/recalls` is live openFDA data and answers a different question from the rest of the site. The
database tracks which *substances* a regulator permits; a recall is an *event* — one batch of one
product, withdrawn for one reason. A recall is never treated as evidence that an ingredient is
banned, and the two are kept in separate sections for that reason.

The feed covers **FDA-regulated foods only**. Meat, poultry and egg *products* are USDA FSIS's and
are recalled through a separate system; shell eggs are the FDA's and do appear.

## Not covered

State *bills* (only the three enacted laws — CA, WV, TX), contaminants and pesticide residues, and
the thousands of additives permitted everywhere without controversy. `/about` explains why.

## Data caveat

Statuses describe what regulators decided and the reasons they gave. That a substance is permitted
is not a claim it is safe; that one is banned is not a claim it harmed anyone. Where this dataset
and a linked document disagree, the document is right.
