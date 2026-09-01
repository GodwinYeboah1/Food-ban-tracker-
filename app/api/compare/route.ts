import type { NextRequest } from "next/server";
import { getIngredient, rulingFor } from "@/lib/ingredients";
import { REGIONS } from "@/lib/regions";
import type { RegionCode } from "@/lib/types";
import { apiError, json, parseList } from "@/lib/api";

const REGION_CODES = REGIONS.map((r) => r.code);

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;

  const ids = (p.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) return apiError("Pass at least one slug, e.g. ?ids=red-3,titanium-dioxide", 400);

  const missing = ids.filter((id) => !getIngredient(id));
  if (missing.length) return apiError(`Unknown slugs: ${missing.join(", ")}`, 404);

  const parsed = parseList(p.get("regions"), REGION_CODES);
  if (parsed.invalid.length) {
    return apiError(`Unknown regions: ${parsed.invalid.join(", ")}`, 400, { validRegions: REGION_CODES });
  }
  const regions: RegionCode[] = parsed.values.length ? parsed.values : REGION_CODES;

  return json({
    meta: { ingredients: ids.length, regions },
    data: ids.map((id) => {
      const ing = getIngredient(id)!;
      return {
        slug: ing.slug,
        name: ing.name,
        e_number: ing.eNumber ?? null,
        last_verified: ing.lastVerified,
        regions: Object.fromEntries(
          regions.map((code) => {
            const r = rulingFor(ing, code);
            return [
              code,
              {
                status: r.status,
                detail: r.detail,
                effective_date: r.effectiveDate ?? null,
                compliance_date: r.complianceDate ?? null,
                source_url: r.sources[0]?.url ?? null,
              },
            ];
          }),
        ),
      };
    }),
  });
}
