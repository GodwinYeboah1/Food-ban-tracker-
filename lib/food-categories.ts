import { INGREDIENTS } from "./ingredients";
import { STATUS_SEVERITY } from "./regions";
import type { Ingredient } from "./types";

/**
 * Everyday food types, in shopper's language rather than regulatory language.
 *
 * This is a browsing taxonomy, not a legal one. The `foundIn` field on each
 * ingredient is prose written for a human reading one page; this maps the same
 * facts onto a fixed vocabulary so the site can answer the other direction of
 * the question — "what is in my breakfast cereal?" rather than "where does
 * Red 40 turn up?".
 *
 * Kept in one file, deliberately, so the whole mapping can be reviewed at once.
 */

export interface FoodCategoryMeta {
  slug: string;
  name: string;
  /** Lucide icon name, resolved by components/food-icon.tsx. */
  icon: string;
  description: string;
}

export const FOOD_CATEGORIES: FoodCategoryMeta[] = [
  {
    slug: "bakery",
    name: "Bread & baked goods",
    icon: "Croissant",
    description:
      "The category with the most US–EU divergence. Three flour treatment agents permitted in American baking are banned across Europe.",
  },
  {
    slug: "sweets",
    name: "Sweets & confectionery",
    icon: "Candy",
    description: "Where the synthetic dyes concentrate, and the main target of the state-level bans.",
  },
  {
    slug: "soft-drinks",
    name: "Soft & sports drinks",
    icon: "CupSoda",
    description: "Dyes, and until 2025 the one additive the FDA removed specifically because of soft drinks.",
  },
  {
    slug: "cereals",
    name: "Breakfast cereals",
    icon: "Wheat",
    description: "Dyes plus the antioxidants that keep the fats in them from going rancid.",
  },
  {
    slug: "snacks",
    name: "Crisps & snacks",
    icon: "Popcorn",
    description: "Colours, antioxidants, and the fat substitute that never caught on outside the US.",
  },
  {
    slug: "dairy",
    name: "Dairy & frozen desserts",
    icon: "IceCreamCone",
    description: "Colours and stabilisers, plus the growth hormone banned everywhere except the United States.",
  },
  {
    slug: "meat",
    name: "Meat, poultry & deli",
    icon: "Beef",
    description:
      "Less about additives than about how the animal was raised and processed — the sharpest transatlantic disagreements are here.",
  },
  {
    slug: "condiments",
    name: "Sauces, dressings & pickles",
    icon: "Droplets",
    description: "Colours and whiteners, mostly for appearance rather than function.",
  },
  {
    slug: "tinned",
    name: "Tinned & jarred",
    icon: "Soup",
    description: "Colours added to restore what the canning process takes out.",
  },
  {
    slug: "produce",
    name: "Fresh produce",
    icon: "Citrus",
    description: "Almost nothing — with one long-standing exception applied to the skin of oranges.",
  },
  {
    slug: "baby",
    name: "Infant formula & baby food",
    icon: "Baby",
    description: "Tightly regulated everywhere, but one stabiliser is permitted in US formula and barred in EU formula.",
  },
  {
    slug: "gum",
    name: "Chewing gum",
    icon: "Bubbles",
    description: "Small category, but the clearest case of regulators reading the same evidence and disagreeing.",
  },
  {
    slug: "plant-milk",
    name: "Plant-based milks",
    icon: "Milk",
    description: "One stabiliser dominates, and it is contested rather than banned.",
  },
  {
    slug: "alcohol",
    name: "Alcohol & mixers",
    icon: "Martini",
    description: "A dye banned in the US in 1976 is still permitted in European aperitifs.",
  },
];

export const FOOD_CATEGORY_BY_SLUG = Object.fromEntries(
  FOOD_CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, FoodCategoryMeta>;

/**
 * Which food types each tracked substance actually turns up in.
 *
 * Historical-only uses are included where the substance defined a category
 * (partially hydrogenated oils in baked goods, for instance) because "this is
 * what changed and when" is the point of the site.
 */
const MAP: Record<string, string[]> = {
  "red-3": ["sweets", "dairy", "bakery", "gum"],
  "red-40": ["sweets", "soft-drinks", "cereals", "dairy", "snacks"],
  "yellow-5": ["soft-drinks", "snacks", "condiments", "sweets"],
  "yellow-6": ["dairy", "sweets", "snacks", "bakery"],
  "blue-1": ["sweets", "soft-drinks", "dairy", "bakery"],
  "blue-2": ["sweets", "cereals", "bakery"],
  "green-3": ["tinned", "condiments", "sweets", "dairy"],
  "citrus-red-2": ["produce"],
  "orange-b": ["meat"],
  "amaranth-red-2": ["alcohol", "sweets", "dairy"],
  "titanium-dioxide": ["gum", "sweets", "bakery", "condiments"],
  "quinoline-yellow": ["soft-drinks", "sweets", "condiments", "meat"],
  "ponceau-4r": ["tinned", "meat", "sweets"],
  "brominated-vegetable-oil": ["soft-drinks"],
  "potassium-bromate": ["bakery"],
  propylparaben: ["bakery"],
  azodicarbonamide: ["bakery"],
  bha: ["cereals", "meat", "gum", "snacks"],
  "partially-hydrogenated-oils": ["bakery", "snacks", "dairy"],
  cyclamate: ["soft-drinks", "sweets"],
  olestra: ["snacks"],
  "benzoyl-peroxide": ["bakery", "dairy"],
  carrageenan: ["plant-milk", "dairy", "meat", "baby"],
  ractopamine: ["meat"],
  rbst: ["dairy"],
  "chlorine-washed-poultry": ["meat"],
  "antibiotic-growth-promoters": ["meat"],
  safrole: ["soft-drinks"],
  coumarin: ["bakery", "sweets"],
};

export function categoriesForIngredient(slug: string): FoodCategoryMeta[] {
  return (MAP[slug] ?? []).map((c) => FOOD_CATEGORY_BY_SLUG[c]).filter(Boolean);
}

export function ingredientsInCategory(categorySlug: string): Ingredient[] {
  return INGREDIENTS.filter((i) => (MAP[i.slug] ?? []).includes(categorySlug)).sort(
    (a, b) =>
      STATUS_SEVERITY[b.us.status] - STATUS_SEVERITY[a.us.status] || a.name.localeCompare(b.name),
  );
}

/** Counts for the browse grid: how many substances, and how many are contested. */
export function categorySummary(categorySlug: string) {
  const items = ingredientsInCategory(categorySlug);
  return {
    total: items.length,
    // Restricted-or-worse in the US: something a US shopper could act on.
    restrictedUS: items.filter((i) => STATUS_SEVERITY[i.us.status] >= STATUS_SEVERITY.restricted).length,
    // Freely permitted in the US but banned by a peer regulator.
    stricterAbroad: items.filter(
      (i) =>
        STATUS_SEVERITY[i.us.status] < STATUS_SEVERITY.restricted &&
        Object.values(i.regions).some((r) => r.status === "banned"),
    ).length,
  };
}

/** Sanity check used by the build: every ingredient must be mapped somewhere. */
export function unmappedIngredients(): string[] {
  return INGREDIENTS.filter((i) => !(MAP[i.slug]?.length ?? 0)).map((i) => i.slug);
}
