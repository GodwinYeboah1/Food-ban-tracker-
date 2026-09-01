import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FoodIcon } from "@/components/food-icon";
import { FOOD_CATEGORIES, categorySummary, ingredientsInCategory } from "@/lib/food-categories";

export const metadata: Metadata = {
  title: "Browse by food",
  description:
    "Start from the food rather than the chemical: which tracked additives turn up in bread, sweets, soft drinks, meat and the rest.",
};

export default function FoodsPage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Browse by food</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          The database is organised by substance. This page runs the other way — pick a food you actually buy and see
          what is in it, what US regulators have done about each one, and where other countries drew a different line.
        </p>
      </header>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FOOD_CATEGORIES.map((cat) => {
          const { total, restrictedUS, stricterAbroad } = categorySummary(cat.slug);
          const examples = ingredientsInCategory(cat.slug).slice(0, 3);

          return (
            <Link
              key={cat.slug}
              href={`/foods/${cat.slug}`}
              /* min-w-0 is load-bearing: the truncated examples line below sets a
                 nowrap min-content width that would otherwise force the grid
                 item wider than the viewport. */
              className="group flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25 hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-accent text-foreground">
                  <FoodIcon name={cat.icon} />
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <h2 className="mt-4 font-medium">{cat.name}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                <span className="tnum rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                  {total} tracked
                </span>
                {restrictedUS > 0 && (
                  <span
                    className="tnum tone-amber rounded-full border px-2 py-0.5"
                    style={{
                      color: "var(--tone)",
                      backgroundColor: "var(--tone-bg)",
                      borderColor: "var(--tone-border)",
                    }}
                  >
                    {restrictedUS} restricted in US
                  </span>
                )}
                {stricterAbroad > 0 && (
                  <span
                    className="tnum tone-blue rounded-full border px-2 py-0.5"
                    style={{
                      color: "var(--tone)",
                      backgroundColor: "var(--tone-bg)",
                      borderColor: "var(--tone-border)",
                    }}
                  >
                    {stricterAbroad} stricter abroad
                  </span>
                )}
              </div>

              <p className="mt-3 truncate text-xs text-muted-foreground">
                {examples.map((e) => e.name).join(" · ")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
