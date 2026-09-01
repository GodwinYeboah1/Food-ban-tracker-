/**
 * Live food recalls from the openFDA Food Enforcement API.
 *
 * This is a different kind of record from the rest of the site. The database
 * tracks *rules* — which substances a regulator permits. A recall is an
 * *event*: a specific batch of a specific product, withdrawn for a specific
 * reason. They are kept in separate sections for that reason, and the recall
 * feed is never used as evidence that an ingredient is banned.
 *
 * Free, keyless, and capped well below the 1,000-request daily anonymous limit
 * by an hourly cache.
 */

/** openFDA also emits "Not Yet Classified" for reports the FDA has received
 *  but not yet assigned a severity — rare, but it exists and must not crash. */
export type RecallClass = "Class I" | "Class II" | "Class III" | "Not Yet Classified";

export interface Recall {
  /** URL segment for the detail page. Never empty — see `recallSlug`. */
  slug: string;
  /** FDA recall number. Can be blank: openFDA emits records without one. */
  id: string;
  product: string;
  reason: string;
  firm: string;
  classification: RecallClass;
  /** "Ongoing" | "Completed" | "Terminated" | "Pending" */
  status: string;
  /** ISO dates, normalised from openFDA's YYYYMMDD integers-as-strings. */
  reportDate: string;
  initiationDate: string;
  /** Free text: a list of states, "Nationwide", or a country list. */
  distribution: string;
  quantity: string;
  state: string;
  voluntary: string;
  /** Lot codes, UPCs and date codes identifying the affected batch. */
  codeInfo: string;
  sourceUrl: string;
}

interface OpenFdaRecall {
  recall_number: string;
  event_id?: string;
  product_description: string;
  reason_for_recall: string;
  recalling_firm: string;
  classification: string;
  status: string;
  report_date: string;
  recall_initiation_date: string;
  distribution_pattern: string;
  product_quantity: string;
  state: string;
  voluntary_mandated: string;
  code_info?: string;
}

/**
 * A stable URL segment for a recall.
 *
 * Roughly 1 in 120 recent openFDA records ships with an empty `recall_number`,
 * which previously produced a link to `recall_number:""` — a query matching
 * nothing in particular and returning an arbitrary unrelated recall. Those
 * records fall back to their event id.
 */
export function recallSlug(r: { recall_number?: string; event_id?: string }): string {
  const n = (r.recall_number ?? "").trim();
  if (n) return n;
  const e = (r.event_id ?? "").trim();
  return e ? `event-${e}` : "";
}

/** The openFDA query that returns exactly this record. */
export function recallSourceUrl(r: { recall_number?: string; event_id?: string }): string {
  const n = (r.recall_number ?? "").trim();
  const field = n ? `recall_number:%22${encodeURIComponent(n)}%22` : `event_id:%22${encodeURIComponent((r.event_id ?? "").trim())}%22`;
  return `https://api.fda.gov/food/enforcement.json?search=${field}`;
}

/** openFDA returns dates as "20260819". */
function isoDate(raw: string | undefined): string {
  if (!raw || raw.length !== 8) return "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

/** Firm names arrive in inconsistent case, often SHOUTED. */
function titleCase(s: string): string {
  if (!s) return "";
  // Leave anything already mixed-case alone — it is usually correct.
  if (s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Llc|Inc|Ltd|Co|Corp|Usa|Us|Llp)\b/g, (m) => m.toUpperCase());
}

export interface RecallFeed {
  recalls: Recall[];
  /** Date openFDA last refreshed the dataset, not the date we fetched. */
  lastUpdated: string;
  total: number;
  error?: string;
}

/** Normalises one openFDA record into the shape the UI uses. */
function toRecall(r: OpenFdaRecall): Recall {
  return {
    slug: recallSlug(r),
    id: r.recall_number,
    product: r.product_description ?? "",
    reason: r.reason_for_recall ?? "",
    firm: titleCase(r.recalling_firm ?? ""),
    classification: normaliseClass(r.classification),
    status: r.status ?? "Unknown",
    reportDate: isoDate(r.report_date),
    initiationDate: isoDate(r.recall_initiation_date),
    distribution: r.distribution_pattern ?? "",
    quantity: r.product_quantity ?? "",
    state: r.state ?? "",
    voluntary: r.voluntary_mandated ?? "",
    codeInfo: r.code_info ?? "",
    // FDA's IRES enforcement-report viewer has no working deep link (its
    // ?Product= parameter throws inside the app), so this is the openFDA
    // query returning exactly this record. It is shown on the detail page as
    // the citation, not handed to readers as raw JSON.
    sourceUrl: recallSourceUrl(r),
  };
}

