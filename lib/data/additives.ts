import type { Ingredient } from "../types";
import { S } from "./sources";

/** Preservatives, flour treatments, emulsifiers, sweeteners and fats. */
export const additives: Ingredient[] = [
  {
    slug: "brominated-vegetable-oil",
    name: "Brominated vegetable oil",
    aka: ["BVO", "E443"],
    category: "emulsifier-stabiliser",
    summary:
      "Vegetable oil bonded with bromine, used to keep citrus flavour oils suspended in soft drinks rather than floating to the top.",
    whyRestricted:
      "Bromine accumulates in body fat and tissue. FDA and NIH toxicology studies published in 2022 and 2023 found thyroid effects in rats at levels close to plausible human intake, which is what moved the agency after decades of interim status.",
    foundIn: ["Citrus-flavoured sodas", "Some sports drinks", "Historically: store-brand citrus soft drinks"],
    us: {
      status: "banned",
      detail:
        "The FDA revoked the authorisation on 2 July 2024, effective 2 August 2024, with a one-year compliance period that closed on 2 August 2025. BVO may no longer be used in food.",
      effectiveDate: "2024-08-02",
      complianceDate: "2025-08-02",
      sources: [
        {
          label: "FDA final rule revoking BVO (89 FR 55040)",
          url: "https://www.federalregister.gov/documents/2024/07/03/2024-14300/revocation-of-authorization-for-use-of-brominated-vegetable-oil-in-food",
        },
      ],
    },
    states: [
      {
        code: "CA",
        name: "California",
        status: "pending",
        bill: "AB 418",
        detail:
          "California banned BVO from 1 January 2027 under the California Food Safety Act, more than two years before the federal rule caught up. The federal ban now bites first.",
        effectiveDate: "2027-01-01",
        sources: [S.caAB418],
      },
    ],
    regions: {
      EU: { status: "not-authorised", detail: "Not on the Annex II permitted list.", sources: [S.euAdditivesDb] },
      UK: { status: "not-authorised", detail: "Not on the permitted list.", sources: [S.fsaAdditives] },
      CA: {
        status: "restricted",
        detail:
          "Historically permitted in citrus-flavoured beverages under an interim marketing authorisation at up to 15 ppm. Health Canada has consulted on removing it.",
        sources: [S.hcPermitted],
      },
      ANZ: { status: "not-authorised", detail: "Not listed in Schedule 15.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "potassium-bromate",
    name: "Potassium bromate",
    aka: ["E924 (withdrawn)", "Bromated flour"],
    category: "flour-treatment",
    summary:
      "A dough conditioner that strengthens gluten and speeds rising. In theory it fully converts to harmless bromide during baking; in practice residues survive when baking is imperfect.",
    whyRestricted:
      "IARC classifies it as possibly carcinogenic to humans (Group 2B) on the basis of kidney and thyroid tumours in animal studies. The regulatory disagreement is about residues: the FDA relies on complete conversion during baking, while other regulators concluded that cannot be assured in practice.",
    foundIn: ["Commercial bread and rolls", "Bread crumbs and flatbreads", "Some baking flours sold as 'bromated'"],
    us: {
      status: "permitted",
      detail:
        "Still permitted federally as a flour treatment agent, at capped levels. The FDA has urged voluntary discontinuation since the early 1990s without regulating it out. California requires a Proposition 65 cancer warning.",
      sources: [S.fdaAdditiveList],
    },
    states: [
      {
        code: "CA",
        name: "California",
        status: "pending",
        bill: "AB 418",
        detail: "Banned from manufacture, sale and distribution statewide from 1 January 2027.",
        effectiveDate: "2027-01-01",
        sources: [S.caAB418],
      },
    ],
    regions: {
      EU: { status: "banned", detail: "Prohibited as a flour treatment agent across the EU since 1990.", sources: [S.euAdditivesDb] },
      UK: { status: "banned", detail: "Prohibited; the UK banned it in 1990, ahead of the EU-wide measure.", sources: [S.fsaAdditives] },
      CA: { status: "banned", detail: "Removed from the permitted list by Health Canada in 1994.", sources: [S.hcPermitted] },
      ANZ: { status: "not-authorised", detail: "Not permitted as a processing aid or additive.", sources: [S.fsanz] },
      JP: {
        status: "restricted",
        detail:
          "Permitted in bread-making only, on condition that no residue is detectable in the finished product. Major Japanese bakers have moved away from it voluntarily.",
        sources: [S.jpAdditives],
      },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "propylparaben",
    name: "Propylparaben",
    aka: ["Propyl p-hydroxybenzoate", "E216 (withdrawn)"],
    category: "preservative",
    summary: "An antimicrobial preservative used to extend shelf life in baked goods and tortillas.",
    whyRestricted:
      "EFSA withdrew the acceptable daily intake in 2004 after studies reported effects on sex hormones and sperm counts in juvenile rats, and the EU removed it from the permitted list in 2006. In the US it entered the food supply through the GRAS route and has never been re-reviewed at the same depth.",
    foundIn: ["Tortillas and flatbreads", "Packaged muffins and pastries", "Some corn syrups and food dyes"],
    us: {
      status: "permitted",
      detail:
        "Permitted under a GRAS listing at up to 0.1 percent. A 2018 food-additive petition asking the FDA to revoke that listing has not been resolved.",
      sources: [S.fdaAdditiveList, S.fdaGras],
    },
    states: [
      {
        code: "CA",
        name: "California",
        status: "pending",
        bill: "AB 418",
        detail: "Banned from manufacture, sale and distribution statewide from 1 January 2027.",
        effectiveDate: "2027-01-01",
        sources: [S.caAB418],
      },
      {
        code: "WV",
        name: "West Virginia",
        status: "pending",
        bill: "HB 2354",
        detail: "Prohibited statewide from 2028, alongside seven synthetic dyes and BHA. The school-meal prohibition took effect in August 2025.",
        effectiveDate: "2028-01-01",
        schoolsEffectiveDate: "2025-08-01",
        sources: [S.wvHB2354],
      },
    ],
    regions: {
      EU: {
        status: "banned",
        detail: "Removed from the list of permitted food additives in 2006 after EFSA withdrew the acceptable daily intake.",
        effectiveDate: "2006-01-01",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "banned", detail: "Not permitted; the UK carried over the EU removal.", sources: [S.fsaAdditives] },
      CA: { status: "restricted", detail: "Permitted in a limited set of foods at capped levels.", sources: [S.hcPermitted] },
      ANZ: { status: "restricted", detail: "Permitted as INS 216 in limited categories.", sources: [S.fsanz] },
      JP: { status: "restricted", detail: "Permitted with use standards by food category.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "azodicarbonamide",
    name: "Azodicarbonamide",
    aka: ["ADA", "E927a (withdrawn)"],
    category: "flour-treatment",
    summary:
      "A dough conditioner and flour bleaching agent, also used as a blowing agent in foamed plastics — the origin of the 'yoga mat chemical' label.",
    whyRestricted:
      "Its breakdown products, semicarbazide and urethane, are the concern rather than ADA itself. The WHO has linked occupational inhalation exposure to asthma. The EU banned it as a food additive and separately barred it from food-contact plastics in 2005.",
    foundIn: ["Commercial bread and buns", "Fast-food sandwich rolls", "Packaged baked goods"],
    us: {
      status: "permitted",
      detail:
        "Permitted as a dough conditioner and bleaching agent at up to 45 ppm of flour. Many large US chains removed it voluntarily after 2014 public pressure, but it remains lawful.",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: { status: "banned", detail: "Not permitted as a food additive, and barred from food-contact plastics since 2005.", sources: [S.euAdditivesDb] },
      UK: { status: "banned", detail: "Not permitted, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "restricted", detail: "Permitted as a flour treatment agent at up to 45 ppm.", sources: [S.hcPermitted] },
      ANZ: { status: "not-authorised", detail: "Not permitted as a food additive or processing aid.", sources: [S.fsanz] },
      JP: { status: "restricted", detail: "Permitted for flour treatment with use standards.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "bha",
    name: "Butylated hydroxyanisole (BHA)",
    aka: ["E320", "BHA"],
    eNumber: "E320",
    category: "preservative",
    summary: "A synthetic antioxidant that stops fats and oils turning rancid, in use since the 1940s.",
    whyRestricted:
      "The US National Toxicology Program lists BHA as reasonably anticipated to be a human carcinogen, on the basis of forestomach tumours in rodents — an organ humans do not have, which is the crux of the disagreement over its relevance. It is also listed under California Proposition 65.",
    foundIn: ["Cereals and snack foods", "Cured and preserved meats", "Chewing gum", "Shortenings and lard"],
    us: {
      status: "permitted",
      detail:
        "Permitted as GRAS and as a direct food additive at capped levels, despite the NTP listing. California requires a Proposition 65 cancer warning.",
      sources: [S.fdaAdditiveList],
    },
    states: [
      {
        code: "WV",
        name: "West Virginia",
        status: "pending",
        bill: "HB 2354",
        detail: "Prohibited statewide from 2028, alongside seven synthetic dyes and propylparaben.",
        effectiveDate: "2028-01-01",
        schoolsEffectiveDate: "2025-08-01",
        sources: [S.wvHB2354],
      },
    ],
    regions: {
      EU: { status: "restricted", detail: "Permitted as E320 in named foods at capped levels, chiefly fats and oils.", sources: [S.euAdditivesDb] },
      UK: { status: "restricted", detail: "Permitted at capped levels, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "restricted", detail: "Permitted at capped levels by food class.", sources: [S.hcPermitted] },
      ANZ: { status: "restricted", detail: "Permitted as INS 320 at capped levels.", sources: [S.fsanz] },
      JP: { status: "restricted", detail: "Permitted with use standards by food category.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "partially-hydrogenated-oils",
    name: "Partially hydrogenated oils",
    aka: ["PHOs", "Artificial trans fat"],
    category: "fat",
    summary:
      "Liquid oils hardened by adding hydrogen, once ubiquitous in margarine, frying fats and baked goods. The principal source of artificial trans fat in the diet.",
    whyRestricted:
      "Trans fat raises LDL cholesterol and lowers HDL, and the evidence linking it to coronary heart disease is unusually strong for a nutrition question. The FDA concluded in 2015 that there is no safe level and no longer considered PHOs generally recognised as safe.",
    foundIn: [
      "Historically: margarine and shortening",
      "Historically: microwave popcorn, frozen pizza, coffee creamers",
      "Historically: commercial frying oils",
    ],
    us: {
      status: "banned",
      detail:
        "The FDA determined in June 2015 that PHOs are not GRAS. After extensions, all uses had to cease by 1 January 2021. This is the most consequential US food-additive removal of the last twenty years.",
      effectiveDate: "2015-06-17",
      complianceDate: "2021-01-01",
      sources: [
        {
          label: "FDA final determination on PHOs (80 FR 34650)",
          url: "https://www.federalregister.gov/documents/2015/06/17/2015-14883/final-determination-regarding-partially-hydrogenated-oils",
        },
      ],
    },
    states: [],
    regions: {
      EU: {
        status: "restricted",
        detail:
          "Rather than banning PHOs, the EU capped industrial trans fat at 2 grams per 100 grams of fat in food for the final consumer, from April 2021.",
        effectiveDate: "2021-04-02",
        sources: [
          {
            label: "Commission Regulation (EU) 2019/649",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019R0649",
          },
        ],
      },
      UK: {
        status: "permitted",
        detail:
          "No legal limit. The UK relies on a voluntary industry reformulation programme, which has cut intake to well below WHO thresholds.",
        sources: [S.fsaAdditives],
      },
      CA: {
        status: "banned",
        detail:
          "PHOs were added to Part 1 of the List of Contaminants and Other Adulterating Substances, prohibiting their use from 17 September 2018. A two-year sell-through allowed stock made before that date to be sold until September 2020.",
        effectiveDate: "2018-09-17",
        complianceDate: "2020-09-17",
        sources: [
          {
            label: "Health Canada — Notice of Modification prohibiting PHOs in foods",
            url: "https://www.canada.ca/en/health-canada/services/food-nutrition/public-involvement-partnerships/modification-prohibiting-use-partially-hydrogenated-oils-in-foods.html",
          },
        ],
      },
      ANZ: { status: "permitted", detail: "No legal limit; FSANZ relies on monitoring and voluntary reformulation.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "No legal limit; labelling guidance only.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "cyclamate",
    name: "Cyclamate",
    aka: ["Sodium cyclamate", "E952"],
    eNumber: "E952",
    category: "sweetener",
    summary:
      "A non-nutritive sweetener about 30 times sweeter than sugar. Banned in the US since 1970 and permitted across most of the rest of the world — the clearest reversal of the usual direction.",
    whyRestricted:
      "A 1969 study reported bladder tumours in rats fed a cyclamate–saccharin mixture, triggering a Delaney Clause ban. Later work did not support the finding, and the FDA's own review board concluded in 1984 that cyclamate is not carcinogenic — but the petition to reinstate it, filed in 1982, has never been acted on.",
    foundIn: ["Tabletop sweeteners outside the US", "Diet soft drinks in Europe and Canada", "Sugar-free confectionery"],
    us: {
      status: "banned",
      detail:
        "Banned from food in 1970. A petition to restore the authorisation has been pending with the FDA since 1982 and remains undecided.",
      effectiveDate: "1970-08-14",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: { status: "restricted", detail: "Permitted as E952 in named foods at capped levels.", sources: [S.euAdditivesDb] },
      UK: { status: "restricted", detail: "Permitted at capped levels, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: {
        status: "restricted",
        detail: "Permitted only as a tabletop sweetener and in some drugs, not as a general food additive.",
        sources: [S.hcPermitted],
      },
      ANZ: { status: "restricted", detail: "Permitted as INS 952 at capped levels.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive; Japan withdrew approval in 1969.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "olestra",
    name: "Olestra",
    aka: ["Olean", "Sucrose polyester"],
    category: "fat",
    summary:
      "A synthetic fat substitute whose molecules are too large to be absorbed, so it passes through the gut contributing no calories.",
    whyRestricted:
      "It carries fat-soluble vitamins out of the body with it, and caused digestive effects severe enough that the FDA required a warning label from 1996 to 2003. Canada and the UK never approved it at all.",
    foundIn: ["Historically: fat-free crisps and snacks in the US"],
    us: {
      status: "permitted",
      detail:
        "Approved in 1996 and still authorised for savoury snacks, with added vitamins A, D, E and K to offset depletion. The mandatory warning label was dropped in 2003. Commercial use has largely ended.",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: { status: "not-authorised", detail: "Never approved for use in food.", sources: [S.euAdditivesDb] },
      UK: { status: "not-authorised", detail: "Never approved for use in food.", sources: [S.fsaAdditives] },
      CA: { status: "not-authorised", detail: "Health Canada has not approved olestra as a food additive.", sources: [S.hcPermitted] },
      ANZ: { status: "not-authorised", detail: "Not listed in the Food Standards Code.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "benzoyl-peroxide",
    name: "Benzoyl peroxide",
    aka: ["Flour bleaching agent", "E928 (withdrawn)"],
    category: "flour-treatment",
    summary: "A bleaching agent that whitens freshly milled flour in days rather than the weeks natural ageing takes.",
    whyRestricted:
      "The EU removed it from the permitted list, and several regulators concluded that artificial bleaching offers no benefit to the consumer to weigh against any residual risk. It also destroys some of the flour's carotenoid and vitamin E content.",
    foundIn: ["Bleached white flour", "Cake and pastry flours", "Some whey and cheese products"],
    us: {
      status: "permitted",
      detail: "Permitted as a bleaching agent for flour and certain cheeses, at levels sufficient for the effect.",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: { status: "banned", detail: "Removed from the permitted list; flour may not be artificially bleached.", sources: [S.euAdditivesDb] },
      UK: {
        status: "banned",
        detail: "Prohibited as a flour bleaching agent; the UK banned it in 1997, ahead of the EU-wide position.",
        sources: [S.fsaAdditives],
      },
      CA: { status: "restricted", detail: "Permitted as a flour bleaching agent at capped levels.", sources: [S.hcPermitted] },
      ANZ: { status: "restricted", detail: "Permitted as a processing aid at capped levels.", sources: [S.fsanz] },
      JP: { status: "restricted", detail: "Permitted for flour bleaching with use standards.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "carrageenan",
    name: "Carrageenan",
    aka: ["E407", "Irish moss extract"],
    eNumber: "E407",
    category: "emulsifier-stabiliser",
    summary:
      "A thickener and stabiliser extracted from red seaweed, used to stop plant milks separating and to give dairy products body.",
    whyRestricted:
      "Degraded carrageenan (poligeenan) causes intestinal inflammation in animals and is classified by IARC as possibly carcinogenic. Food-grade carrageenan is a different, larger molecule, and the dispute is over how much degradation occurs during digestion. The EU acted narrowly, restricting it in infant formula.",
    foundIn: ["Plant-based milks", "Ice cream and cream products", "Deli meats", "Infant formula outside the EU"],
    us: {
      status: "permitted",
      detail:
        "Permitted as a direct food additive, including in infant formula. The National Organic Standards Board voted in 2016 to remove it from the organic list, but the USDA declined to follow.",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: {
        status: "restricted",
        detail: "Permitted as E407 generally, but prohibited in infant formula and follow-on formula.",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "restricted", detail: "The same infant-formula restriction, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "restricted", detail: "Permitted at capped levels; restricted in infant formula.", sources: [S.hcPermitted] },
      ANZ: { status: "permitted", detail: "Permitted as INS 407.", sources: [S.fsanz] },
      JP: { status: "permitted", detail: "Permitted as an existing additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
];
