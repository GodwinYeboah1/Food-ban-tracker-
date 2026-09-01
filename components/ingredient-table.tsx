"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { CATEGORY_META, REGIONS, STATUS_META, STATUS_SEVERITY } from "@/lib/regions";
import type { Category, Ingredient, RegionCode, Status } from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";

const STATUSES = Object.keys(STATUS_META) as Status[];
const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

function rulingFor(ing: Ingredient, region: RegionCode) {
  return region === "US" ? ing.us : ing.regions[region];
}

export function IngredientTable({ ingredients }: { ingredients: Ingredient[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<RegionCode>("US");
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, value: T) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return ingredients
      .filter((ing) => {
        if (needle) {
          const hay = [ing.name, ing.eNumber ?? "", ...ing.aka, ing.summary, ...ing.foundIn].join(" ").toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        if (statuses.length && !statuses.includes(rulingFor(ing, region).status)) return false;
        if (categories.length && !categories.includes(ing.category)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          STATUS_SEVERITY[rulingFor(b, region).status] - STATUS_SEVERITY[rulingFor(a, region).status] ||
          a.name.localeCompare(b.name),
      );
  }, [ingredients, search, region, statuses, categories]);

  const activeFilters = statuses.length + categories.length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, E number, or the foods it appears in…"
            className="h-11 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="region-select">
            Show status for region
          </label>
          <select
            id="region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionCode)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                Status in {r.shortName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm transition-colors",
              filtersOpen || activeFilters ? "bg-accent text-foreground" : "bg-card text-muted-foreground",
            )}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilters > 0 && (
              <span className="tnum grid size-5 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-3 grid gap-5 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          <fieldset>
            <legend className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(statuses, setStatuses, s)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-xs transition-colors sm:min-h-8",
                    statuses.includes(s)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Category</legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(categories, setCategories, c)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-xs transition-colors sm:min-h-8",
                    categories.includes(c)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {CATEGORY_META[c].label}
                </button>
              ))}
            </div>
          </fieldset>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatuses([]);
                setCategories([]);
              }}
              className="flex items-center gap-1.5 justify-self-start text-xs text-muted-foreground hover:text-foreground sm:col-span-2"
            >
              <X className="size-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground" role="status" aria-live="polite">
        {rows.length} of {ingredients.length} substances
        {region !== "US" && ` · showing ${REGIONS.find((r) => r.code === region)?.name} status`}
      </p>

      {/* Desktop: a real table. Small screens: stacked cards, because a
          six-column table cannot be made legible at 375px. */}
      <div className="mt-3 hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th scope="col" className="px-4 py-2.5 font-medium">Substance</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Category</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Key date</th>
              <th scope="col" className="px-4 py-2.5 font-medium">States</th>
              <th scope="col" className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((ing) => {
              const ruling = rulingFor(ing, region);
              const date = ruling.complianceDate ?? ruling.effectiveDate;
              return (
                <tr key={ing.slug} className="group border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link href={`/ingredients/${ing.slug}`} className="font-medium hover:underline">
                      {ing.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {ing.eNumber ? `${ing.eNumber} · ` : ""}
                      {ing.aka[0]}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{CATEGORY_META[ing.category].label}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ruling.status} />
                  </td>
                  <td className="tnum px-4 py-3 text-xs text-muted-foreground">
                    {date ? formatShortDate(date) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {ing.states.length ? (
                      <div className="flex flex-wrap gap-1">
                        {ing.states.map((s) => (
                          <span
                            key={s.code}
                            className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                            title={`${s.name} — ${s.bill}`}
                          >
                            {s.code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2">
                    <Link href={`/ingredients/${ing.slug}`} aria-label={`Open ${ing.name}`}>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-2 md:hidden">
        {rows.map((ing) => {
          const ruling = rulingFor(ing, region);
          const date = ruling.complianceDate ?? ruling.effectiveDate;
          return (
            <Link
              key={ing.slug}
              href={`/ingredients/${ing.slug}`}
              className="block rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{ing.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {ing.eNumber ? `${ing.eNumber} · ` : ""}
                    {CATEGORY_META[ing.category].label}
                  </div>
                </div>
                <StatusBadge status={ruling.status} />
              </div>
              {date && (
                <div className="tnum mt-3 text-xs text-muted-foreground">Key date {formatShortDate(date)}</div>
              )}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-medium">No substances match those filters</p>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing a filter or searching a different term.</p>
        </div>
      )}
    </div>
  );
}
