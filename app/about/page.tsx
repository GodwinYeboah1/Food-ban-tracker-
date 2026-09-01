import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INGREDIENTS } from "@/lib/ingredients";
import { REGIONS, STATUS_META } from "@/lib/regions";
import { LAST_REVIEWED } from "@/lib/timeline";
import type { Status } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = {
  title: "Sources & method",
  description: "Where every data point comes from, how statuses are decided, and what this tracker does not cover.",
};

const PIPELINE_SOURCES = [
  {
    name: "Federal Register",
    role: "US federal rulemaking",
    detail:
      "The legal record itself. A revocation of a food or colour additive authorisation appears here first, as a RULE from the FDA. Queried daily, free and keyless.",
    url: "https://www.federalregister.gov/developers/documentation/api/v1",
  },
  {
    name: "openFDA Food Enforcement",
    role: "Recalls",
    detail:
      "Recall and enforcement reports. A signal of recent activity rather than evidence of a ban, so items from this source are never promoted to the timeline on their own.",
    url: "https://open.fda.gov/apis/food/enforcement/",
  },
];

export default function AboutPage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sources &amp; method</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          This subject is contested and moves quickly, and a great deal of what circulates about it is wrong in
          predictable ways. So here is exactly where each number comes from, and where the limits are.
        </p>
      </header>

      <section className="section-gap max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">The one distinction that matters most</h2>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          The United States runs a largely <strong className="font-medium text-foreground">negative list</strong>: an
          additive is lawful until the FDA affirmatively revokes its authorisation, and a manufacturer can in some
          cases self-affirm a substance as generally recognised as safe without a pre-market FDA review. The EU, UK,
          Canada, Australia&nbsp;&amp;&nbsp;NZ and Japan run{" "}
          <strong className="font-medium text-foreground">positive lists</strong>: only what is explicitly listed may
          be used.
        </p>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          This means a substance can be absent from a European list without any regulator having examined it, let alone
          banned it. Counting those absences as &ldquo;banned in Europe&rdquo; is the single most common error in
          popular coverage, and it inflates the headline numbers considerably. This tracker keeps{" "}
          <em>banned</em> and <em>not authorised</em> apart everywhere, including in the API.
        </p>
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">Status vocabulary</h2>
        <div className="mt-5 space-y-3">
          {(Object.keys(STATUS_META) as Status[]).map((s) => (
            <div key={s} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:gap-4">
              <div className="sm:w-36 sm:shrink-0">
                <StatusBadge status={s} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{STATUS_META[s].description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">Primary registers</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          Every status traces to one of these. No aggregator, campaign site or news article is used as a source of
          truth — where reporting and the underlying document disagree, the document wins.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <a
              key={r.code}
              href={r.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium">{r.name}</span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{r.regulator}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.note}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">How updates work</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PIPELINE_SOURCES.map((s) => (
            <div key={s.name} className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.role}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-block text-xs underline decoration-border underline-offset-2 hover:text-foreground"
              >
                API documentation
              </a>
            </div>
          ))}
        </div>
        <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
          A scheduled job runs once a day and files candidate documents into a review queue. Nothing is auto-published:
          neither source emits a clean &ldquo;this substance is now banned&rdquo; record, and machine-reading legal
          prose into a status is exactly the step where errors would enter. A person confirms what each document did
          before it reaches the site.
        </p>
      </section>

      <section className="section-gap max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">What this does not cover</h2>
        <ul className="measure mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-3">
            <span aria-hidden className="text-muted-foreground/50">—</span>
            <span>
              <strong className="font-medium text-foreground">Comprehensive state bill tracking.</strong> The three
              states with enacted additive laws are covered. Bills introduced but not passed — of which there are many
              in any given session — are not, because tracking them properly needs a legislative data feed behind a
              signup.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-muted-foreground/50">—</span>
            <span>
              <strong className="font-medium text-foreground">Contaminants and pesticide residues.</strong> Heavy
              metals, mycotoxins and pesticide tolerances are governed by separate regimes with their own limits, and
              folding them into an additive schema would misrepresent both.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-muted-foreground/50">—</span>
            <span>
              <strong className="font-medium text-foreground">Exhaustive coverage.</strong> {INGREDIENTS.length}{" "}
              substances are tracked, chosen because a regulator has acted on them or because regulators visibly
              disagree. Thousands of additives are permitted everywhere without controversy and are not listed.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="text-muted-foreground/50">—</span>
            <span>
              <strong className="font-medium text-foreground">Health advice.</strong> Statuses describe what
              regulators have decided and why they said they decided it. That a substance is permitted is not a claim
              that it is safe, and that one is banned is not a claim that it harmed anyone.
            </span>
          </li>
        </ul>
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">How the sources stay honest</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          Linking to a primary source is a promise, and a promise nobody re-checks decays quietly. Every citation on
          this site is therefore verified on a schedule: that the link still resolves, and — for Federal Register
          documents — that the published citation still matches the document at that number. A rule can be replaced by
          an unrelated notice while still returning HTTP 200, and only the second check catches it.
        </p>
        <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
          The results are public, including failures, on the{" "}
          <Link href="/status" className="underline decoration-border underline-offset-2 hover:text-foreground">
            source status page
          </Link>
          . If a check is failing, you will see it there before you see a corrected page here.
        </p>
      </section>

      <section className="section-gap rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Corrections</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          The dataset was last checked against primary sources on {formatDate(LAST_REVIEWED)}. If a status here
          conflicts with the government document it links to, the document is right and this is wrong — please report
          it.
        </p>
      </section>
    </div>
  );
}
