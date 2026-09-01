import type { Ingredient } from "../types";
import { S } from "./sources";

/**
 * Animal drugs and processing treatments. These are not "additives" in the
 * regulatory sense, but they are the substance of most US-versus-EU food
 * arguments, so the tracker covers them under the same schema.
 */
export const practices: Ingredient[] = [
  {
    slug: "ractopamine",
    name: "Ractopamine",
    aka: ["Paylean", "Optaflexx"],
    category: "animal-drug",
    summary:
      "A beta-agonist fed to pigs and cattle in the weeks before slaughter to shift growth from fat to lean muscle.",
    whyRestricted:
      "The EU concluded that the data were insufficient to set a safe residue level, citing cardiovascular effects and a very thin human study base — the pivotal human trial involved six volunteers, one of whom was withdrawn. Codex adopted maximum residue limits in 2012 by a 69–67 vote, one of the closest in its history.",
    foundIn: ["US pork and beef", "Feed for finishing pigs and cattle"],
    us: {
      status: "permitted",
      detail:
        "Approved by the FDA for pigs in 1999 and cattle in 2003, with residue limits set by the USDA. Several US processors have moved to ractopamine-free supply chains to serve export markets that reject it.",
      sources: [
        {
          label: "FDA — Animal Drugs @ FDA",
          url: "https://animaldrugsatfda.fda.gov/",
        },
      ],
    },
    states: [],
    regions: {
      EU: {
        status: "banned",
        detail: "Prohibited in food-producing animals, and imports of meat from treated animals are not accepted.",
        sources: [
          {
            label: "EFSA — opinion on ractopamine residues",
            url: "https://www.efsa.europa.eu/en/efsajournal/pub/1041",
          },
        ],
      },
      UK: { status: "banned", detail: "Prohibited; the UK retained the EU position after 2021.", sources: [S.fsaAdditives] },
      CA: {
        status: "permitted",
        detail: "Approved for use in pigs and cattle, with maximum residue limits set by Health Canada.",
        sources: [S.hcPermitted],
      },
      ANZ: {
        status: "restricted",
        detail: "Registered in Australia with residue limits. New Zealand does not permit its use.",
        sources: [S.fsanz],
      },
      JP: {
        status: "restricted",
        detail: "Not approved for domestic use, but Japan accepts imported meat within Codex residue limits.",
        sources: [S.jpAdditives],
      },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "rbst",
    name: "Recombinant bovine somatotropin (rBST)",
    aka: ["rBGH", "Bovine growth hormone", "Posilac"],
    category: "animal-drug",
    summary: "A genetically engineered growth hormone injected into dairy cows to raise milk yield.",
    whyRestricted:
      "The bans elsewhere rest on animal welfare rather than human food safety. Health Canada and the EU both found increased mastitis, lameness and reproductive problems in treated cows. Regulators broadly agree the milk itself poses no established human health risk.",
    foundIn: ["Conventional US milk and dairy, unless labelled rBST-free"],
    us: {
      status: "permitted",
      detail:
        "Approved by the FDA in 1993. Voluntary 'no rBST' labelling is widespread and much of the US dairy sector has moved away from it, but its use remains lawful.",
      sources: [
        {
          label: "FDA — bovine somatotropin (bST)",
          url: "https://www.fda.gov/animal-veterinary/product-safety-information/bovine-somatotropin-bst",
        },
      ],
    },
    states: [],
    regions: {
      EU: {
        status: "banned",
        detail: "Prohibited across the EU since 1 January 2000, on animal welfare grounds.",
        effectiveDate: "2000-01-01",
        sources: [
          {
            label: "Council Decision 1999/879/EC",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A31999D0879",
          },
        ],
      },
      UK: { status: "banned", detail: "Prohibited; the UK retained the EU ban.", sources: [S.fsaAdditives] },
      CA: {
        status: "banned",
        detail:
          "Health Canada declined to approve rBST in 1999, citing harm to cow health. It has never been licensed for sale in Canada.",
        effectiveDate: "1999-01-14",
        sources: [S.hcPermitted],
      },
      ANZ: { status: "not-authorised", detail: "Not registered for use in dairy cattle.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not approved for use in dairy cattle.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "chlorine-washed-poultry",
    name: "Chlorine-washed poultry",
    aka: ["Pathogen reduction treatments", "PRTs", "Chlorinated chicken"],
    category: "process",
    summary:
      "Rinsing poultry carcasses in chlorine dioxide or similar antimicrobials at the end of processing to reduce surface pathogens.",
    whyRestricted:
      "EFSA found no safety concern from chlorine residues themselves. The EU's objection is systemic: that an end-of-line wash allows lower hygiene standards earlier in the chain, whereas EU rules require contamination to be controlled at every stage. This became the defining symbol of the UK's post-Brexit trade debate.",
    foundIn: ["US chicken and turkey processing"],
    us: {
      status: "permitted",
      detail: "Permitted and routine. The USDA approves a list of antimicrobial processing aids for poultry.",
      sources: [
        {
          label: "USDA FSIS — safe and suitable ingredients",
          url: "https://www.fsis.usda.gov/policy/fsis-directives/7120.1",
        },
      ],
    },
    states: [],
    regions: {
      EU: {
        status: "banned",
        detail:
          "Only water and, where approved, lactic acid may be used to decontaminate carcasses. Poultry treated with chlorine cannot be imported.",
        sources: [
          {
            label: "Regulation (EC) 853/2004 on hygiene of food of animal origin",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32004R0853",
          },
        ],
      },
      UK: { status: "banned", detail: "Prohibited; the UK retained the EU position after leaving the single market.", sources: [S.fsaAdditives] },
      CA: { status: "permitted", detail: "Antimicrobial rinses are permitted in poultry processing.", sources: [S.hcPermitted] },
      ANZ: {
        status: "restricted",
        detail: "Some antimicrobial processing aids are permitted, subject to approval and residue limits.",
        sources: [S.fsanz],
      },
      JP: { status: "permitted", detail: "Antimicrobial processing aids are permitted in poultry processing.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "antibiotic-growth-promoters",
    name: "Antibiotics for growth promotion",
    aka: ["AGPs", "Sub-therapeutic antibiotics"],
    category: "animal-drug",
    summary:
      "Feeding medically important antibiotics to healthy livestock at low doses to speed weight gain, as distinct from treating sick animals.",
    whyRestricted:
      "Sub-therapeutic dosing selects for resistant bacteria, which can transfer to humans. This is one of the few areas where the US and EU have converged, though the EU moved roughly a decade earlier and its prohibition is broader.",
    foundIn: ["Livestock feed and drinking water"],
    us: {
      status: "banned",
      detail:
        "Since January 2017, medically important antibiotics may no longer be used for growth promotion, and remaining therapeutic uses in feed require veterinary oversight under a Veterinary Feed Directive.",
      effectiveDate: "2017-01-01",
      sources: [
        {
          label: "FDA Guidance for Industry #213",
          url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cvm-gfi-213-new-animal-drugs-and-new-animal-drug-combination-products-administered-or-medicated-feed",
        },
      ],
    },
    states: [],
    regions: {
      EU: {
        status: "banned",
        detail:
          "Antibiotic growth promoters have been prohibited since 1 January 2006. Regulation 2019/6 extended this in 2022 to bar routine prophylactic group treatment.",
        effectiveDate: "2006-01-01",
        sources: [
          {
            label: "Regulation (EU) 2019/6 on veterinary medicinal products",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019R0006",
          },
        ],
      },
      UK: { status: "banned", detail: "Prohibited since 2006; the UK retained the position after 2021.", sources: [S.fsaAdditives] },
      CA: {
        status: "banned",
        detail: "Growth promotion claims for medically important antibiotics were removed in 2018, and they became prescription-only.",
        effectiveDate: "2018-12-01",
        sources: [S.hcPermitted],
      },
      ANZ: { status: "banned", detail: "Australia has never registered several key growth promoters and prohibits others.", sources: [S.fsanz] },
      JP: {
        status: "restricted",
        detail: "Several growth promoters have been withdrawn, but some non-medically-important agents remain permitted.",
        sources: [S.jpAdditives],
      },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "safrole",
    name: "Safrole",
    aka: ["Sassafras oil", "Shikimol"],
    category: "preservative",
    summary:
      "The aromatic compound that gave traditional root beer its flavour, extracted from sassafras root bark.",
    whyRestricted:
      "Safrole caused liver tumours in rodents, and the FDA banned it in 1960 under the Delaney Clause. Root beer has been made with safrole-free sassafras extract ever since.",
    foundIn: ["Historically: root beer and sassafras tea", "Some essential oils, not for food use"],
    us: {
      status: "banned",
      detail: "Prohibited as a food additive since 1960. Sassafras bark and oil containing safrole may not be used in food.",
      effectiveDate: "1960-12-03",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: {
        status: "restricted",
        detail: "Not permitted as an added flavouring; capped at low limits where it occurs naturally in food.",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "restricted", detail: "The same natural-occurrence limits, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "banned", detail: "Prohibited as a food additive.", sources: [S.hcPermitted] },
      ANZ: { status: "restricted", detail: "Capped where naturally present; not permitted as an added flavouring.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
  {
    slug: "coumarin",
    name: "Coumarin",
    aka: ["Tonka bean extract", "1,2-benzopyrone"],
    category: "preservative",
    summary:
      "A sweet, hay-like flavour compound found naturally in tonka beans, cassia cinnamon and sweet clover.",
    whyRestricted:
      "Coumarin causes liver damage in rodents and in sensitive people. The FDA banned it as an added flavouring in 1954. The EU took a different route, capping it in named foods rather than prohibiting the substance, since it occurs naturally in cassia cinnamon.",
    foundIn: ["Historically: vanilla substitutes and tobacco flavourings", "Naturally: cassia cinnamon, tonka beans"],
    us: {
      status: "banned",
      detail: "Prohibited as an added food ingredient since 1954. Tonka bean is not permitted in food.",
      effectiveDate: "1954-01-01",
      sources: [S.fdaAdditiveList],
    },
    states: [],
    regions: {
      EU: {
        status: "restricted",
        detail:
          "Not permitted as an added flavouring, but capped by food category where it arrives naturally through cinnamon or other ingredients.",
        sources: [S.euAdditivesDb],
      },
      UK: { status: "restricted", detail: "The same category caps, carried over from EU law.", sources: [S.fsaAdditives] },
      CA: { status: "banned", detail: "Prohibited as an added food ingredient.", sources: [S.hcPermitted] },
      ANZ: { status: "restricted", detail: "Capped where naturally present; not permitted as an added flavouring.", sources: [S.fsanz] },
      JP: { status: "not-authorised", detail: "Not a designated additive.", sources: [S.jpAdditives] },
    },
    lastVerified: "2025-12-01",
  },
];
