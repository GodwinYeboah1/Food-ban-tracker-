import type { RegionCode, Status, Category } from "./types";

export interface RegionMeta {
  code: RegionCode;
  name: string;
  shortName: string;
  regulator: string;
  /**
   * Positive-list regimes only permit what is explicitly listed. Negative-list
   * regimes permit anything not explicitly revoked. This changes how an
   * "absent" substance should be read, so the UI surfaces it.
   */
  listType: "positive" | "negative";
  note: string;
  sourceUrl: string;
}

export const REGIONS: RegionMeta[] = [
  {
    code: "US",
    name: "United States",
    shortName: "US",
    regulator: "FDA",
    listType: "negative",
    note: "Additives are legal until the FDA revokes an authorisation. Substances self-affirmed as GRAS may enter the food supply without a pre-market FDA review.",
    sourceUrl: "https://www.fda.gov/food/food-additives-petitions/food-additive-status-list",
  },
  {
    code: "EU",
    name: "European Union",
    shortName: "EU",
    regulator: "European Commission / EFSA",
    listType: "positive",
    note: "Only additives on the Regulation 1333/2008 Annex II list may be used, each with named foods and maximum levels.",
    sourceUrl: "https://ec.europa.eu/food/food-feed-portal/screen/food-additives",
  },
  {
    code: "UK",
    name: "United Kingdom",
    shortName: "UK",
    regulator: "Food Standards Agency",
    listType: "positive",
    note: "Inherited the EU list as assimilated law in 2021. Positions have since diverged on a small number of substances.",
    sourceUrl: "https://www.food.gov.uk/safety-hygiene/food-additives",
  },
  {
    code: "CA",
    name: "Canada",
    shortName: "Canada",
    regulator: "Health Canada",
    listType: "positive",
    note: "Governed by the 15 Lists of Permitted Food Additives, which have force of law under the Food and Drugs Act.",
    sourceUrl: "https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/lists-permitted.html",
  },
  {
    code: "ANZ",
    name: "Australia & New Zealand",
    shortName: "AU/NZ",
    regulator: "FSANZ",
    listType: "positive",
    note: "A single food standards code covers both countries; permitted additives are listed in Schedule 15.",
    sourceUrl: "https://www.foodstandards.gov.au/food-standards-code",
  },
  {
    code: "JP",
    name: "Japan",
    shortName: "Japan",
    regulator: "MHLW / JFCRF",
    listType: "positive",
    note: "Designated additives are listed under the Food Sanitation Act, with a separate list of existing additives in traditional use.",
    sourceUrl: "https://www.ffcr.or.jp/en/tenka/list-of-designated-additives/list-of-designated-additives.html",
  },
];

export const REGION_BY_CODE = Object.fromEntries(
  REGIONS.map((r) => [r.code, r]),
) as Record<RegionCode, RegionMeta>;

export const STATUS_META: Record<
  Status,
  {
    /** Lucide icon name, resolved by components/status-badge.tsx. */
    icon: string;
    label: string;
    description: string;
    tone: "red" | "amber" | "blue" | "green" | "slate";
  }
> = {
  banned: {
    icon: "Ban",
    label: "Banned",
    description: "Authorisation affirmatively revoked or the substance prohibited by name.",
    tone: "red",
  },
  "phase-out": {
    icon: "Timer",
    label: "Phasing out",
    description: "The ban is law, but industry has until a compliance date to clear stock.",
    tone: "amber",
  },
  restricted: {
    icon: "TriangleAlert",
    label: "Restricted",
    description: "Permitted only in named foods, at capped levels, or with a mandatory warning label.",
    tone: "amber",
  },
  pending: {
    icon: "CircleDashed",
    label: "Pending",
    description: "A proposed rule, a signed bill not yet in force, or a petition under review.",
    tone: "blue",
  },
  permitted: {
    icon: "Check",
    label: "Permitted",
    description: "On the permitted list with no unusual conditions attached.",
    tone: "green",
  },
  "not-authorised": {
    icon: "CircleOff",
    label: "Not authorised",
    description: "Absent from the permitted list. Not the same as an affirmative ban.",
    tone: "slate",
  },
};

/** Ordering used for sorting and for the compare view's severity colouring. */
export const STATUS_SEVERITY: Record<Status, number> = {
  banned: 5,
  "phase-out": 4,
  restricted: 3,
  "not-authorised": 2,
  pending: 1,
  permitted: 0,
};

export const CATEGORY_META: Record<Category, { label: string }> = {
  colour: { label: "Colour additive" },
  preservative: { label: "Preservative & antioxidant" },
  "flour-treatment": { label: "Flour treatment agent" },
  "emulsifier-stabiliser": { label: "Emulsifier & stabiliser" },
  sweetener: { label: "Sweetener" },
  fat: { label: "Fat & oil" },
  "animal-drug": { label: "Animal drug & feed additive" },
  process: { label: "Processing aid & treatment" },
};
