import type { NextRequest } from "next/server";
import { queryIngredients, rulingFor } from "@/lib/ingredients";
import { CATEGORY_META, REGIONS, STATUS_META } from "@/lib/regions";
import type { Category, RegionCode, Status } from "@/lib/types";
import { apiError, json, parseList } from "@/lib/api";
import { LAST_REVIEWED } from "@/lib/timeline";

const STATUSES = Object.keys(STATUS_META) as Status[];
const CATEGORIES = Object.keys(CATEGORY_META) as Category[];
const REGION_CODES = REGIONS.map((r) => r.code);

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;

  const region = (p.get("region") ?? "US") as RegionCode;
  if (!REGION_CODES.includes(region)) {
    return apiError(`Unknown region "${region}"`, 400, { validRegions: REGION_CODES });
  }

  const status = parseList(p.get("status"), STATUSES);
  if (status.invalid.length) {
    return apiError(`Unknown status: ${status.invalid.join(", ")}`, 400, { validStatuses: STATUSES });
  }

  const category = parseList(p.get("category"), CATEGORIES);
  if (category.invalid.length) {
    return apiError(`Unknown category: ${category.invalid.join(", ")}`, 400, { validCategories: CATEGORIES });
  }

  const results = queryIngredients({
    search: p.get("search") ?? undefined,
    region,
    status: status.values,
    category: category.values,
    hasStateAction: p.get("hasStateAction") === "true",
  });

  // The list endpoint returns a summary shape; the detail endpoint returns
  // everything. Callers listing 30 substances rarely want every source link.
  return json({
    meta: { count: results.length, region, lastReviewed: LAST_REVIEWED },
    data: results.map((i) => {
      const ruling = rulingFor(i, region);
      return {
        slug: i.slug,
        name: i.name,
        eNumber: i.eNumber ?? null,
        category: i.category,
        aka: i.aka,
        summary: i.summary,
        status: ruling.status,
        effective_date: ruling.effectiveDate ?? null,
        compliance_date: ruling.complianceDate ?? null,
        source_url: ruling.sources[0]?.url ?? null,
        states: i.states.map((s) => ({ code: s.code, bill: s.bill, status: s.status })),
        last_verified: i.lastVerified,
      };
    }),
  });
}
