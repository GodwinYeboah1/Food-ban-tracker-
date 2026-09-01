import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { FoodIcon } from "@/components/food-icon";
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_BY_SLUG,
  categorySummary,
  ingredientsInCategory,
} from "@/lib/food-categories";
import { REGIONS } from "@/lib/regions";
import { CATEGORY_META } from "@/lib/regions";

export function generateStaticParams() {
  return FOOD_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = FOOD_CATEGORY_BY_SLUG[category];
  if (!meta) return { title: "Not found" };
  return { title: meta.name, description: meta.description };
}

export default async function FoodCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = FOOD_CATEGORY_BY_SLUG[category];
  if (!meta) notFound();

  const items = ingredientsInCategory(category);
  const { restrictedUS, stricterAbroad } = categorySummary(category);

  return (
    <div className="page-top pb-20">
      <Link
        href="/foods"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All foods
      </Link>

      <header className="mt-6 max-w-2xl">
        <span className="grid size-12 place-items-center rounded-xl bg-accent text-foreground">
          <FoodIcon name={meta.icon} className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{meta.name}</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">{meta.description}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="tnum rounded-full border border-border px-3 py-1 text-muted-foreground">
            {items.length} substances tracked
          </span>
          {restrictedUS > 0 && (
            <span className="tnum rounded-full border border-border px-3 py-1 text-muted-foreground">
              {restrictedUS} restricted or banned in the US
            </span>
          )}
          {stricterAbroad > 0 && (
            <span className="tnum rounded-full border border-border px-3 py-1 text-muted-foreground">
              {stricterAbroad} permitted in the US but banned elsewhere
            </span>
          )}
        </div>
      </header>

      <div className="mt-10 space-y-3">
        {items.map((ing) => {
          const bannedIn = REGIONS.filter(
            (r) => r.code !== "US" && ing.regions[r.code as keyof typeof ing.regions]?.status === "banned",
          );

          return (
            <Link
              key={ing.slug}
              href={`/ingredients/${ing.slug}`}
              className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-medium">{ing.name}</h2>
                {ing.eNumber && <span className="font-mono text-xs text-muted-foreground">{ing.eNumber}</span>}
                <span className="text-xs text-muted-foreground">{CATEGORY_META[ing.category].label}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{ing.summary}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">US</span>
                  <StatusBadge status={ing.us.status} />
                </span>

                {bannedIn.length > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    Banned in{" "}
                    <span className="text-foreground">
                      {bannedIn.map((r) => r.shortName).join(", ")}
                    </span>
                  </span>
                )}

                {ing.states.length > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    State action:
                    {ing.states.map((s) => (
                      <span
                        key={s.code}
                        className="rounded border border-border px-1.5 py-0.5 font-mono text-xs"
                        title={`${s.name} — ${s.bill}`}
                      >
                        {s.code}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Typically in: </span>
                <span className="text-xs">{ing.foundIn.join(" · ")}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