/** One recall by slug, for the detail page. */
export async function fetchRecall(slug: string): Promise<Recall | null> {
  const isEvent = slug.startsWith("event-");
  const field = isEvent
    ? `event_id:"${slug.slice(6)}"`
    : `recall_number:"${slug}"`;

  const url =
    "https://api.fda.gov/food/enforcement.json?" +
    new URLSearchParams({ search: field, limit: "1" });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "food-ban-tracker" },
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 3600 },
    });
    // openFDA answers an unmatched search with 404, which is the normal
    // "no such recall" path rather than an error worth surfacing.
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: OpenFdaRecall[] };
    const hit = data.results?.[0];
    if (!hit) return null;
    return toRecall(hit);
  } catch {
    return null;
  }
}

export async function fetchRecalls(limit = 120): Promise<RecallFeed> {
  const url =
    "https://api.fda.gov/food/enforcement.json?" +
    new URLSearchParams({ sort: "report_date:desc", limit: String(Math.min(limit, 1000)) });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "food-ban-tracker" },
      signal: AbortSignal.timeout(15_000),
      // Recalls post in batches on a weekly cadence; an hour is plenty fresh
      // and keeps us far inside openFDA's anonymous rate limit.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { recalls: [], lastUpdated: "", total: 0, error: `openFDA returned ${res.status}` };
    }

    const data = (await res.json()) as {
      meta?: { last_updated?: string; results?: { total?: number } };
      results?: OpenFdaRecall[];
    };

    const recalls = (data.results ?? []).map(toRecall);

    return {
      recalls: recalls.filter((r) => r.slug),
      lastUpdated: data.meta?.last_updated ?? "",
      total: data.meta?.results?.total ?? recalls.length,
    };
  } catch (err) {
    return {
      recalls: [],
      lastUpdated: "",
      total: 0,
      error: err instanceof Error ? err.message : "Could not reach openFDA",
    };
  }
}

/** Anything unrecognised is treated as unclassified rather than guessed at —
 *  inventing a severity for a record the FDA has not rated would be worse
 *  than saying so. */
export function normaliseClass(raw: string | undefined): RecallClass {
  return raw && raw in CLASS_META ? (raw as RecallClass) : "Not Yet Classified";
}

export const CLASS_META: Record<RecallClass, { label: string; description: string; tone: string }> = {
  "Class I": {
    label: "Class I",
    description:
      "A reasonable probability that eating the product will cause serious adverse health consequences or death.",
    tone: "red",
  },
  "Class II": {
    label: "Class II",
    description:
      "May cause temporary or medically reversible harm; the chance of serious consequences is remote.",
    tone: "amber",
  },
  "Class III": {
    label: "Class III",
    description: "Unlikely to cause any adverse health consequence — usually a labelling or quality defect.",
    tone: "slate",
  },
  "Not Yet Classified": {
    label: "Unclassified",
    description: "The FDA has received the report but has not yet assigned a severity class.",
    tone: "blue",
  },
};

/** Icon per hazard group, resolved in components/recall-list.tsx. */
export const HAZARD_ICON: Record<string, string> = {
  Pathogen: "Biohazard",
  "Undeclared allergen": "Nut",
  "Foreign material": "Wrench",
  "Chemical contaminant": "FlaskConical",
  Labelling: "Tag",
  Other: "CircleDashed",
};

/**
 * FDA packs every affected pack size into one prose field, numbered inline
 * ("1. Kroger, Medium, 12 Eggs... 2. Kroger, Medium, 30 Eggs..."). That is
 * precisely what a shopper scans to see whether their carton is affected, so
 * split it back into items where the numbering makes that unambiguous.
 */
export function splitProductList(description: string): string[] | null {
  const text = description.trim();
  // Require the list to actually start at 1. and reach at least 3 items;
  // below that the numbering is more likely part of the prose.
  if (!/(^|\s)1\.\s/.test(text)) return null;

  const parts = text
    .split(/(?:^|\s)(?=\d{1,2}\.\s)/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 3) return null;

  // The text before "1." is a lead-in, not an item.
  const first = parts[0];
  if (!/^1\.\s/.test(first)) {
    const [lead, ...rest] = parts;
    return rest.length >= 3 ? [lead, ...rest] : null;
  }
  return parts;
}

/** Groups the free-text reason field into something filterable. */
export function hazardCategory(reason: string): string {
  const r = reason.toLowerCase();
  if (/salmonella|listeria|e\.? ?coli|botulism|clostridium|norovirus|hepatitis|bacter/.test(r)) {
    return "Pathogen";
  }
  if (/undeclared|allergen|milk|peanut|soy|wheat|egg|tree nut|sesame|fish|shellfish|gluten/.test(r)) {
    return "Undeclared allergen";
  }
  if (/foreign material|metal|plastic|glass|rubber|wood/.test(r)) return "Foreign material";
  if (/lead|cadmium|arsenic|mercury|heavy metal|pesticide|residue|contamina/.test(r)) return "Chemical contaminant";
  if (/label|mislabel|misbrand|packaging|net weight/.test(r)) return "Labelling";
  return "Other";
}
