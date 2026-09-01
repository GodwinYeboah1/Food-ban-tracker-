import type { ChangeEvent } from "./types";
import { S } from "./data/sources";

/**
 * Verified changes to the legal record, newest first.
 *
 * This list is curated and hand-checked rather than machine-generated. The
 * daily sync in /api/cron/sync-bans feeds a review queue; entries only reach
 * this file once a human has confirmed what the document actually did.
 */
export const TIMELINE: ChangeEvent[] = [
  {
    id: "orange-b-effective",
    date: "2026-09-08",
    region: "US",
    title: "Orange B revocation takes effect",
    detail:
      "The FDA's July 2026 order repealing the Orange B colour additive regulation comes into force. Orange B may no longer be used on frankfurter and sausage casings.",
    ingredients: ["orange-b"],
    status: "banned",
    sources: [S.orangeBRevocation],
  },
  {
    id: "orange-b-revoked",
    date: "2026-07-23",
    region: "US",
    title: "FDA revokes the Orange B listing and proposes revoking Citrus Red No. 2",
    detail:
      "Two of the three announcements made in April 2025 reach the Federal Register. Orange B is repealed by final order on the ground that its authorised use had been abandoned — not on a safety finding. Citrus Red No. 2 gets only a proposed rule, so it stays authorised for orange skins for now.",
    ingredients: ["orange-b", "citrus-red-2"],
    status: "phase-out",
    sources: [S.orangeBRevocation, S.citrusRed2Proposal],
  },
  {
    id: "natural-colour-listings",
    date: "2026-02-06",
    region: "US",
    title: "FDA lists more natural colours as the synthetic dye phase-out proceeds",
    detail:
      "Beetroot red and spirulina extract join galdieria extract blue, butterfly pea flower extract, calcium phosphate and gardenia blue, all listed as exempt from certification since early 2025. The listings supply replacements for the petroleum-based dyes the agency has asked industry to drop — the enabling half of a phase-out that remains voluntary.",
    ingredients: ["red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3"],
    status: "pending",
    sources: [S.naturalColours2025],
  },
  {
    id: "wv-hb2354-schools",
    date: "2025-08-01",
    region: "US",
    state: "WV",
    title: "West Virginia's school-meal dye prohibition takes effect",
    detail:
      "The first operative provision of HB 2354 begins: seven synthetic dyes may no longer be served in West Virginia school meals. The statewide retail prohibition follows in 2028.",
    ingredients: ["red-3", "red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3", "bha", "propylparaben"],
    status: "banned",
    sources: [S.wvHB2354],
  },
  {
    id: "bvo-compliance",
    date: "2025-08-02",
    region: "US",
    title: "Brominated vegetable oil compliance deadline passes",
    detail:
      "The one-year compliance window from the FDA's 2024 revocation closes. BVO may no longer be used in food sold in the United States.",
    ingredients: ["brominated-vegetable-oil"],
    status: "banned",
    sources: [
      {
        label: "FDA final rule revoking BVO (89 FR 55040)",
        url: "https://www.federalregister.gov/documents/2024/07/03/2024-14300/revocation-of-authorization-for-use-of-brominated-vegetable-oil-in-food",
      },
    ],
  },
  {
    id: "tx-sb25",
    date: "2025-06-22",
    region: "US",
    state: "TX",
    title: "Texas enacts warning labels for dozens of additives",
    detail:
      "SB 25 requires a warning label on foods containing any of a long list of additives, for labels developed on or after 1 January 2027. It is a disclosure law, not a ban, and its requirements lift for any substance federal regulators act on first.",
    ingredients: ["red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3", "bha", "titanium-dioxide"],
    status: "pending",
    sources: [S.txSB25],
  },
  {
    id: "fda-dye-phaseout",
    date: "2025-04-22",
    region: "US",
    title: "FDA and HHS announce a phase-out of petroleum-based dyes",
    detail:
      "The agencies announced an intention to work with industry to remove synthetic dyes from the food supply, and said they had begun revoking the authorisations for Citrus Red No. 2 and Orange B. The phase-out itself is a voluntary target rather than a rule with legal force.",
    ingredients: ["red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3", "citrus-red-2", "orange-b"],
    status: "pending",
    sources: [S.fdaPhaseOut],
  },
  {
    id: "wv-hb2354-signed",
    date: "2025-03-24",
    region: "US",
    state: "WV",
    title: "West Virginia signs the broadest state additive law to date",
    detail:
      "HB 2354 prohibits seven synthetic dyes plus BHA and propylparaben from food sold anywhere in the state from 2028, going considerably further than California's retail ban.",
    ingredients: ["red-3", "red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3", "bha", "propylparaben"],
    status: "pending",
    sources: [S.wvHB2354],
  },
  {
    id: "red3-revoked",
    date: "2025-01-15",
    region: "US",
    title: "FDA revokes the Red No. 3 colour additive authorisation",
    detail:
      "Acting on a 2022 colour-additive petition, the FDA revoked the authorisation for food and ingested drugs under the Delaney Clause — 35 years after banning the same dye in cosmetics on the same evidence. Food must comply by January 2027.",
    ingredients: ["red-3"],
    status: "phase-out",
    sources: [S.red3Rule],
  },
  {
    id: "ca-ab2316",
    date: "2024-09-28",
    region: "US",
    state: "CA",
    title: "California bars six dyes from school food",
    detail:
      "The California School Food Safety Act (AB 2316) prohibits six synthetic dyes in food served by public schools, effective at the end of 2027. It does not touch retail sale.",
    ingredients: ["red-40", "yellow-5", "yellow-6", "blue-1", "blue-2", "green-3"],
    status: "pending",
    sources: [S.caAB2316],
  },
  {
    id: "bvo-revoked",
    date: "2024-07-02",
    region: "US",
    title: "FDA revokes the brominated vegetable oil authorisation",
    detail:
      "Following FDA and NIH toxicology work showing thyroid effects in rats, the agency ended BVO's interim authorisation, which had stood since 1970.",
    ingredients: ["brominated-vegetable-oil"],
    status: "banned",
    sources: [
      {
        label: "FDA final rule revoking BVO (89 FR 55040)",
        url: "https://www.federalregister.gov/documents/2024/07/03/2024-14300/revocation-of-authorization-for-use-of-brominated-vegetable-oil-in-food",
      },
    ],
  },
  {
    id: "ca-ab418",
    date: "2023-10-07",
    region: "US",
    state: "CA",
    title: "California enacts the first state additive ban",
    detail:
      "AB 418 bans four substances — Red 3, BVO, potassium bromate and propylparaben — from manufacture and sale statewide from 2027. Titanium dioxide was in the original draft but struck before passage. This law is widely credited with forcing federal movement on Red 3 and BVO.",
    ingredients: ["red-3", "brominated-vegetable-oil", "potassium-bromate", "propylparaben"],
    status: "pending",
    sources: [S.caAB418],
  },
  {
    id: "eu-tio2-compliance",
    date: "2022-08-07",
    region: "EU",
    title: "EU ban on titanium dioxide fully takes effect",
    detail:
      "The six-month transition under Regulation 2022/63 closes. E171 may no longer be used in food anywhere in the EU, following EFSA's 2021 finding that genotoxicity could not be ruled out. The UK, Canada and Australia/New Zealand all reviewed the same evidence and kept it permitted.",
    ingredients: ["titanium-dioxide"],
    status: "banned",
    sources: [
      {
        label: "Commission Regulation (EU) 2022/63",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R0063",
      },
    ],
  },
  {
    id: "eu-transfat-cap",
    date: "2021-04-02",
    region: "EU",
    title: "EU cap on industrial trans fat applies",
    detail:
      "Regulation 2019/649 limits industrially produced trans fat to 2 grams per 100 grams of fat in food for the final consumer — a ceiling rather than the outright US prohibition on partially hydrogenated oils.",
    ingredients: ["partially-hydrogenated-oils"],
    status: "restricted",
    sources: [
      {
        label: "Commission Regulation (EU) 2019/649",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019R0649",
      },
    ],
  },
  {
    id: "pho-compliance",
    date: "2021-01-01",
    region: "US",
    title: "Partially hydrogenated oils leave the US food supply",
    detail:
      "The final compliance date under the FDA's 2015 determination passes. PHOs, the main source of artificial trans fat, may no longer be used in food — the most consequential US additive removal in two decades.",
    ingredients: ["partially-hydrogenated-oils"],
    status: "banned",
    sources: [
      {
        label: "FDA final determination on PHOs (80 FR 34650)",
        url: "https://www.federalregister.gov/documents/2015/06/17/2015-14883/final-determination-regarding-partially-hydrogenated-oils",
      },
    ],
  },
];

export const LAST_REVIEWED = "2026-08-31";
