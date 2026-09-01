import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { TimelineFeed } from "@/components/timeline-feed";
import { StatusBadge } from "@/components/status-badge";
import { OutlierStrip } from "@/components/outlier-strip";
import { INGREDIENTS, summaryStats, stateActivity, getIngredient } from "@/lib/ingredients";
import { TIMELINE } from "@/lib/timeline";
import { formatShortDate } from "@/lib/utils";

export default function HomePage() {
  const stats = summaryStats();
  const states = stateActivity();

  // Substances the US permits freely that at least one peer regulator bans.
  const divergent = stats.stricterAbroadSlugs
    .map((slug) => getIngredient(slug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  // The hero strip wants enough rows for the pattern to read; the cards
  // further down stay at four.
  const divergentCards = divergent.slice(0, 4);

  const upcoming = INGREDIENTS.flatMap((ing) => {
    const dates = [
      ing.us.complianceDate ?? ing.us.effectiveDate,
      ...ing.states.map((s) => s.effectiveDate),
    ].filter((d): d is string => Boolean(d));
    return dates
      .filter((d) => new Date(`${d}T00:00:00Z`).getTime() > Date.now())
      .map((date) => ({ date, name: ing.name, slug: ing.slug }));
  })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <>
      <section className="page-top grid gap-10 pb-12 sm:pb-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14">
        <div>
          <Link
            href="/status"
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Every citation re-checked daily
          </Link>

          <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            What the US bans, and what everyone else does instead.
          </h1>
          <p className="measure mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
            {stats.tracked} food additives and practices, tracked through federal rulemaking and state legislation, set
            against the same substance&apos;s status in the EU, UK, Canada, Australia&nbsp;&amp;&nbsp;NZ and Japan.
            Every status links to the government document it came from.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/database"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse the database <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/still-selling"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Still on shelves
            </Link>
            <Link
              href="/foods"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Browse by food
            </Link>
          </div>
        </div>

        <OutlierStrip ingredients={divergent} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          value={stats.bannedFederally}
          label="Banned federally"
          detail="Authorisation revoked or the substance prohibited outright by the FDA."
          href="/database"
          tone="red"
        />
        <StatCard
          value={stats.phasingOut}
          label="Phasing out"
          detail="Revoked, but still lawful to sell until a compliance date passes."
          href="/still-selling"
          tone="amber"
        />
        <StatCard
          value={stats.activeStates}
          label="States acting"
          detail={`${stats.withStateAction} substances now carry a state ban or labelling rule.`}
          href="/database"
          tone="blue"
        />
        <StatCard
          value={stats.stricterAbroad}
          label="Stricter abroad"
          detail="Permitted freely in the US, but banned by at least one peer regulator."
          href="/compare"
        />
      </section>

      <section className="section-gap grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">What&apos;s new</h2>
            <Link
              href="/changes"
              className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:min-h-0"
            >
              All changes <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
            Every dated change to the legal record, newest first. Verified against the primary document before it
            appears here.
          </p>
          <div className="mt-7">
            <TimelineFeed events={TIMELINE} limit={4} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Deadlines ahead</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Dates industry must comply by, federal and state.
            </p>
            <ul className="mt-4 space-y-2.5">
              {upcoming.map((item) => (
                <li key={`${item.slug}-${item.date}`} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link href={`/ingredients/${item.slug}`} className="truncate hover:underline">
                    {item.name}
                  </Link>
                  <time dateTime={item.date} className="tnum shrink-0 text-xs text-muted-foreground">
                    {formatShortDate(item.date)}
                  </time>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">State activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Federal law does not pre-empt these, so a substance can be legal nationally and banned locally.
            </p>
            <ul className="mt-4 space-y-3">
              {states.map((s) => (
                <li key={s.code} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {s.bills.join(" · ")}
                    </div>
                  </div>
                  <span className="tnum shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {s.ingredients.length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Where the US is the outlier</h2>
            <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
              Substances permitted without restriction in the United States that at least one of the EU, UK, Canada,
              Australia&nbsp;&amp;&nbsp;NZ or Japan has banned outright.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:min-h-0"
          >
            Full comparison <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-7 grid border-t border-border sm:grid-cols-2">
          {divergentCards.map((ing) => {
            const banners = Object.entries(ing.regions).filter(([, r]) => r.status === "banned");
            return (
              <Link
                key={ing.slug}
                href={`/ingredients/${ing.slug}`}
                className="group border-b border-border py-5 transition-colors sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{ing.name}</div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="measure-ui mt-2 text-sm leading-relaxed text-muted-foreground">{ing.summary}</p>
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">US</span>
                  <StatusBadge status={ing.us.status} />
                  <span className="text-xs text-muted-foreground">· banned in {banners.length}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
