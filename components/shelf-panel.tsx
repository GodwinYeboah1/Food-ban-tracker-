"use client";

import { useSyncExternalStore } from "react";
import { CircleCheck, CircleSlash, ShoppingCart, TriangleAlert } from "lucide-react";
import { shelfStatus, type ShelfState } from "@/lib/shelf";
import type { Ingredient } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/**
 * Rendered client-side because the answer depends on today's date and these
 * pages are statically prerendered — a build-time "4 months left" would drift
 * into being wrong. Same clock-as-external-store pattern as RelativeTime.
 */
const HOUR = 3_600_000;
function subscribe(cb: () => void) {
  const id = setInterval(cb, HOUR);
  return () => clearInterval(id);
}
const getSnapshot = () => Math.floor(Date.now() / HOUR);
const getServerSnapshot = () => null;

const STYLE: Record<ShelfState, { tone: string; icon: typeof ShoppingCart; label: string }> = {
  "selling-until": { tone: "tone-amber", icon: ShoppingCart, label: "Still on shelves" },
  selling: { tone: "tone-slate", icon: ShoppingCart, label: "On sale" },
  "selling-except": { tone: "tone-amber", icon: TriangleAlert, label: "On sale, with state limits" },
  "off-shelves": { tone: "tone-green", icon: CircleCheck, label: "Off shelves" },
  "never-sold": { tone: "tone-slate", icon: CircleSlash, label: "Never sold in the US" },
};

export function ShelfPanel({ ingredient }: { ingredient: Ingredient }) {
  const hour = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (hour === null) return null;

  const shelf = shelfStatus(ingredient, hour * HOUR);
  const s = STYLE[shelf.state];
  const Icon = s.icon;

  const months =
    shelf.daysLeft !== undefined && shelf.daysLeft > 0 ? Math.round(shelf.daysLeft / 30.44) : null;

  return (
    <section
      className={cn(s.tone, "rounded-xl border p-5")}
      style={{ backgroundColor: "var(--tone-bg)", borderColor: "var(--tone-border)" }}
    >
      <div className="flex items-center gap-2" style={{ color: "var(--tone)" }}>
        <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
        <h2 className="text-sm font-semibold">{s.label}</h2>
      </div>

      <p className="measure mt-2.5 text-sm leading-relaxed">{shelf.headline}</p>

      {shelf.until && shelf.daysLeft !== undefined && shelf.daysLeft > 0 && (
        <p className="measure mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Manufacturers have until{" "}
          <strong className="font-medium text-foreground">{formatDate(shelf.until)}</strong> to comply — about{" "}
          {months} {months === 1 ? "month" : "months"} away. Stock made before then may legally stay on sale.
        </p>
      )}

      {shelf.until && shelf.daysLeft !== undefined && shelf.daysLeft <= 0 && (
        <p className="measure mt-2.5 text-sm leading-relaxed text-muted-foreground">
          The compliance deadline passed on {formatDate(shelf.until)}.
        </p>
      )}

      {shelf.states.length > 0 && (
        <div className="mt-4 border-t pt-3.5" style={{ borderColor: "var(--tone-border)" }}>
          <div className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--tone)" }}>
            State restrictions
          </div>
          <ul className="mt-2 space-y-1.5">
            {shelf.states.map((st) => (
              <li key={`${st.code}-${st.bill}`} className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{st.name}</span> — {st.bill}
                {st.effectiveDate && <> from {formatDate(st.effectiveDate)}</>}
                {st.schoolsEffectiveDate && <>, schools from {formatDate(st.schoolsEffectiveDate)}</>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
