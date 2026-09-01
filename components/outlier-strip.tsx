import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusDot } from "./status-badge";
import { REGIONS } from "@/lib/regions";
import { rulingFor } from "@/lib/ingredients";
import type { Ingredient, RegionCode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The site's thesis, drawn rather than asserted.
 *
 * Six regulators across the top, the substances where they most disagree down
 * the side. The argument is carried by the shape of the grid: read the US
 * column against the other five and the pattern is visible before a single
 * label is read. Static data, so it server-renders into the hero with no
 * loading state.
 */
export function OutlierStrip({ ingredients }: { ingredients: Ingredient[] }) {
  if (ingredients.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <table className="w-full border-collapse">
        <caption className="mb-4 caption-top text-left">
          <span className="text-sm font-medium">Permitted here, banned there</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            The same substance, six regulators. Read the US column against the rest.
          </span>
        </caption>
        <thead>
          <tr>
            <th className="w-px" />
            {REGIONS.map((r) => (
              <th
                key={r.code}
                scope="col"
                className={cn(
                  "px-1 pb-2 text-center text-xs font-medium",
                  r.code === "US" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {r.shortName === "AU/NZ" ? "AU" : r.shortName === "Canada" ? "CA" : r.shortName === "Japan" ? "JP" : r.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.slug} className="group">
              <th scope="row" className="py-1.5 pr-3 text-left text-xs font-normal whitespace-nowrap">
                <Link href={`/ingredients/${ing.slug}`} className="text-muted-foreground hover:text-foreground">
                  {ing.name.length > 22 ? `${ing.name.slice(0, 21)}…` : ing.name}
                </Link>
              </th>
              {REGIONS.map((r) => (
                <td
                  key={r.code}
                  className={cn("px-1 py-1.5 text-center", r.code === "US" && "bg-accent/60")}
                  title={`${r.name}: ${rulingFor(ing, r.code as RegionCode).status}`}
                >
                  <StatusDot status={rulingFor(ing, r.code as RegionCode).status} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        href="/compare"
        className="mt-4 inline-flex min-h-8 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Compare all {REGIONS.length} regulators <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
