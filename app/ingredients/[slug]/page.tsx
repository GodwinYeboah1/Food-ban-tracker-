import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { INGREDIENTS, getIngredient } from "@/lib/ingredients";
import { CATEGORY_META, REGIONS, REGION_BY_CODE } from "@/lib/regions";
import { categoriesForIngredient } from "@/lib/food-categories";
import { FoodIcon } from "@/components/food-icon";
import { TIMELINE } from "@/lib/timeline";
import type { RegionRuling, Source } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RelativeTime } from "@/components/relative-time";
import { ShelfPanel } from "@/components/shelf-panel";
import { ProductEvidencePanel } from "@/components/product-evidence";
import { fetchProductEvidence } from "@/lib/products";

export function generateStaticParams() {
  return INGREDIENTS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ing = getIngredient(slug);
  if (!ing) return { title: "Not found" };
  return {
    title: ing.name,
    description: ing.summary,
  };
}

function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-start gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
        >
          <span>{s.label}</span>
          <ArrowUpRight className="mt-0.5 size-3 shrink-0" />
        </a>
      ))}
    </div>
  );
}

function DateRow({ ruling }: { ruling: RegionRuling }) {
  if (!ruling.effectiveDate && !ruling.complianceDate) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-xs">
      {ruling.effectiveDate && (
        <div>
          <dt className="text-muted-foreground">Effective</dt>
          <dd className="tnum mt-0.5 font-medium">{formatDate(ruling.effectiveDate)}</dd>
        </div>
      )}
      {ruling.complianceDate && (
        <div>
          <dt className="text-muted-foreground">Compliance deadline</dt>
          <dd className="tnum mt-0.5 font-medium">
            {formatDate(ruling.complianceDate)}
            <RelativeTime date={ruling.complianceDate} className="ml-1.5 font-normal text-muted-foreground" />
          </dd>
        </div>
      )}
    </dl>
  );
}

export default async function IngredientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ing = getIngredient(slug);
  if (!ing) notFound();

  const history = TIMELINE.filter((e) => e.ingredients.includes(ing.slug));
  const foodCategories = categoriesForIngredient(ing.slug);
  const evidence = await fetchProductEvidence(ing.slug);

  return (
    <article className="page-top pb-20">
      <Link
        href="/database"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Database
      </Link>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-2.5 py-0.5">{CATEGORY_META[ing.category].label}</span>
          {ing.eNumber && <span className="font-mono">{ing.eNumber}</span>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{ing.name}</h1>
        <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">Also known as {ing.aka.join(", ")}.</p>
        <p className="measure mt-5 text-lg leading-relaxed text-pretty">{ing.summary}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-10">
          <ShelfPanel ingredient={ing} />

          <section>
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Why regulators have acted
            </h2>
            <p className="measure mt-3 leading-relaxed text-pretty">{ing.whyRestricted}</p>
          </section>

          <section>
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              United States — federal
            </h2>
            <div className="mt-3 rounded-xl border border-border bg-card p-5">
              <StatusBadge status={ing.us.status} size="md" />
              <p className="measure mt-3 leading-relaxed">{ing.us.detail}</p>
              <DateRow ruling={ing.us} />
              <SourceLinks sources={ing.us.sources} />
            </div>
          </section>

          {ing.states.length > 0 && (
            <section>
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                United States — states
              </h2>
              <p className="measure mt-2 text-sm leading-relaxed text-muted-foreground">
                Federal law does not pre-empt these. A substance can be lawful nationally and prohibited in a
                particular state.
              </p>
              <div className="mt-3 space-y-3">
                {ing.states.map((st) => (
                  <div key={`${st.code}-${st.bill}`} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-medium">{st.name}</span>
                      <span className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {st.bill}
                      </span>
                      <StatusBadge status={st.status} />
                    </div>
                    <p className="measure mt-3 text-sm leading-relaxed">{st.detail}</p>
                    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-xs">
                      {st.effectiveDate && (
                        <div>
                          <dt className="text-muted-foreground">Effective</dt>
                          <dd className="tnum mt-0.5 font-medium">{formatDate(st.effectiveDate)}</dd>
                        </div>
                      )}
                      {st.schoolsEffectiveDate && (
                        <div>
                          <dt className="text-muted-foreground">In schools</dt>
                          <dd className="tnum mt-0.5 font-medium">{formatDate(st.schoolsEffectiveDate)}</dd>
                        </div>
                      )}
                    </dl>
                    <SourceLinks sources={st.sources} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Elsewhere</h2>
            <div className="mt-3 space-y-3">
              {REGIONS.filter((r) => r.code !== "US").map((r) => {
                const ruling = ing.regions[r.code as keyof typeof ing.regions];
                return (
                  <div key={r.code} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.regulator}</span>
                      <StatusBadge status={ruling.status} />
                    </div>
                    <p className="measure mt-3 text-sm leading-relaxed">{ruling.detail}</p>
                    <DateRow ruling={ruling} />
                    <SourceLinks sources={ruling.sources} />
                  </div>
                );
              })}
            </div>
          </section>

          {evidence && <ProductEvidencePanel evidence={evidence} name={ing.name} />}

          {history.length > 0 && (
            <section>
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">History</h2>
              <ol className="mt-3 space-y-3">
                {history.map((e) => (
                  <li key={e.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={e.date} className="tnum font-medium text-foreground">
                        {formatDate(e.date)}
                      </time>
                      <span aria-hidden>·</span>
                      <span>
                        {e.state
                          ? `${e.state}, ${REGION_BY_CODE[e.region].shortName}`
                          : REGION_BY_CODE[e.region].shortName}
                      </span>
                    </div>
                    <div className="mt-1.5 text-sm font-medium">{e.title}</div>
                    <p className="measure mt-1 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Status at a glance</h2>
            <ul className="mt-4 space-y-2.5">
              {REGIONS.map((r) => {
                const ruling = r.code === "US" ? ing.us : ing.regions[r.code as keyof typeof ing.regions];
                return (
                  <li key={r.code} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{r.shortName}</span>
                    <StatusBadge status={ruling.status} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Typically found in</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {ing.foundIn.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground/50">
                    —
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {foodCategories.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">See everything else in these aisles</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {foodCategories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/foods/${c.slug}`}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-foreground/30 hover:bg-accent"
                    >
                      <FoodIcon name={c.icon} className="size-3.5" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Last verified</div>
            <p className="tnum mt-1">{formatDate(ing.lastVerified)}</p>
            <p className="mt-3 leading-relaxed">
              Rules on this subject change quickly. Follow the source links above before relying on any status here.
            </p>
            <a
              href={`/api/ingredients/${ing.slug}`}
              className="mt-3 inline-flex items-center gap-1 font-mono underline decoration-border underline-offset-2 hover:text-foreground"
            >
              View as JSON <ArrowUpRight className="size-3" />
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
