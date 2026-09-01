import type { Ingredient, StateRuling } from "../types";
import { S, EU_WARNING } from "./sources";

/** The seven dyes named together in the 2025 West Virginia statute. */
const WV_SEVEN_DYES: StateRuling = {
  code: "WV",
  name: "West Virginia",
  status: "pending",
  bill: "HB 2354",
  detail:
    "Signed March 2025, the broadest state additive law passed to date. It bars the dye from food sold statewide from 2028; the narrower school-meal prohibition bit first, in August 2025.",
  effectiveDate: "2028-01-01",
  schoolsEffectiveDate: "2025-08-01",
  sources: [S.wvHB2354],
};

const CA_SCHOOL_DYES: StateRuling = {
  code: "CA",
  name: "California",
  status: "pending",
  bill: "AB 2316",
  detail:
    "The California School Food Safety Act bars the dye from food served by public schools. It does not restrict general retail sale.",
  effectiveDate: "2027-12-31",
  sources: [S.caAB2316],
};

const TX_WARNING_LABEL: StateRuling = {
  code: "TX",
  name: "Texas",
  status: "pending",
  bill: "SB 25",
  detail:
    "Not a ban. Requires a warning label on foods containing the dye, for labels developed or copyrighted on or after 1 January 2027. The requirement lifts if federal authorities act on the substance first.",
  effectiveDate: "2027-01-01",
  sources: [S.txSB25],
};

