import type { Metadata } from "next";
import { ArrowUpRight, CircleCheck, CircleOff, ShieldAlert, TriangleAlert } from "lucide-react";
import { verifyAllSources, type CheckStatus } from "@/lib/verify";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Source status",
  description:
    "Every citation on this site, re-checked against its source daily — including whether each Federal Register document is still the document we cite.",
};

// Matches the API route: a real check every six hours, cached in between.
export const revalidate = 21_600;
export const maxDuration = 60;

const META: Record<CheckStatus, { label: string; tone: string; icon: typeof CircleCheck; blurb: string }> = {
  ok: { label: "Verified", tone: "tone-green", icon: CircleCheck, blurb: "Resolves, and the document matches our citation." },
  changed: {
    label: "Changed",
    tone: "tone-red",
    icon: ShieldAlert,
    blurb: "The document behind this number is not the one we cite. Needs a human.",
  },
  unreachable: { label: "Unreachable", tone: "tone-red", icon: TriangleAlert, blurb: "The link no longer resolves." },
  blocked: {
    label: "Not checkable",
    tone: "tone-slate",
    icon: CircleOff,
    blurb: "Serves people but refuses automated checks. Not a failure.",
  },
};

export default async function StatusPage() {
  const report = await verifyAllSources({ concurrency: 8, timeoutMs: 12_000 });
  const problems = report.results.filter((r) => r.status === "changed" || r.status === "unreachable");
  const checked = new Date(report.checkedAt);

  return (
    <div className="page-top pb-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Source status</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          Every status on this site is only as good as the document behind it. So every citation is re-checked against
          its source — not just that the link resolves, but that the document still <em>is</em> what we say it is.
          This page shows the last run, in full, including anything that failed.
        </p>
      </header>

      <section
        className={cn(
          "mt-10 rounded-xl border p-6",
          report.healthy ? "tone-green" : "tone-red",
        )}
        style={{ backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
      >
        <div className="flex items-center gap-2.5" style={{ color: "var(--tone)" }}>
          {report.healthy ? (
            <CircleCheck className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          ) : (
            <ShieldAlert className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          )}
          <h2 className="text-lg font-semibold">
            {report.healthy
              ? "All citations verified"
              : `${problems.length} citation${problems.length === 1 ? "" : "s"} need attention`}
          </h2>
        </div>

        <p className="measure mt-2.5 text-sm leading-relaxed">
          {report.ok} of {report.total} sources resolve and match their published citation.
          {report.blocked > 0 &&
            ` ${report.blocked} could not be checked automatically because the host refuses bots; ${
              report.blocked === 1 ? "it is" : "they are"
            } reachable in a browser.`}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["ok", "changed", "unreachable", "blocked"] as CheckStatus[]).map((s) => (
            <div key={s}>
              <dt className="text-xs text-muted-foreground">{META[s].label}</dt>
              <dd className="tnum mt-0.5 text-2xl font-semibold">
                {s === "ok" ? report.ok : s === "changed" ? report.changed : s === "unreachable" ? report.unreachable : report.blocked}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-xs text-muted-foreground">
          Last run {formatDate(report.checkedAt.slice(0, 10))} at{" "}
          {checked.toISOString().slice(11, 16)} UTC. Re-checked every six hours here, and once a day by a scheduled
          job that fails loudly.
        </p>
      </section>

      {problems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Needs attention</h2>
          <ul className="mt-5 space-y-3">
            {problems.map((r) => (
              <li
                key={r.url}
                className="tone-red rounded-xl border p-5"
                style={{ backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
              >
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--tone)" }}>
                  {META[r.status].label}
                </div>
                <div className="mt-1.5 text-sm font-medium">{r.where}</div>
                <p className="measure mt-1 text-sm text-muted-foreground">{r.label}</p>
                {r.detail && <p className="measure mt-2 text-sm leading-relaxed">{r.detail}</p>}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-start gap-1 text-xs break-all text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
                >
                  {r.url}
                  <ArrowUpRight className="mt-0.5 size-3 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">What is checked</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Does it still resolve?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every source URL is requested and followed through redirects. Agencies restructure their sites often, and
              a link that worked at publication is not guaranteed to work a year later.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Is it still the same document?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The harder check. Every Federal Register citation carries its published reference — &ldquo;90 FR
              4628&rdquo; — which is compared against what the API returns for that document number. A rule can be
              replaced by an unrelated notice while still answering with HTTP 200; only this catches that.
            </p>
          </div>
        </div>

        <p className="measure mt-6 text-sm leading-relaxed text-muted-foreground">
          This check exists because it was needed. Two citations on this site once pointed at the wrong documents — a
          brominated vegetable oil rule that actually resolved to an antidumping notice about raw honey from Brazil.
          Both returned HTTP 200, so nothing flagged them. The identity check now catches that class of error the day
          it appears.
        </p>
      </section>

      <section className="section-gap">
        <h2 className="text-xl font-semibold tracking-tight">Every source</h2>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
          The full list, exactly as checked. {report.total} citations across the dataset.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th scope="col" className="px-4 py-2.5 font-medium">Used for</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Source</th>
                <th scope="col" className="px-4 py-2.5 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r) => {
                const m = META[r.status];
                const Icon = m.icon;
                return (
                  <tr key={r.url} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 align-top">
                      <div className="text-xs">{r.where}</div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs break-all text-muted-foreground underline decoration-border underline-offset-2 sm:hidden"
                      >
                        {r.label}
                      </a>
                    </td>
                    <td className="hidden px-4 py-3 align-top sm:table-cell">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
                      >
                        {r.label}
                      </a>
                      {r.actual && <div className="mt-0.5 font-mono text-xs text-muted-foreground">{r.actual}</div>}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={cn(m.tone, "inline-flex items-center gap-1.5 text-xs whitespace-nowrap")} style={{ color: "var(--tone)" }}>
                        <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        {m.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
