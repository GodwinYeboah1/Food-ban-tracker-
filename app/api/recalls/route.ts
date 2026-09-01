import type { NextRequest } from "next/server";
import { fetchRecalls, hazardCategory } from "@/lib/recalls";
import { json } from "@/lib/api";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const raw = Number(p.get("limit") ?? 50);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 200) : 50;

  const feed = await fetchRecalls(Math.max(limit, 120));
  if (feed.error) return json({ error: feed.error, data: [] }, { status: 502 });

  const cls = p.get("classification");
  const ongoing = p.get("ongoing") === "true";

  const data = feed.recalls
    .filter((r) => (cls ? r.classification === cls : true))
    .filter((r) => (ongoing ? r.status === "Ongoing" : true))
    .slice(0, limit)
    .map((r) => ({
      recall_number: r.id,
      product: r.product,
      reason: r.reason,
      hazard: hazardCategory(r.reason),
      firm: r.firm,
      classification: r.classification,
      status: r.status,
      report_date: r.reportDate,
      initiation_date: r.initiationDate,
      distribution: r.distribution,
      quantity: r.quantity,
      source_url: r.sourceUrl,
    }));

  return json({
    meta: {
      count: data.length,
      total: feed.total,
      last_updated: feed.lastUpdated,
      source: "openFDA Food Enforcement",
      note: "FDA-regulated foods only. Meat, poultry and egg products are recalled separately by USDA FSIS.",
    },
    data,
  });
}
