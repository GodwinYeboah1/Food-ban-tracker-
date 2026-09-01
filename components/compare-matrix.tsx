"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { StatusBadge, StatusDot } from "./status-badge";
import { REGIONS, STATUS_META, STATUS_SEVERITY } from "@/lib/regions";
import type { Ingredient, RegionCode, Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  red: "tone-red",
  amber: "tone-amber",
  blue: "tone-blue",
  green: "tone-green",
  slate: "tone-slate",
};

function rulingFor(ing: Ingredient, region: RegionCode) {
  return region === "US" ? ing.us : ing.regions[region];
}

interface Tip {
  text: string;
  /** Viewport coordinates of the cell that opened it. */
  x: number;
  y: number;
  above: boolean;
}

/** One matrix cell. Colour carries the status; the label repeats it, so the
 *  grid never depends on hue alone. */
function Cell({
  ing,
  region,
  onShow,
  onHide,
}: {
  ing: Ingredient;
  region: RegionCode;
  onShow: (text: string, el: HTMLElement) => void;
  onHide: () => void;
}) {
  const ruling = rulingFor(ing, region);
  const meta = STATUS_META[ruling.status];
  return (
    <td className="p-1">
      <div
        className={cn(TONE_CLASS[meta.tone], "rounded-lg border px-2 py-2 text-center")}
        style={{ backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
        onMouseEnter={(e) => onShow(ruling.detail, e.currentTarget)}
        onMouseLeave={onHide}
      >
        <span
          className="flex items-center justify-center gap-1 text-xs leading-tight font-medium"
          style={{ color: "var(--tone)" }}
        >
          <StatusDot status={ruling.status} className="hidden lg:inline-flex" />
          {meta.label}
        </span>
      </div>
    </td>
  );
}

export function CompareMatrix({ ingredients }: { ingredients: Ingredient[] }) {
  const [regions, setRegions] = useState<RegionCode[]>(["US", "EU", "UK", "CA"]);
  const [tip, setTip] = useState<Tip | null>(null);
  const [search, setSearch] = useState("");
  const [onlyDivergent, setOnlyDivergent] = useState(false);

  /**
   * The table scrolls horizontally, so a tooltip positioned inside a cell is
   * clipped by that container and can also fall behind the sticky first
   * column. One shared `position: fixed` layer sidesteps both: it is a child
   * of the page, not of the scroll box.
   */
  const showTip = useCallback((text: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const TIP_W = 256;
    const above = r.top > 160; // Flip below when there is no room above.
    setTip({
      // Clamp so a tooltip on an edge column stays fully on screen.
      x: Math.min(Math.max(r.left + r.width / 2, TIP_W / 2 + 8), window.innerWidth - TIP_W / 2 - 8),
      y: above ? r.top - 8 : r.bottom + 8,
      above,
      text,
    });
  }, []);

  const hideTip = useCallback(() => setTip(null), []);

  const toggleRegion = (code: RegionCode) =>
    setRegions((prev) =>
      prev.includes(code)
        ? // Never let the user empty the grid entirely.
          prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code],
    );

  const ordered = useMemo(() => REGIONS.filter((r) => regions.includes(r.code)), [regions]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return ingredients
      .filter((ing) => {
        if (needle) {
          const hay = [ing.name, ing.eNumber ?? "", ...ing.aka].join(" ").toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        if (onlyDivergent) {
          // "Divergent" means the selected regulators actually disagree —
          // the gap between the strictest and the most permissive is wide
          // enough to be a real difference in outcome, not a wording nuance.
          const sev = ordered.map((r) => STATUS_SEVERITY[rulingFor(ing, r.code).status]);
          if (Math.max(...sev) - Math.min(...sev) < 3) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const spread = (ing: Ingredient) => {
          const sev = ordered.map((r) => STATUS_SEVERITY[rulingFor(ing, r.code).status]);
          return Math.max(...sev) - Math.min(...sev);
        };
        return spread(b) - spread(a) || a.name.localeCompare(b.name);
      });
  }, [ingredients, search, onlyDivergent, ordered]);

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Regions to compare</div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => toggleRegion(r.code)}
              aria-pressed={regions.includes(r.code)}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
                regions.includes(r.code)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {r.shortName}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter substances…"
              className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-muted-foreground select-none sm:min-h-0">
            <input
              type="checkbox"
              checked={onlyDivergent}
              onChange={(e) => setOnlyDivergent(e.target.checked)}
              className="size-4.5 rounded border-border accent-foreground"
            />
            Only where regulators disagree
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {rows.length} substances across {ordered.length} regions
        </p>
        <p className="text-xs text-muted-foreground md:hidden">Scroll the table sideways →</p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th scope="col" className="sticky left-0 z-10 bg-muted/40 px-4 py-2.5 text-left text-sm font-medium">
                Substance
              </th>
              {ordered.map((r) => (
                <th key={r.code} scope="col" className="px-2 py-2.5 text-center text-sm font-medium">
                  {r.shortName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((ing) => (
              <tr key={ing.slug} className="border-b border-border last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-2 text-left font-normal">
                  <Link href={`/ingredients/${ing.slug}`} className="text-sm font-medium hover:underline">
                    {ing.name}
                  </Link>
                  {ing.eNumber && <div className="text-xs text-muted-foreground">{ing.eNumber}</div>}
                </th>
                {ordered.map((r) => (
                  <Cell key={r.code} ing={ing} region={r.code} onShow={showTip} onHide={hideTip} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 w-64 rounded-lg border border-border bg-popover p-2.5 text-left text-xs leading-relaxed text-popover-foreground shadow-lg"
          style={{
            left: tip.x,
            top: tip.y,
            transform: `translate(-50%, ${tip.above ? "-100%" : "0"})`,
          }}
        >
          {tip.text}
        </div>
      )}

      {rows.length === 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="mx-auto size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-medium">Nothing matches</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {onlyDivergent
              ? "These regulators broadly agree on the substances you have filtered to."
              : "Try a different search term."}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-2 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:col-span-2">
          What the statuses mean
        </div>
        {(Object.keys(STATUS_META) as Status[]).map((s) => (
          <div key={s} className="flex items-start gap-2.5">
            <StatusBadge status={s} />
            <p className="text-xs leading-relaxed text-muted-foreground">{STATUS_META[s].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
