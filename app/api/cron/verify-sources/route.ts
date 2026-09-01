import type { NextRequest } from "next/server";
import { verifyAllSources } from "@/lib/verify";

/**
 * Scheduled source verification — twice a day, morning and evening.
 *
 * The counterpart to sync-bans: that job looks for *new* rules, this one
 * re-checks the claims already published. Running it twice halves the window
 * in which a citation can be silently wrong on the live site.
 *
 * Vercel's Hobby plan allows many cron jobs but only one run per day each, so
 * a `0 11,23 * * *` expression is rejected at deploy time. Two entries with
 * distinct query strings are two separate daily jobs, which is allowed — see
 * vercel.json. The `run` label exists only to make the two distinguishable in
 * logs and to satisfy that path-uniqueness requirement.
 *
 * Returns 503 when a citation no longer matches its document, so a failure is
 * visible in Vercel's dashboard rather than buried in a log nobody reads.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const run = request.nextUrl.searchParams.get("run") ?? "manual";
  const report = await verifyAllSources({ concurrency: 8, timeoutMs: 15_000 });
  const failures = report.results.filter((r) => r.status === "changed" || r.status === "unreachable");

  return Response.json(
    {
      ok: report.healthy,
      run,
      checkedAt: report.checkedAt,
      total: report.total,
      verified: report.ok,
      changed: report.changed,
      unreachable: report.unreachable,
      blocked: report.blocked,
      failures: failures.map((f) => ({ where: f.where, label: f.label, url: f.url, detail: f.detail })),
    },
    { status: report.healthy ? 200 : 503 },
  );
}