export const colours: Ingredient[] = [
  {
    slug: "red-3",
    name: "FD&C Red No. 3",
    aka: ["Erythrosine", "E127", "Red 3", "CI 45430"],
    eNumber: "E127",
    category: "colour",
    summary:
      "A synthetic cherry-pink dye derived from petroleum, used where a bright pink is wanted and heat stability is not critical.",
    whyRestricted:
      "High doses caused thyroid tumours in male rats. The Delaney Clause bars the FDA from authorising any colour additive found to induce cancer in humans or animals, whatever the dose. The FDA's own notice states the rat mechanism is not thought to operate in humans — but the statute leaves the agency no discretion once the finding is made.",
    foundIn: [
      "Candied and maraschino cherries",
      "Strawberry-flavoured milks and syrups",
      "Frostings, icings and cake decorations",
      "Some chewing gums and ice lollies",
    ],
    us: {
      status: "phase-out",
      detail:
        "The FDA revoked the colour additive authorisation on 15 January 2025. Affected food may still be sold until the compliance date. Red 3 has been barred from cosmetics and externally applied drugs since 1990 on the same evidence.",
      effectiveDate: "2025-01-15",
      complianceDate: "2027-01-15",
      sources: [S.red3Rule, S.fdaColorList],
    },
    states: [
      {
        code: "CA",
        name: "California",
        status: "pending",
        bill: "AB 418",
        detail:
          "The California Food Safety Act bans manufacture, sale and distribution statewide from 1 January 2027 — two weeks ahead of the federal compliance date. This is the law widely credited with forcing the federal decision.",
        effectiveDate: "2027-01-01",
        sources: [S.caAB418],
      },
      WV_SEVEN_DYES,
    ],
    regions: {
      EU: {
        status: "restricted",
        detail:
          "Permitted only in cocktail cherries, candied cherries and Bigarreaux cherries in syrup, at capped levels. Barred from every other food.",
        sources: [S.euAdditivesDb, S.euAnnexII],
      },
      UK: {
        status: "restricted",
        detail: "The same narrow cherry-only permission the UK carried over from EU law in 2021.",
        sources: [S.fsaAdditives],
      },
      CA: {
        status: "permitted",
        detail:
          "Erythrosine remains on Health Canada's List of Permitted Colouring Agents, with maximum levels set by food class.",
        sources: [S.hcColours],
      },
      ANZ: {
        status: "restricted",
        detail: "Permitted as INS 127 in a limited set of food categories under Schedule 15.",
        sources: [S.fsanz],
      },
      JP: {
        status: "permitted",
        detail: "Permitted as a designated additive (Red No. 3), with use standards by food category.",
        sources: [S.jpAdditives],
      },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "red-40",
    name: "FD&C Red No. 40",
    aka: ["Allura Red AC", "E129", "Red 40", "CI 16035"],
    eNumber: "E129",
    category: "colour",
    summary:
      "An orange-red azo dye made from petroleum, and the most heavily used certified colour additive in the United States by volume.",
    whyRestricted:
      "One of six dyes in the 2007 Southampton study, which reported increased hyperactivity in children in the general population. The EU responded with a mandatory warning label rather than a ban. The FDA's position has been that the evidence does not establish a causal link for children generally, while accepting that some children may be sensitive.",
    foundIn: [
      "Sports drinks and fruit punches",
      "Breakfast cereals",
      "Confectionery and fruit snacks",
      "Flavoured yoghurts and gelatin desserts",
    ],
    us: {
      status: "permitted",
      detail:
        "Authorised and subject to FDA batch certification. In April 2025 HHS and the FDA announced an intention to work with industry to phase petroleum-based synthetic dyes out of the food supply. That is an announced voluntary target, not a rule with legal force.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: { status: "restricted", detail: EU_WARNING, sources: [S.euAnnexII, S.southampton] },
      UK: {
        status: "restricted",
        detail:
          "The same warning-label requirement. The FSA additionally asked manufacturers for a voluntary withdrawal in 2008, which much of the UK retail sector adopted.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "permitted", detail: "Permitted as allura red, with maximum levels by food class.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 129.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Red No. 40).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "yellow-5",
    name: "FD&C Yellow No. 5",
    aka: ["Tartrazine", "E102", "Yellow 5", "CI 19140"],
    eNumber: "E102",
    category: "colour",
    summary: "A lemon-yellow azo dye, the second most used certified colour in the US food supply.",
    whyRestricted:
      "A Southampton-study dye, carrying the same EU warning label as Red 40. Separately, the FDA has required tartrazine to be declared by name on US labels since 1980, because a small number of people — often those with aspirin sensitivity — report hives or other allergic-type reactions.",
    foundIn: [
      "Soft drinks and powdered drink mixes",
      "Crisps and snack foods",
      "Pickles and condiments",
      "Boxed macaroni cheese",
    ],
    us: {
      status: "restricted",
      detail:
        "Authorised, but uniquely among the certified dyes it must be declared by name rather than as a generic 'artificial colour'. Covered by the April 2025 voluntary phase-out announcement.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: { status: "restricted", detail: EU_WARNING, sources: [S.euAnnexII, S.southampton] },
      UK: {
        status: "restricted",
        detail: "Warning label required, and covered by the FSA's 2008 voluntary withdrawal request.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "permitted", detail: "Permitted as tartrazine, and must be declared by name.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 102.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Yellow No. 4).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "yellow-6",
    name: "FD&C Yellow No. 6",
    aka: ["Sunset Yellow FCF", "E110", "Yellow 6", "CI 15985"],
    eNumber: "E110",
    category: "colour",
    summary: "An orange azo dye used wherever a warm orange or amber tone is wanted.",
    whyRestricted:
      "A Southampton-study dye. EFSA also lowered its acceptable daily intake in 2009 after a re-evaluation, then partially revised that figure again in 2014 on new data.",
    foundIn: [
      "Processed cheese products",
      "Orange-flavoured drinks and sweets",
      "Snack foods",
      "Baked goods and icings",
    ],
    us: {
      status: "permitted",
      detail: "Authorised and batch-certified. Covered by the April 2025 voluntary phase-out announcement.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: { status: "restricted", detail: EU_WARNING, sources: [S.euAnnexII, S.southampton] },
      UK: {
        status: "restricted",
        detail: "Warning label required, and covered by the FSA's 2008 voluntary withdrawal request.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "permitted", detail: "Permitted as sunset yellow FCF.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 110.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Yellow No. 5).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "blue-1",
    name: "FD&C Blue No. 1",
    aka: ["Brilliant Blue FCF", "E133", "Blue 1", "CI 42090"],
    eNumber: "E133",
    category: "colour",
    summary: "A bright blue triarylmethane dye, very widely used and poorly absorbed by the gut.",
    whyRestricted:
      "Not a Southampton dye, and not subject to the EU warning label. It is caught by US state legislation and the federal voluntary phase-out because those measures target petroleum-derived synthetic dyes as a class, rather than acting on substance-by-substance risk findings.",
    foundIn: ["Blue and green sweets", "Sports drinks", "Ice creams and frozen desserts", "Icings and cake decorations"],
    us: {
      status: "permitted",
      detail: "Authorised and batch-certified. Covered by the April 2025 voluntary phase-out announcement.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: {
        status: "permitted",
        detail: "Permitted as E133 with maximum levels by food category. No warning label required.",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "permitted", detail: "Permitted, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "permitted", detail: "Permitted as brilliant blue FCF.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 133.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Blue No. 1).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "blue-2",
    name: "FD&C Blue No. 2",
    aka: ["Indigotine", "Indigo carmine", "E132", "Blue 2", "CI 73015"],
    eNumber: "E132",
    category: "colour",
    summary: "A deep indigo dye, the synthetic counterpart of natural indigo.",
    whyRestricted:
      "Caught by the class-based US state bans and the federal voluntary phase-out as a petroleum-derived synthetic dye. It was not among the six Southampton dyes.",
    foundIn: ["Confectionery", "Pet foods", "Baked goods", "Breakfast cereals"],
    us: {
      status: "permitted",
      detail: "Authorised and batch-certified. Covered by the April 2025 voluntary phase-out announcement.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: { status: "permitted", detail: "Permitted as E132 with maximum levels by food category.", sources: [S.euAdditivesDb] },
      UK: { status: "permitted", detail: "Permitted, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "permitted", detail: "Permitted as indigotine.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 132.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Blue No. 2).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "green-3",
    name: "FD&C Green No. 3",
    aka: ["Fast Green FCF", "Green 3", "CI 42053"],
    category: "colour",
    summary:
      "A blue-green triarylmethane dye, used in very small volumes — among the least consumed of the US certified colours.",
    whyRestricted:
      "Caught by the class-based US state bans and the federal voluntary phase-out. It is absent from the EU permitted list, which is a different thing from having been banned there.",
    foundIn: ["Tinned peas and vegetables", "Sauces and relishes", "Confectionery", "Ice cream"],
    us: {
      status: "permitted",
      detail: "Authorised and batch-certified. Covered by the April 2025 voluntary phase-out announcement.",
      sources: [S.fdaColorList, S.fdaPhaseOut],
    },
    states: [CA_SCHOOL_DYES, WV_SEVEN_DYES, TX_WARNING_LABEL],
    regions: {
      EU: {
        status: "not-authorised",
        detail:
          "Not on the Annex II permitted list, so it cannot lawfully be used — though no ban was ever issued against it by name.",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "not-authorised", detail: "Not on the permitted list inherited from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "permitted", detail: "Permitted as fast green FCF.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 143.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Green No. 3).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "citrus-red-2",
    name: "Citrus Red No. 2",
    aka: ["CI 12156"],
    category: "colour",
    summary:
      "A dye authorised for exactly one purpose: colouring the skin of oranges not intended for processing. It never reaches the flesh of the fruit.",
    whyRestricted:
      "IARC classifies it as possibly carcinogenic to humans (Group 2B). The FDA announced its intention to revoke the listing in April 2025 and published a formal proposed rule on 23 July 2026.",
    foundIn: ["Skins of some Florida-grown oranges sold fresh"],
    us: {
      status: "pending",
      detail:
        "Still authorised for the skins of mature oranges at up to 2 ppm. A proposed rule to revoke the listing published on 23 July 2026, alongside the Orange B revocation. Until a final rule issues, the authorisation stands.",
      sources: [S.citrusRed2Proposal, S.fdaPhaseOut, S.fdaColorList],
    },
    states: [],
    regions: {
      EU: { status: "not-authorised", detail: "Not on the permitted list.", sources: [S.euAdditivesDb] },
      UK: { status: "not-authorised", detail: "Not on the permitted list.", sources: [S.fsaAdditives] },
      CA: { status: "not-authorised", detail: "Not on the List of Permitted Colouring Agents.", sources: [S.hcColours] },
      ANZ: { status: "not-authorised", detail: "Not listed in Schedule 15.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "orange-b",
    name: "Orange B",
    aka: ["CI 27290"],
    category: "colour",
    summary:
      "A reddish-orange dye authorised only for the casings and surfaces of frankfurters and sausages. It has not been manufactured commercially in decades.",
    whyRestricted:
      "The FDA revoked the listing on abandonment grounds rather than on any safety finding: it concluded the authorised use had been abandoned and the regulation was outdated and unnecessary. The practical effect is housekeeping — no producer had used it in years.",
    foundIn: ["Historically: hot dog and sausage casings"],
    us: {
      status: "phase-out",
      detail:
        "The FDA issued an order on 23 July 2026 repealing the colour additive regulation, having determined the authorised use was abandoned. The revocation takes effect on 8 September 2026, after which Orange B may not be used in food.",
      effectiveDate: "2026-09-08",
      sources: [S.orangeBRevocation, S.fdaColorList],
    },
    states: [],
    regions: {
      EU: { status: "not-authorised", detail: "Not on the permitted list.", sources: [S.euAdditivesDb] },
      UK: { status: "not-authorised", detail: "Not on the permitted list.", sources: [S.fsaAdditives] },
      CA: { status: "not-authorised", detail: "Not on the List of Permitted Colouring Agents.", sources: [S.hcColours] },
      ANZ: { status: "not-authorised", detail: "Not listed in Schedule 15.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2026-08-31",
  },
  {
    slug: "amaranth-red-2",
    name: "Amaranth (FD&C Red No. 2)",
    aka: ["E123", "Red 2", "CI 16185"],
    eNumber: "E123",
    category: "colour",
    summary:
      "Once the most widely used red dye in the United States. A case that runs the other way: banned in the US, still permitted in Europe.",
    whyRestricted:
      "The FDA withdrew the authorisation in 1976 after Soviet studies and subsequent US testing raised questions about carcinogenicity. The stated basis was that the data had failed to establish safety, not that harm had been demonstrated.",
    foundIn: [
      "Historically: sweets, ice cream and beverages in the US",
      "Currently: aperitif wines, spirit drinks and fish roe in the EU",
    ],
    us: {
      status: "banned",
      detail: "Authorisation withdrawn in 1976. It may not be used in food, drugs or cosmetics.",
      effectiveDate: "1976-02-13",
      sources: [S.fdaColorList],
    },
    states: [],
    regions: {
      EU: {
        status: "restricted",
        detail:
          "Permitted as E123 in a narrow set of foods — chiefly aperitif wines, spirit drinks and fish roe — and carrying the Annex V warning label.",
        sources: [S.euAdditivesDb, S.southampton],
      },
      UK: { status: "restricted", detail: "The same narrow permissions, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "restricted", detail: "Permitted as amaranth in a limited set of foods.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 123.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (Red No. 2).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "titanium-dioxide",
    name: "Titanium dioxide",
    aka: ["E171", "TiO2", "CI 77891"],
    eNumber: "E171",
    category: "colour",
    summary:
      "A bright white pigment used for opacity in coatings, icings and chewing gum. The clearest live disagreement between regulators anywhere in this dataset.",
    whyRestricted:
      "EFSA concluded in 2021 that it could no longer be considered safe as a food additive, because genotoxicity could not be ruled out and no acceptable daily intake could be set. Health Canada's 2022 review of substantially the same literature reached the opposite conclusion, the UK declined to follow the EU, and the FDA has not acted.",
    foundIn: ["Chewing gum", "Coated confectionery", "Icings and frostings", "Some sauces and dressings"],
    us: {
      status: "permitted",
      detail:
        "Authorised as a colour additive at up to 1 percent by weight of the food. A 2023 colour-additive petition asking the FDA to revoke that authorisation remains pending.",
      sources: [S.fdaColorList],
    },
    states: [
      {
        code: "CA",
        name: "California",
        status: "permitted",
        bill: "AB 418 (struck)",
        detail:
          "Titanium dioxide appeared in the original AB 418 text but was removed before passage. It is not restricted by California law — a detail frequently reported incorrectly.",
        sources: [S.caAB418],
      },
    ],
    regions: {
      EU: {
        status: "banned",
        detail:
          "Removed from the permitted list by Commission Regulation 2022/63. A six-month transition ended on 7 August 2022, after which it could not be used in food.",
        effectiveDate: "2022-02-07",
        complianceDate: "2022-08-07",
        sources: [
          {
            label: "Commission Regulation (EU) 2022/63",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R0063",
          },
        ],
      },
      UK: {
        status: "permitted",
        detail:
          "The UK did not follow the EU. The FSA and the Committee on Toxicity reviewed the EFSA opinion and concluded the evidence did not support removal, leaving E171 permitted in England, Scotland and Wales.",
        sources: [
          {
            label: "FSA — food additives (E171 remains authorised in Great Britain)",
            url: "https://www.food.gov.uk/safety-hygiene/food-additives",
          },
        ],
      },
      CA: {
        status: "permitted",
        detail:
          "Health Canada's 2022 state-of-the-science report found the available evidence did not demonstrate a health concern at food-additive levels.",
        sources: [
          {
            label: "Health Canada — titanium dioxide as a food additive: current science report",
            url: "https://www.canada.ca/en/health-canada/services/food-nutrition/reports-publications/titanium-dioxide-food-additive-science-report.html",
          },
        ],
      },
      ANZ: {
        status: "permitted",
        detail: "FSANZ reviewed the EFSA opinion in 2022 and found no evidence of harm at dietary exposures. Permitted as INS 171.",
        sources: [S.fsanz],
      },
      JP: { status: "permitted", detail: "Permitted as a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "quinoline-yellow",
    name: "Quinoline Yellow",
    aka: ["E104", "CI 47005"],
    eNumber: "E104",
    category: "colour",
    summary:
      "A greenish-yellow dye permitted across Europe but never authorised for food in the United States — the reverse of the usual pattern.",
    whyRestricted:
      "A Southampton-study dye subject to the EU warning label, and one whose acceptable daily intake EFSA lowered substantially in 2009. It is simply not on the US list of colours certified for food.",
    foundIn: ["Smoked fish and fish roe products", "Soft drinks and sweets in Europe", "Some sauces and seasonings"],
    us: {
      status: "not-authorised",
      detail:
        "Never approved as a food colour additive in the US. It is permitted for externally applied drugs and cosmetics as D&C Yellow No. 10.",
      sources: [S.fdaColorList],
    },
    states: [],
    regions: {
      EU: { status: "restricted", detail: EU_WARNING, sources: [S.euAnnexII, S.southampton] },
      UK: {
        status: "restricted",
        detail: "Warning label required, and covered by the FSA's 2008 voluntary withdrawal request.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "not-authorised", detail: "Not on the List of Permitted Colouring Agents.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 104.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive for food use.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "ponceau-4r",
    name: "Ponceau 4R",
    aka: ["E124", "Cochineal Red A", "CI 16255"],
    eNumber: "E124",
    category: "colour",
    summary: "A strawberry-red azo dye used across Europe and Asia, never authorised for US food.",
    whyRestricted:
      "A Southampton-study dye carrying the EU warning label, with an acceptable daily intake EFSA lowered in 2009. The US never certified it for food use.",
    foundIn: ["Tinned strawberries and fruit fillings", "Sausages and surimi in Europe", "Jellies and sweets"],
    us: {
      status: "not-authorised",
      detail: "Not on the list of colour additives certified for food use in the United States.",
      sources: [S.fdaColorList],
    },
    states: [],
    regions: {
      EU: { status: "restricted", detail: EU_WARNING, sources: [S.euAnnexII, S.southampton] },
      UK: {
        status: "restricted",
        detail: "Warning label required, and covered by the FSA's 2008 voluntary withdrawal request.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "restricted", detail: "Permitted in a narrow set of foods.", sources: [S.hcColours] },
      ANZ: { status: "permitted", detail: "Permitted as INS 124.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as a designated additive (New Coccine, Red No. 102).", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
];
