import { fetchProductByBarcode } from "@/lib/scan";
import { apiError, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;
  const result = await fetchProductByBarcode(barcode);

  // A malformed barcode is the caller's error; an unreachable upstream is not.
  // Everything else — including "no such product" — is a valid 200 answer.
  if (result.error === "Not a valid barcode") {
    return apiError(`"${barcode}" is not a valid barcode`, 400, {
      hint: "Barcodes are 8 to 14 digits (EAN-8 through GTIN-14).",
    });
  }
  if (result.error) return apiError(result.error, 502);

  return json({
    data: {
      barcode: result.barcode,
      found: result.found,
      product: result.product ?? null,
      // Zero means OFF holds no additive data for this label at all — an
      // empty `flagged` then reflects missing evidence, not a clean product.
      additivesOnLabel: result.additivesOnLabel,
      flagged: result.flagged.map((f) => ({
        slug: f.ingredient.slug,
        name: f.ingredient.name,
        eNumber: f.ingredient.eNumber ?? null,
        category: f.ingredient.category,
        status: f.ruling.status,
        detail: f.ruling.detail,
        whyRestricted: f.ingredient.whyRestricted,
        effectiveDate: f.ruling.effectiveDate ?? null,
        sources: f.ruling.sources,
      })),
      // Separate list, never merged into `flagged`: these are lawful in the US.
      stricterAbroad: result.stricterAbroad.map((s) => ({
        slug: s.ingredient.slug,
        name: s.ingredient.name,
        eNumber: s.ingredient.eNumber ?? null,
        usStatus: s.ingredient.us.status,
        regions: s.regions,
      })),
    },
    meta: {
      // The dataset's claims are government-sourced; the label match is not.
      productSource: "Open Food Facts (crowd-sourced label data)",
      rulingSource: "Food Ban Tracker dataset (primary government documents)",
    },
  });
}
