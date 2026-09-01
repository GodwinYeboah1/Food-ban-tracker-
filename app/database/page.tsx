import type { Metadata } from "next";
import { IngredientTable } from "@/components/ingredient-table";
import { INGREDIENTS } from "@/lib/ingredients";

export const metadata: Metadata = {
  title: "Database",
  description:
    "Every food additive and practice tracked, searchable and filterable by status, category and region.",
};

export default function DatabasePage() {
  return (
    <div className="page-top pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Database</h1>
        <p className="measure mt-3 leading-relaxed text-muted-foreground">
          Every substance tracked, with its US federal status by default. Switch the region selector to see how the same
          substance is treated elsewhere — the ordering changes with it, strictest first.
        </p>
      </header>

      <div className="mt-8">
        <IngredientTable ingredients={INGREDIENTS} />
      </div>
    </div>
  );
}
