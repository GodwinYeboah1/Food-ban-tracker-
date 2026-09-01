/**
 * Status vocabulary.
 *
 * The distinction between `banned` and `not-authorised` matters and is not
 * cosmetic. The US runs a largely *negative* list: a substance is legal until
 * an authorisation is affirmatively revoked. The EU, UK and Australia/NZ run
 * *positive* lists: only substances on the permitted list may be used, so a
 * substance can be absent without any regulator ever having "banned" it.
 * Collapsing the two into one red badge is the single most common error in
 * popular reporting on this topic, so we keep them apart everywhere.
 */
export type Status =
  | "banned" // authorisation affirmatively revoked / prohibited by name
  | "phase-out" // revoked or agreed, but still legal until a compliance date
  | "restricted" // permitted only in named foods, at capped levels, or with a warning label
  | "pending" // proposed rule, signed bill not yet in force, or petition under review
  | "permitted" // on the permitted list with no unusual conditions
  | "not-authorised"; // never approved; absent from a positive list

export type RegionCode = "US" | "EU" | "UK" | "CA" | "ANZ" | "JP";

export type Category =
  | "colour"
  | "preservative"
  | "flour-treatment"
  | "emulsifier-stabiliser"
  | "sweetener"
  | "fat"
  | "animal-drug"
  | "process";

export interface Source {
  label: string;
  url: string;
}

/** One regulator's position on one substance. */
export interface RegionRuling {
  status: Status;
  /** One or two sentences. Factual, no editorialising. */
  detail: string;
  /** ISO date the rule took or takes legal effect. */
  effectiveDate?: string;
  /** ISO date industry must comply by, when it differs from effectiveDate. */
  complianceDate?: string;
  sources: Source[];
}

/** A state-level US ruling. Federal law does not pre-empt these. */
export interface StateRuling {
  /** Two-letter postal code, e.g. "CA". */
  code: string;
  name: string;
  status: Status;
  /** Short bill identifier, e.g. "AB 418". */
  bill: string;
  detail: string;
  effectiveDate?: string;
  /** Some state laws bite in schools before they bite statewide. */
  schoolsEffectiveDate?: string;
  sources: Source[];
}

export interface Ingredient {
  slug: string;
  name: string;
  /** Other names the same substance trades under, including INS/E numbers. */
  aka: string[];
  eNumber?: string;
  category: Category;
  /** What the substance is and what it does in food. */
  summary: string;
  /** The regulator's stated reason for acting. Attributed, never asserted. */
  whyRestricted: string;
  foundIn: string[];
  us: RegionRuling;
  states: StateRuling[];
  regions: Record<Exclude<RegionCode, "US">, RegionRuling>;
  /** ISO date this record was last verified against its sources. */
  lastVerified: string;
}

/** An entry in the "What's new" feed: a dated change in the legal record. */
export interface ChangeEvent {
  id: string;
  date: string;
  region: RegionCode;
  /** Present when the change is state-level rather than federal. */
  state?: string;
  title: string;
  detail: string;
  /** Ingredient slugs this change touches. */
  ingredients: string[];
  status: Status;
  sources: Source[];
}

/** A candidate document pulled by the daily sync, awaiting human review. */
export interface QueueItem {
  source: "federal_register" | "openfda";
  externalId: string;
  title: string;
  status: "unreviewed" | "accepted" | "rejected";
  publishedAt: string;
  sourceUrl: string;
  fetchedAt: string;
}
