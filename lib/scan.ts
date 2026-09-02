import { OFF_TAG } from "./products";
import { getIngredient, rulingFor } from "./ingredients";
import { STATUS_SEVERITY } from "./regions";
import type { Ingredient, RegionCode, RegionRuling, Status } from "./types";

/**
 * "What's in this?" for a single scanned product.
 *
 * The rest of the site reads one direction: pick a substance, see where it's
 * used (`ProductEvidencePanel`, `lib/products.ts`). This reads the other
 * direction: pick a real product by its barcode, see which tracked substances
 * its label lists. Same evidentiary footing as `lib/products.ts` applies here
 * unchanged — a match means Open Food Facts' crowd-sourced label data lists
 * the additive, not that today's carton on the shelf still contains it.
 */

export interface FlaggedIngredient {
  ingredient: Ingredient;
  /** The US ruling specifically — this feature is scoped to the US market. */
  ruling: RegionRuling;
}

/** A substance the US permits outright but another regulator has acted on. */
export interface StricterAbroad {
  ingredient: Ingredient;
  /** Regions ruling more strictly than `permitted`, most severe first. */
  regions: { code: Exclude<RegionCode, "US">; status: Status; detail: string }[];
}

export interface ScanResult {
  barcode: string;
  /** False when Open Food Facts has no record for this barcode at all. */
  found: boolean;
  product?: {
    name: string;
    brands: string;
    image?: string;
  };
  /** Tracked additives the US has acted on, most severe first. */
  flagged: FlaggedIngredient[];
  /**
   * Kept apart from `flagged` deliberately. These are lawful in the US with no
   * federal action against them — the divergence is the finding, and folding
   * them into one red list would misstate American law, which is the error this
   * site exists to avoid.
   */
  stricterAbroad: StricterAbroad[];
  error?: string;
}

/** OFF additive tag ("en:e127") -> our ingredient slug ("red-3"). Built once. */
const SLUG_BY_TAG: Record<string, string> = Object.fromEntries(
  Object.entries(OFF_TAG).map(([slug, tag]) => [tag, slug]),
);

interface OffProductResponse {
  status?: number;
  product?: {
    code?: string;
    product_name?: string;
    brands?: string;
    image_front_small_url?: string;
    additives_tags?: string[];
  };
}

function emptyResult(barcode: string, error?: string): ScanResult {
  return { barcode, found: false, flagged: [], stricterAbroad: [], error };
}

export async function fetchProductByBarcode(barcode: string): Promise<ScanResult> {
  // Cheap reject of obviously-invalid input before spending a network call.
  // UPC-E/EAN-8 through GTIN-14 covers every format a phone camera decodes.
  if (!/^\d{8,14}$/.test(barcode)) {
    return emptyResult(barcode, "Not a valid barcode");
  }

  const url =
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?` +
    new URLSearchParams({
      fields: "code,product_name,brands,image_front_small_url,additives_tags",
    });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "food-ban-tracker/1.0 (open-data reference site)" },
      signal: AbortSignal.timeout(12_000),
      // A given barcode's label rarely changes; cache like the rest of the OFF calls.
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return emptyResult(barcode, `Open Food Facts returned ${res.status}`);

    const data = (await res.json()) as OffProductResponse;
    // OFF's own "not found" signal — a valid, empty answer, not an error.
    if (data.status !== 1 || !data.product) return emptyResult(barcode);

    const p = data.product;
    const onLabel = (p.additives_tags ?? [])
      .map((tag) => SLUG_BY_TAG[tag])
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => getIngredient(slug))
      .filter((ing): ing is Ingredient => Boolean(ing));

    const flagged = onLabel
      .map((ingredient): FlaggedIngredient => ({ ingredient, ruling: rulingFor(ingredient, "US") }))
      .filter((f) => f.ruling.status !== "permitted")
      .sort((a, b) => STATUS_SEVERITY[b.ruling.status] - STATUS_SEVERITY[a.ruling.status]);

    // The comparison the site exists to make, applied to one product: lawful
    // here, acted on somewhere else. Same test as `summaryStats().stricterAbroad`.
    const stricterAbroad = onLabel
      .filter((ing) => ing.us.status === "permitted")
      .map((ingredient): StricterAbroad => ({
        ingredient,
        regions: (Object.entries(ingredient.regions) as [Exclude<RegionCode, "US">, RegionRuling][])
          .filter(([, r]) => STATUS_SEVERITY[r.status] >= STATUS_SEVERITY.restricted)
          .map(([code, r]) => ({ code, status: r.status, detail: r.detail }))
          .sort((a, b) => STATUS_SEVERITY[b.status] - STATUS_SEVERITY[a.status]),
      }))
      .filter((s) => s.regions.length > 0)
      .sort((a, b) => STATUS_SEVERITY[b.regions[0].status] - STATUS_SEVERITY[a.regions[0].status]);

    return {
      barcode,
      found: true,
      product: {
        name: (p.product_name ?? "").trim() || "Unnamed product",
        brands: (p.brands ?? "").trim(),
        image: p.image_front_small_url || undefined,
      },
      flagged,
      stricterAbroad,
    };
  } catch (err) {
    return emptyResult(barcode, err instanceof Error ? err.message : "Could not reach Open Food Facts");
  }
}
