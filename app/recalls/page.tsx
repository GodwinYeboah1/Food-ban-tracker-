import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { RecallList } from "@/components/recall-list";
import { CLASS_META, fetchRecalls, type RecallClass } from "@/lib/recalls";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Recalls",
  description:
    "Live US food recalls from the FDA enforcement report feed, filterable by severity class, hazard type and status.",
};

// Recalls post in batches; an hour keeps the page fresh without hammering openFDA.
export const revalidate = 3600;

export default async function RecallsPage() {
  const { recalls, lastUpdated, total, error } = await fetchRecalls(120);

  const TILE_CLASSES: RecallClass[] = ["Class I", "Class II", "Class III"];
  const counts = TILE_CLASSES.map((c) => ({
    cls: c,
    n: recalls.filter((r) => r.classification === c).length,
  }));
  const ongoing = recalls.filter((r) => r.status === "Ongoing").length;

  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Recalls</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          Live from the FDA&apos;s food enforcement reports. A recall is a different kind of record from the rest of
          this site: the database tracks which <em>substances</em> a regulator permits, while a recall is a specific
          batch of a specific product withdrawn for a specific reason. A recall is not evidence that an ingredient is
          banned.
        </p>
      </header>

      {error ? (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Could not reach the FDA recall feed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error}. The feed is openFDA&apos;s and occasionally rate-limits or goes down for maintenance; this page
              will recover on its own.
            </p>
            <a
              href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm underline decoration-border underline-offset-2 hover:text-foreground"
            >
              Check FDA recalls directly
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="tnum text-3xl font-semibold tracking-tight">{ongoing}</div>
              <div className="mt-1.5 text-sm font-medium">Ongoing</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Still being worked through by the recalling firm.
              </p>
            </div>
            {counts.map(({ cls, n }) => (
              <div key={cls} className="rounded-xl border border-border bg-card p-4">
                <div
                  className={`tnum text-3xl font-semibold tracking-tight tone-${CLASS_META[cls].tone}`}
                  style={{ color: "var(--tone)" }}
                >
                  {n}
                </div>
                <div className="mt-1.5 text-sm font-medium">{cls}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{CLASS_META[cls].description}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Showing the {recalls.length} most recent of {total.toLocaleString("en-GB")} enforcement reports.
            {lastUpdated && ` Dataset last refreshed by the FDA on ${formatDate(lastUpdated)}.`}
          </p>

          <div className="mt-6">
            <RecallList recalls={recalls} />
          </div>

          <section className="section-gap rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">About this feed</h2>
            <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
              These are FDA-regulated foods. Meat, poultry and egg <em>products</em> are regulated by the USDA&apos;s
              Food Safety and Inspection Service and are recalled through a separate system, so a beef or deli recall
              may not appear here. Shell eggs, as in the Salmonella recalls, do fall to the FDA and do appear.
            </p>
            <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
              A record enters this feed only once the FDA has classified it, which can lag the firm&apos;s own
              announcement by weeks. For breaking recalls, check the FDA and FSIS pages directly.
            </p>
            <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
              FDA&apos;s enforcement-report viewer has no working link to an individual recall, so each record is
              shown here in full instead, with the openFDA query it came from cited on the page.
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <a
                href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
                target="_blank"
                rel="noreferrer"
                className="text-sm underline decoration-border underline-offset-2 hover:text-foreground"
              >
                FDA recalls &amp; safety alerts
              </a>
              <a
                href="https://www.fsis.usda.gov/recalls"
                target="_blank"
                rel="noreferrer"
                className="text-sm underline decoration-border underline-offset-2 hover:text-foreground"
              >
                USDA FSIS recalls (meat, poultry, eggs)
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
