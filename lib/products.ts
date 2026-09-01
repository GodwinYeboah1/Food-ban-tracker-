/**
 * Product-level evidence from Open Food Facts.
 *
 * A deliberate change of evidentiary footing, and the UI must say so. Every
 * other claim on this site traces to a government document. This does not: Open
 * Food Facts is a crowd-sourced database of label photographs submitted by the
 * public. A record here means *a label someone photographed listed this
 * additive on a given date* — not that the product on the shelf today still
 * contains it. Manufacturers reformulate constantly, and a 2023 label proves
 * nothing about a 2026 carton.
 *
 * So: no product is ever described as "banned", every row carries its own
 * last-updated date, and the copy never asserts that a named company is
 * currently selling anything. Getting this wrong would be a false factual
 * claim about a real business.
 */

export interface ProductRecord {
  code: string;
  /** Front-of-pack photograph, CC-BY-SA via Open Food Facts. Often absent. */
  image?: string;
  name: string;
  brands: string;
  /** Retailers, where a contributor supplied them. Sparse — roughly 1 in 5. */
  stores: string;
  /** ISO date the label record was last edited by a contributor. */
  updated: string;
  url: string;
}

export interface ProductEvidence {
  /** Total US records whose label lists this additive. */
  total: number;
  products: ProductRecord[];
  /** How many of the returned rows name a retailer. */
  withStores: number;
  error?: string;
}

/**
 * Open Food Facts additive tags, mapped explicitly rather than derived from
 * `eNumber`. Several tracked substances have no additive tag at all (animal
 * drugs, processing treatments), and a free-text ingredient search for those
 * returns noise. Absent from this map means no product panel is shown — which
 * is the correct outcome, not a gap to paper over.
 */
export const OFF_TAG: Record<string, string> = {
  "red-3": "en:e127",
  "red-40": "en:e129",
  "yellow-5": "en:e102",
  "yellow-6": "en:e110",
  "blue-1": "en:e133",
  "blue-2": "en:e132",
  "green-3": "en:e143",
  "amaranth-red-2": "en:e123",
  "titanium-dioxide": "en:e171",
  "quinoline-yellow": "en:e104",
  "ponceau-4r": "en:e124",
  "brominated-vegetable-oil": "en:e443",
  "potassium-bromate": "en:e924",
  azodicarbonamide: "en:e927a",
  propylparaben: "en:e216",
  bha: "en:e320",
  carrageenan: "en:e407",
  cyclamate: "en:e952",
};

interface OffProduct {
  code?: string;
  image_front_small_url?: string;
  product_name?: string;
  brands?: string;
  stores?: string;
  last_modified_t?: number;
}

export async function fetchProductEvidence(slug: string): Promise<ProductEvidence | null> {
  const tag = OFF_TAG[slug];
  if (!tag) return null;

  const url =
    "https://world.openfoodfacts.org/api/v2/search?" +
    new URLSearchParams({
      countries_tags_en: "united-states",
      additives_tags: tag,
      fields: "code,product_name,brands,stores,last_modified_t,image_front_small_url",
      sort_by: "last_modified_t",
      page_size: "12",
    });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "food-ban-tracker/1.0 (open-data reference site)" },
      signal: AbortSignal.timeout(12_000),
      // Long cache: this is background context, and the API rate-limits hard.
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return { total: 0, products: [], withStores: 0, error: `Open Food Facts returned ${res.status}` };

    const data = (await res.json()) as { count?: number; products?: OffProduct[] };
    const products = (data.products ?? [])
      .filter((p) => p.code && (p.product_name ?? "").trim())
      .map((p): ProductRecord => ({
        code: p.code!,
        image: p.image_front_small_url || undefined,
        name: (p.product_name ?? "").trim(),
        brands: (p.brands ?? "").trim(),
        stores: (p.stores ?? "").trim(),
        updated: p.last_modified_t
          ? new Date(p.last_modified_t * 1000).toISOString().slice(0, 10)
          : "",
        url: `https://world.openfoodfacts.org/product/${p.code}`,
      }));

    // Records with a label photograph first: the photograph is the evidence,
    // and a grid of grey placeholders would be worse than a plain list.
    const ordered = [...products].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));

    return {
      total: data.count ?? products.length,
      products: ordered,
      withStores: products.filter((p) => p.stores).length,
    };
  } catch (err) {
    return {
      total: 0,
      products: [],
      withStores: 0,
      error: err instanceof Error ? err.message : "Could not reach Open Food Facts",
    };
  }
}
