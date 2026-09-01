import type { NextRequest } from "next/server";
import { verifyAllSources } from "@/lib/verify";

/**
 * Daily source verification, 06:00 UTC.
 *
 * The counterpart to sync-bans: that job looks for *new* rules, this one
 * re-checks the claims already published. Returns 503 when a citation no
 * longer matches its document, so a failed cron run is visible in Vercel's
 * dashboard rather than buried in a log nobody reads.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const report = await verifyAllSources({ concurrency: 8, timeoutMs: 15_000 });
  const failures = report.results.filter((r) => r.status === "changed" || r.status === "unreachable");

  return Response.json(
    {
      ok: report.healthy,
      checkedAt: report.checkedAt,
      total: report.total,
      ok_count: report.ok,
      changed: report.changed,
      unreachable: report.unreachable,
      blocked: report.blocked,
      failures: failures.map((f) => ({ where: f.where, url: f.url, detail: f.detail })),
    },
    { status: report.healthy ? 200 : 503 },
  );
}
