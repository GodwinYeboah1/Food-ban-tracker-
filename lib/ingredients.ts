import type { Ingredient, RegionCode, Status, Category, RegionRuling } from "./types";
import { STATUS_SEVERITY } from "./regions";
import { colours } from "./data/colours";
import { additives } from "./data/additives";
import { practices } from "./data/practices";

export const INGREDIENTS: Ingredient[] = [...colours, ...additives, ...practices].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const BY_SLUG = new Map(INGREDIENTS.map((i) => [i.slug, i]));

export function getIngredient(slug: string): Ingredient | undefined {
  return BY_SLUG.get(slug);
}

/** Reads one region's ruling off an ingredient, flattening the US special case. */
export function rulingFor(ingredient: Ingredient, region: RegionCode): RegionRuling {
  return region === "US" ? ingredient.us : ingredient.regions[region];
}

export interface IngredientQuery {
  search?: string;
  status?: Status[];
  category?: Category[];
  /** Match against the status in this region rather than the US. */
  region?: RegionCode;
  /** Only ingredients with at least one state-level ruling. */
  hasStateAction?: boolean;
}

export function queryIngredients(q: IngredientQuery = {}): Ingredient[] {
  const region = q.region ?? "US";
  const needle = q.search?.trim().toLowerCase();

  return INGREDIENTS.filter((ing) => {
    if (needle) {
      const haystack = [ing.name, ing.eNumber ?? "", ...ing.aka, ing.summary, ...ing.foundIn]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (q.status?.length && !q.status.includes(rulingFor(ing, region).status)) return false;
    if (q.category?.length && !q.category.includes(ing.category)) return false;
    if (q.hasStateAction && ing.states.length === 0) return false;
    return true;
  });
}

/** Headline counts for the dashboard tiles. */
export function summaryStats() {
  const usStatus = (s: Status) => INGREDIENTS.filter((i) => i.us.status === s).length;

  // A substance counts once here even if several states have acted on it.
  const withStateAction = INGREDIENTS.filter((i) => i.states.length > 0);
  const states = new Set(withStateAction.flatMap((i) => i.states.map((s) => s.code)));

  // "Stricter elsewhere" is the comparison the site exists to make: substances
  // freely permitted in the US that at least one other regulator has banned.
  const stricterAbroad = INGREDIENTS.filter((i) => {
    if (STATUS_SEVERITY[i.us.status] >= STATUS_SEVERITY.restricted) return false;
    return Object.values(i.regions).some((r) => r.status === "banned");
  });

  return {
    tracked: INGREDIENTS.length,
    bannedFederally: usStatus("banned"),
    phasingOut: usStatus("phase-out"),
    pendingFederally: usStatus("pending"),
    withStateAction: withStateAction.length,
    activeStates: states.size,
    stricterAbroad: stricterAbroad.length,
    stricterAbroadSlugs: stricterAbroad.map((i) => i.slug),
  };
}

/** Every US state that appears anywhere in the dataset, with its rulings. */
export function stateActivity() {
  const map = new Map<string, { code: string; name: string; bills: Set<string>; ingredients: string[] }>();
  for (const ing of INGREDIENTS) {
    for (const st of ing.states) {
      // A "struck from the bill" record documents the absence of a rule, so it
      // must not inflate the state's count of restricted substances.
      if (st.status === "permitted") continue;
      const entry = map.get(st.code) ?? { code: st.code, name: st.name, bills: new Set<string>(), ingredients: [] };
      entry.bills.add(st.bill);
      entry.ingredients.push(ing.slug);
      map.set(st.code, entry);
    }
  }
  return [...map.values()]
    .map((e) => ({ ...e, bills: [...e.bills] }))
    .sort((a, b) => b.ingredients.length - a.ingredients.length);
}
