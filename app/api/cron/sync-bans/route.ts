import type { NextRequest } from "next/server";
import { enqueue } from "@/lib/review-queue";
import type { QueueItem } from "@/lib/types";

/**
 * Daily sync. Runs at 14:00 UTC via Vercel Cron (see vercel.json).
 *
 * Pulls candidate documents from two free, keyless, official sources into a
 * review queue. Neither source emits a clean "X is now banned" record — the
 * Federal Register publishes rulemaking prose and openFDA publishes recalls —
 * so nothing here is auto-published. A human promotes confirmed changes into
 * lib/timeline.ts, which is what the site actually renders.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Fails soft: one dead source must not take the whole sync down. */
async function fetchJson(url: string, label: string): Promise<{ data: unknown; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "food-ban-tracker (+https://github.com/)" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) return { data: null, error: `${label} returned ${res.status}` };
    return { data: await res.json() };
  } catch (err) {
    return { data: null, error: `${label} failed: ${err instanceof Error ? err.message : "unknown error"}` };
  }
}

interface FederalRegisterDoc {
  document_number: string;
  title: string;
  publication_date: string;
  html_url: string;
}

interface OpenFdaRecall {
  recall_number: string;
  product_description: string;
  reason_for_recall: string;
  report_date: string;
}

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without a secret
  // configured the endpoint would be an open, unmetered proxy to two public
  // APIs, so refuse to run rather than defaulting to open.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const fetchedAt = new Date().toISOString();
  const items: QueueItem[] = [];
  const errors: string[] = [];

  // 1. Federal Register — the legal record itself. An actual authorisation
  //    revocation shows up here first, as a RULE from the FDA.
  const fedRegUrl =
    "https://www.federalregister.gov/api/v1/documents.json?" +
    new URLSearchParams({
      "conditions[agencies][]": "food-and-drug-administration",
      "conditions[type][]": "RULE",
      "conditions[term]": "food additive OR color additive",
      "fields[]": "document_number",
      order: "newest",
      per_page: "20",
    }) +
    // URLSearchParams cannot express a repeated key cleanly alongside the rest,
    // so the remaining `fields[]` entries are appended by hand.
    "&fields[]=title&fields[]=publication_date&fields[]=html_url";

  const fedReg = await fetchJson(fedRegUrl, "Federal Register");
  if (fedReg.error) errors.push(fedReg.error);
  else {
    const results = (fedReg.data as { results?: FederalRegisterDoc[] })?.results ?? [];
    for (const doc of results) {
      items.push({
        source: "federal_register",
        externalId: doc.document_number,
        title: doc.title,
        status: "unreviewed",
        publishedAt: doc.publication_date,
        sourceUrl: doc.html_url,
        fetchedAt,
      });
    }
  }

  // 2. openFDA — food recalls. A supplementary signal of recent activity
  //    rather than evidence of a ban; kept separate in the queue for that
  //    reason, and never promoted to the timeline on its own.
  const openFdaUrl =
    "https://api.fda.gov/food/enforcement.json?" +
    new URLSearchParams({ sort: "report_date:desc", limit: "20" });

  const openFda = await fetchJson(openFdaUrl, "openFDA");
  if (openFda.error) errors.push(openFda.error);
  else {
    const results = (openFda.data as { results?: OpenFdaRecall[] })?.results ?? [];
    for (const item of results) {
      items.push({
        source: "openfda",
        externalId: item.recall_number,
        title: `${item.product_description} — ${item.reason_for_recall}`.slice(0, 300),
        status: "unreviewed",
        // openFDA dates arrive as YYYYMMDD; normalise so sorting works.
        publishedAt: item.report_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3"),
        // See lib/recalls.ts: IRES has no working deep link, so the queue
        // records the openFDA record for the same recall number.
        sourceUrl: `https://api.fda.gov/food/enforcement.json?search=recall_number:%22${encodeURIComponent(
          item.recall_number,
        )}%22`,
        fetchedAt,
      });
    }
  }

  const result = await enqueue(items);

  return Response.json({
    ok: errors.length === 0,
    fetched: items.length,
    ...result,
    errors,
    ranAt: fetchedAt,
  });
}
