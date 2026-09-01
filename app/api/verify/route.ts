import { verifyAllSources } from "@/lib/verify";
import { json } from "@/lib/api";

// Checking ~34 external documents takes time; six hours between real runs is
// plenty for records that change on a scale of weeks, and ISR serves the
// cached report instantly in between.
export const revalidate = 21_600;
export const maxDuration = 60;

export async function GET() {
  const report = await verifyAllSources({ concurrency: 8, timeoutMs: 12_000 });
  return json(report, { status: report.healthy ? 200 : 503 });
}
