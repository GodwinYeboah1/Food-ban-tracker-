import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Biohazard, CircleDashed, FlaskConical, Nut, Tag, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CLASS_META, fetchRecall, HAZARD_ICON, hazardCategory, splitProductList } from "@/lib/recalls";
import { RelativeTime } from "@/components/relative-time";
import { cn, formatDate } from "@/lib/utils";

// Live data; an hour matches the list page and openFDA's own cadence.
export const revalidate = 3600;

const TONE_CLASS: Record<string, string> = { red: "tone-red", amber: "tone-amber", slate: "tone-slate", blue: "tone-blue" };
const HAZARD_ICONS: Record<string, LucideIcon> = { Biohazard, Nut, Wrench, FlaskConical, Tag, CircleDashed };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recall = await fetchRecall(decodeURIComponent(id));
  if (!recall) return { title: "Recall not found" };
  return {
    title: `${recall.reason} — ${recall.firm}`,
    description: recall.product.slice(0, 180),
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="measure mt-1 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export default async function RecallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recall = await fetchRecall(decodeURIComponent(id));
  if (!recall) notFound();

  const meta = CLASS_META[recall.classification];
  const hazard = hazardCategory(recall.reason);
  const HazardGlyph = HAZARD_ICONS[HAZARD_ICON[hazard] ?? "CircleDashed"] ?? CircleDashed;
  const productList = splitProductList(recall.product);

  return (
    <article className="page-top pb-20">
      <Link href="/recalls" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All recalls
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(TONE_CLASS[meta.tone], "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium")}
            style={{ color: "var(--tone)", backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--tone)" }} aria-hidden />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            <HazardGlyph className="size-3.5" strokeWidth={1.75} aria-hidden />
            {hazard}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs",
              recall.status === "Ongoing" ? "bg-foreground text-background" : "border border-border text-muted-foreground",
            )}
          >
            {recall.status}
          </span>
        </div>

        <h1 className="measure mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{recall.reason}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Recalled by {recall.firm || "an unnamed firm"}
          {recall.reportDate && <> · reported {formatDate(recall.reportDate)}</>}
        </p>
        <p className="measure mt-4 rounded-lg border border-border bg-card p-3.5 text-sm leading-relaxed text-muted-foreground">
          {meta.description}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Affected product</h2>
          <dl className="mt-1">
            <Field label={productList ? `Affected products (${productList.length})` : "Product description"}>
              {productList ? (
                <ul className="space-y-1.5">
                  {productList.map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden className="text-muted-foreground/50">
                        —
                      </span>
                      <span>{item.replace(/^\d{1,2}\.\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                recall.product || "—"
              )}
            </Field>
            {recall.codeInfo && (
              <Field label="Lot codes, UPCs and date codes">
                <span className="font-mono text-xs leading-relaxed">{recall.codeInfo}</span>
              </Field>
            )}
            {recall.quantity && <Field label="Quantity recalled">{recall.quantity}</Field>}
            <Field label="Distribution">{recall.distribution || "—"}</Field>
          </dl>

          <h2 className="section-gap text-sm font-medium tracking-wide text-muted-foreground uppercase">
            The recall
          </h2>
          <dl className="mt-1">
            <Field label="Recalling firm">
              {recall.firm || "—"}
              {recall.state && <span className="text-muted-foreground"> · {recall.state}</span>}
            </Field>
            <Field label="Initiated by">{recall.voluntary || "—"}</Field>
            {recall.initiationDate && (
              <Field label="Recall initiated">
                {formatDate(recall.initiationDate)}
                <RelativeTime date={recall.initiationDate} className="ml-1.5 text-muted-foreground" />
              </Field>
            )}
            {recall.reportDate && <Field label="Published in the enforcement report">{formatDate(recall.reportDate)}</Field>}
          </dl>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Recall number</h2>
            <p className="mt-1.5 font-mono text-sm">{recall.id || "Not assigned"}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {recall.id
                ? "Search this number on FDA's enforcement report to see the agency's own record."
                : "openFDA published this record without a recall number, so it is identified here by its event id."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Verify this</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              <a
                href={recall.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-start gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
              >
                openFDA record for this recall (JSON)
                <ArrowUpRight className="mt-0.5 size-3 shrink-0" />
              </a>
              <a
                href="https://www.accessdata.fda.gov/scripts/ires/index.cfm"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-start gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
              >
                FDA enforcement report search
                <ArrowUpRight className="mt-0.5 size-3 shrink-0" />
              </a>
              <a
                href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-start gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
              >
                FDA recalls &amp; safety alerts
                <ArrowUpRight className="mt-0.5 size-3 shrink-0" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
