import type { Metadata } from "next";
import { CompareMatrix } from "@/components/compare-matrix";
import { INGREDIENTS } from "@/lib/ingredients";
import { REGIONS } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Compare regions",
  description:
    "Side-by-side status for every tracked substance across the US, EU, UK, Canada, Australia/NZ and Japan.",
};

export default function ComparePage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Compare regions</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          The same substance, six regulators. Rows are ordered by how far apart the selected regulators are, so the
          genuine disagreements sort to the top. Hover any cell for the reasoning behind that status.
        </p>
      </header>

      <div className="mt-8">
        <CompareMatrix ingredients={INGREDIENTS} />
      </div>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">How each regulator works</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          Comparing statuses across these systems is only meaningful if you know how each one is built. The single
          biggest source of confusion in this subject is treating &ldquo;absent from a European list&rdquo; as though it
          were the same act as an American ban.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <div key={r.code} className="rounded-xl border border-border bg-card p-4">
              <div>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.regulator}</div>
              </div>
              <div className="mt-3 inline-flex rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {r.listType === "positive" ? "Positive list" : "Negative list"}
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{r.note}</p>
              <a
                href={r.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
              >
                Official register
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
