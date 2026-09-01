import type { Ingredient, StateRuling } from "./types";
import { INGREDIENTS } from "./ingredients";
import { TIMELINE } from "./timeline";

/**
 * "Is this still being sold?" answered from the legal record.
 *
 * This is the defensible half of that question. A revocation almost never
 * empties shelves on the day it is signed: the FDA sets a compliance date, and
 * until it passes the substance is entirely lawful to manufacture and sell.
 * Red 3 was "banned" in January 2025 and is legal in food until January 2027.
 *
 * Everything here derives from dates already in the dataset, each carrying its
 * own primary source. No claim is made about any particular company.
 */

export type ShelfState =
  /** Lawful to sell now, with a date after which it will not be. */
  | "selling-until"
  /** Lawful to sell now, indefinitely, at federal level. */
  | "selling"
  /** Lawful federally but already prohibited in at least one state. */
  | "selling-except"
  /** No longer lawful to sell anywhere in the US. */
  | "off-shelves"
  /** Never authorised in the US, so not sold here in the first place. */
  | "never-sold";

export interface ShelfStatus {
  /** Fraction of the grace period already elapsed, 0-1, or null if unknown. */
  elapsed: number | null;
  /** ISO date the grace period opened, when known. */
  from?: string;
  state: ShelfState;
  /** One line, written to be quoted without further context. */
  headline: string;
  /** The date the federal grace period ends, when there is one. */
  until?: string;
  /** States where it is, or becomes, prohibited ahead of federal law. */
  states: StateRuling[];
  /** Days until the federal deadline; negative once passed. */
  daysLeft?: number;
}

const DAY = 86_400_000;

/**
 * When the clock started running on a grace period.
 *
 * Usually the revocation's own effective date, with the compliance date as the
 * end. Where the rule has only one date (the revocation takes effect directly,
 * as with Orange B), the window opens when the order published — which the
 * timeline records. Returns null when neither is known, and the meter then
 * shows time remaining without a fraction rather than inventing a start.
 */
export function graceStart(ing: Ingredient): string | null {
  const us = ing.us;
  if (us.complianceDate && us.effectiveDate) return us.effectiveDate;

  const announced = TIMELINE.filter((e) => e.ingredients.includes(ing.slug) && e.region === "US" && !e.state)
    .map((e) => e.date)
    // Strictly before: the event marking the deadline itself is the end of
    // the window, not its start, and using it collapses the span to zero.
    .filter((d) => !us.effectiveDate || d < us.effectiveDate)
    .sort();
  return announced.length ? announced[announced.length - 1] : null;
}
const days = (iso: string, now: number) => Math.round((new Date(`${iso}T00:00:00Z`).getTime() - now) / DAY);

/** `now` is a parameter so this stays pure and safe to call during render. */
export function shelfStatus(ing: Ingredient, now: number): ShelfStatus {
  const states = ing.states.filter((s) => s.status !== "permitted");
  const us = ing.us;

  if (us.status === "not-authorised") {
    return { state: "never-sold", headline: "Never authorised for sale in the US.", states, elapsed: null };
  }

  // A revocation with a compliance date still in the future: lawful today.
  const deadline = us.complianceDate ?? (us.status === "phase-out" ? us.effectiveDate : undefined);
  if (deadline) {
    const left = days(deadline, now);
    const from = graceStart(ing) ?? undefined;
    const span = from ? days(deadline, new Date(`${from}T00:00:00Z`).getTime()) : 0;
    // Clamped: a window can be reopened or extended, and a bar past 100%
    // would be reporting the arithmetic rather than the situation.
    const elapsed = span > 0 ? Math.min(Math.max(1 - left / span, 0), 1) : null;

    if (left > 0) {
      return {
        state: "selling-until",
        headline: "Still legal to sell — the ban has not taken full effect yet.",
        until: deadline,
        daysLeft: left,
        states,
        elapsed,
        from,
      };
    }
    return {
      state: "off-shelves",
      headline: "No longer legal to sell in the US.",
      until: deadline,
      daysLeft: left,
      states,
      elapsed: 1,
      from,
    };
  }

  if (us.status === "banned") {
    return { state: "off-shelves", headline: "No longer legal to sell in the US.", states, elapsed: 1 };
  }

  // Permitted, restricted or pending federally — on shelves today.
  if (states.length) {
    return {
      state: "selling-except",
      headline: "On sale nationwide, though some states have acted.",
      states,
      elapsed: null,
    };
  }
  return {
    state: "selling",
    headline: "On sale nationwide, with no federal restriction on sale.",
    states,
    elapsed: null,
  };
}

/**
 * Substances a shopper could still buy today despite a ban being law, ordered
 * by how soon that window closes. This is the set most people mean when they
 * ask whether banned ingredients are still being sold.
 */
export function stillSelling(now: number) {
  return INGREDIENTS.map((ing) => ({ ing, shelf: shelfStatus(ing, now) }))
    .filter((r) => r.shelf.state === "selling-until")
    .sort((a, b) => (a.shelf.daysLeft ?? 0) - (b.shelf.daysLeft ?? 0));
}

/**
 * Substances that are lawful in the US but banned outright by a peer
 * regulator — on sale here, and not there.
 */
export function sellingButBannedAbroad(now: number) {
  return INGREDIENTS.map((ing) => {
    const shelf = shelfStatus(ing, now);
    const bannedIn = Object.entries(ing.regions)
      .filter(([, r]) => r.status === "banned")
      .map(([code]) => code);
    return { ing, shelf, bannedIn };
  })
    .filter((r) => (r.shelf.state === "selling" || r.shelf.state === "selling-except") && r.bannedIn.length > 0)
    .sort((a, b) => b.bannedIn.length - a.bannedIn.length || a.ing.name.localeCompare(b.ing.name));
}
