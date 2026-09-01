import type { NextRequest } from "next/server";
import { TIMELINE } from "@/lib/timeline";
import { json } from "@/lib/api";

export async function GET(request: NextRequest) {
  const raw = Number(request.nextUrl.searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 100) : 20;

  return json({
    meta: { count: Math.min(limit, TIMELINE.length), total: TIMELINE.length },
    data: TIMELINE.slice(0, limit).map((e) => ({
      id: e.id,
      date: e.date,
      region: e.region,
      state: e.state ?? null,
      title: e.title,
      detail: e.detail,
      status: e.status,
      ingredients: e.ingredients,
      source_url: e.sources[0]?.url ?? null,
      sources: e.sources,
    })),
  });
}
