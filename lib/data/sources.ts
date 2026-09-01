import type { Source } from "../types";

/**
 * Shared primary-source links. Every claim in the dataset traces back to one of
 * these, and every one points at a government or intergovernmental publisher —
 * never at an aggregator or an advocacy group's summary of a rule.
 */
export const S = {
  red3Rule: {
    label: "FDA final rule revoking FD&C Red No. 3 (90 FR 4628)",
    url: "https://www.federalregister.gov/documents/2025/01/16/2025-00830/color-additive-petition-from-center-for-science-in-the-public-interest-et-al-request-to-revoke-color",
  },
  fdaColorList: {
    label: "FDA — Color Additive Status List",
    url: "https://www.fda.gov/industry/color-additive-inventories/color-additive-status-list",
  },
  fdaAdditiveList: {
    label: "FDA — Food Additive Status List",
    url: "https://www.fda.gov/food/food-additives-petitions/food-additive-status-list",
  },
  fdaPhaseOut: {
    label: "FDA/HHS — phase-out of petroleum-based synthetic dyes (Apr 2025)",
    url: "https://www.fda.gov/news-events/press-announcements/hhs-fda-phase-out-petroleum-based-synthetic-dyes-nations-food-supply",
  },
  orangeBRevocation: {
    label: "FDA order revoking the Orange B listing (91 FR 46276)",
    url: "https://www.federalregister.gov/documents/2026/07/23/2026-14910/revocation-of-the-color-additive-listing-for-use-of-orange-b-on-casings-or-surfaces-of-frankfurters",
  },
  citrusRed2Proposal: {
    label: "FDA proposed rule to revoke the Citrus Red No. 2 listing (Jul 2026)",
    url: "https://www.federalregister.gov/documents/2026/07/23/2026-14909/proposal-to-revoke-the-color-additive-listing-for-use-of-citrus-red-no-2-on-the-skins-of-mature",
  },
  naturalColours2025: {
    label: "FDA — colour additives exempt from certification (2025–26 listings)",
    url: "https://www.fda.gov/industry/color-additive-inventories/color-additive-status-list",
  },
  fdaGras: {
    label: "FDA — Generally Recognized as Safe (GRAS)",
    url: "https://www.fda.gov/food/food-ingredients-packaging/generally-recognized-safe-gras",
  },
  euAnnexII: {
    label: "EU Regulation 1333/2008 — Annex II permitted additives",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32008R1333",
  },
  euAdditivesDb: {
    label: "EU Food Additives Database",
    url: "https://ec.europa.eu/food/food-feed-portal/screen/food-additives",
  },
  fsaAdditives: {
    label: "FSA — food additives",
    url: "https://www.food.gov.uk/safety-hygiene/food-additives",
  },
  hcColours: {
    label: "Health Canada — List of Permitted Colouring Agents",
    url: "https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/lists-permitted/3-colouring-agents.html",
  },
  hcPermitted: {
    label: "Health Canada — Lists of Permitted Food Additives",
    url: "https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/lists-permitted.html",
  },
  fsanz: {
    label: "FSANZ — Food Standards Code, Schedule 15",
    url: "https://www.legislation.gov.au/F2015L00439/latest/text",
  },
  jpAdditives: {
    label: "JFCRF — List of Designated Food Additives (English)",
    url: "https://www.ffcr.or.jp/en/tenka/list-of-designated-additives/list-of-designated-additives.html",
  },
  codex: {
    label: "Codex Alimentarius — General Standard for Food Additives (CXS 192)",
    url: "https://www.fao.org/fao-who-codexalimentarius/codex-texts/list-standards/en/",
  },
  caAB418: {
    label: "California AB 418 — California Food Safety Act (2023)",
    url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB418",
  },
  caAB2316: {
    label: "California AB 2316 — California School Food Safety Act (2024)",
    url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2316",
  },
  wvHB2354: {
    label: "West Virginia HB 2354 (2025)",
    url: "https://www.wvlegislature.gov/Bill_Status/bills_history.cfm?INPUT=2354&year=2025&sessiontype=RS",
  },
  txSB25: {
    label: "Texas SB 25 (2025)",
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB25",
  },
  southampton: {
    label: "McCann et al. (2007), the 'Southampton study'",
    url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
  },
} as const satisfies Record<string, Source>;

/** The EU's Annex V warning label, quoted once and reused. */
export const EU_WARNING =
  'Permitted, but any food containing it must carry the warning "may have an adverse effect on activity and attention in children" under Annex V of Regulation 1333/2008.';
