export type IndexInput = {
  key: "labour" | "materials" | "fuel" | "bitumen" | "cement" | "steel";
  symbol: string;
  label: string;
  source: string;
  coefficient: number;
};

export type PriceVariationReference = {
  id: string;
  organization: string;
  contractCategory: string;
  contractName: string;
  applicability: string[];
  formulaText: string;
  fixedComponent: number;
  components: IndexInput[];
  baseDateRule: string;
  adjustmentFrequency: string;
  exclusions: string[];
  ceiling: string;
  sourceUrl: string;
  clause: string;
  verifiedOn: string;
  verificationNote: string;
  reviewFlags?: string[];
  relatedSourceUrl?: string;
  relatedSourceLabel?: string;
  variables?: { symbol: string; definition: string }[];
  calculatorId: "sail-sbd-2024-civil" | "nhai-or-vii-2008";
};

// This is one tender's Contract Data, not a standard formula for the organisation.
// Do not reuse its weights or index sources for another NHAI contract.
export const priceVariationReferences: PriceVariationReference[] = [
  {
    id: "sail-sbd-2024-civil",
    organization: "Steel Authority of India Limited (SAIL)",
    contractCategory: "Civil engineering works including necessary supplies and dismantling",
    contractName: "SAIL Standard Bidding Document (SBD), updated September 2024 — Civil Engineering Works",
    applicability: [
      "Appendix 4, Sub-Clause 2.8 applies to civil engineering works including necessary supplies and dismantling, unless the contract specifies otherwise.",
      "GCC Sub-Clause 11.3.3 provides for the listed price-adjustment heads when the contractual Time for Completion exceeds 12 months, unless specifically indicated otherwise in the contract.",
      "GCC Sub-Clause 11.5.1 limits adjustment to the part of the facilities executed within the scheduled Time for Completion. Other delay situations are treated separately under Sub-Clause 11.5.",
      "For a contract with Time for Completion of 12 months or less, do not assume that the standard clause applies; check whether the signed contract specifically provides otherwise.",
      "The first price-adjustment statement is submitted after six months from the Effective Date; later statements are submitted every six months, with supporting break-up and documents.",
    ],
    formulaText: "P = P₀ × [0.35 + 0.25(RBIᵢ(cement)/RBI₀(cement)) + 0.10(RBIᵢ(steel)/RBI₀(steel)) + 0.30(LTR/LTO)]",
    fixedComponent: 0.35,
    components: [
      { key: "cement", symbol: "RBIᵢ(cement) / RBI₀(cement)", label: "Cement index ratio", source: "Wholesale price index for cement, lime and plaster; commodity 1.3.12.05 per the supplied SBD 2024 extract", coefficient: 0.25 },
      { key: "steel", symbol: "RBIᵢ(steel) / RBI₀(steel)", label: "Steel index ratio", source: "Wholesale price index for mild steel — long product; commodity 1.3.14.04 per the supplied SBD 2024 extract", coefficient: 0.1 },
      { key: "labour", symbol: "LTR / LTO", label: "Labour rate ratio", source: "Minimum rate for an unskilled worker at the SAIL plant premises or mines, based on the applicable Gazette notification; the SBD also permits stated employer circular/letter rates", coefficient: 0.3 },
    ],
    baseDateRule: "Use the Base Date recorded in the signed Contract Agreement, Sub-Clause 2.3. The SBD template gives seven days before the last date for submission of the price bid or updated price bid as its standard wording; confirm the completed agreement.",
    adjustmentFrequency: "Statements are submitted after the first six months from the Effective Date and every six months thereafter. Payment follows the contract payment terms.",
    exclusions: [
      "Prices for items quoted in foreign currency are not subject to price adjustment under Appendix 4.",
      "The labour component is payable pro rata for the lower of the quantity in the agreed bar chart and the actual quantity executed.",
      "For work beyond scheduled completion, index selection and eligibility depend on the reason for delay and the relevant provisions of GCC Sub-Clause 11.5.",
      "Taxes and duties are excluded from P₀ and P; applicable taxes on the escalation amount are handled separately under GCC Sub-Clause 11.4.3.",
    ],
    ceiling: "GCC Sub-Clause 11.4.1 sets a cumulative ceiling of plus or minus 15% of Basic Price for heads in Sub-Clause 11.3.3. The remaining ceiling depends on prior adjustments and the signed contract; this calculator does not apply a remaining-cap amount.",
    sourceUrl: "https://www.scribd.com/document/1056086852/SBD-Updated-in-September-2024",
    clause: "GCC Sub-Clauses 11.3.3, 11.4 and 11.5; Contract Agreement Sub-Clause 2.3; Appendix 4, Sub-Clauses 1.0–2.8",
    verifiedOn: "2026-10-20",
    verificationNote: "Formula and terms checked against a copy labelled SAIL SBD, updated September 2024, and the supplied extract. The linked copy is hosted on Scribd; verify the complete official tender document, signed Contract Agreement, filled-in indices and amendments before using this for a claim.",
    reviewFlags: ["The supplied SBD 2024 extract gives cement commodity 1.3.12.05. A SAIL tender-hosted SBD dated December 2022 gives 1.3.13.05. These are different document versions; this record follows the supplied 2024 value. Confirm the commodity number in the signed tender before choosing an index series."],
    relatedSourceUrl: "https://sailtenders.co.in/STDocs/DynamicPages/FileSDPchild9827710.pdf",
    relatedSourceLabel: "SAIL tender-hosted SBD copy, December 2022 (comparison version)",
    variables: [
      { symbol: "P", definition: "Revised price after adjustment, excluding taxes and duties." },
      { symbol: "P₀", definition: "Original price for the civil engineering work on the Base Date, excluding taxes and duties." },
      { symbol: "RBIᵢ", definition: "Current RBI wholesale price index selected for the execution period under Appendix 4." },
      { symbol: "RBI₀", definition: "RBI wholesale price index for the applicable commodity on the Base Date." },
      { symbol: "LTR", definition: "Applicable minimum unskilled-worker wage on the actual execution date or scheduled completion date, whichever is earlier; the stated employer labour-rate alternative may apply." },
      { symbol: "LTO", definition: "Applicable minimum unskilled-worker wage on the Base Date; the stated original employer labour-rate alternative may apply." },
    ],
    calculatorId: "sail-sbd-2024-civil",
  },
  {
    id: "nhai-nh5-or-vii-2008",
    organization: "National Highways Authority of India (NHAI)",
    contractCategory: "Highway construction — NH-5 balance works, Construction Package OR-VII",
    contractName: "Balance works of widening and strengthening of NH-5, Ganjam–Sunakhala",
    applicability: [
      "The cited bid document is for this named NH-5 package. Its terms do not establish eligibility for other NHAI contracts.",
      "Sub-Clause 70.3 applies the adjustment factor to the value of work carried out in the subject month under Sub-Clause 60.1(d), where variations and day work are not otherwise adjusted.",
      "The executed agreement, Contract Data, and any amendments must be checked before applying this reference to a live claim.",
    ],
    formulaText: "Pn = A + b(Ln/Lo) + c(Mn/Mo) + d(Fn/Fo) + e(Bn/Bo)",
    fixedComponent: 0.4,
    components: [
      { key: "labour", symbol: "L", label: "Labour", source: "Minimum wage published by the Orissa State Government", coefficient: 0.15 },
      { key: "materials", symbol: "M", label: "Materials", source: "Wholesale price index (all commodities), as stated in Sub-Clause 70.4", coefficient: 0.25 },
      { key: "fuel", symbol: "F", label: "Fuel (diesel)", source: "Price per litre applicable at Bhubaneswar", coefficient: 0.1 },
      { key: "bitumen", symbol: "B", label: "Bitumen", source: "Price per MT ex-Haldia Refinery, West Bengal, inclusive of taxes", coefficient: 0.1 },
    ],
    baseDateRule: "Base indices/prices: those prevailing 28 days before the latest bid submission date. Current indices/prices: those prevailing 28 days before the last day of the Interim Payment Certificate period.",
    adjustmentFrequency: "Per Interim Payment Certificate period (monthly in the referenced bid document).",
    exclusions: [
      "Liquidated damages",
      "Retention withheld or released",
      "Advance loans and their repayments",
      "Additional or varied work valued at current prices",
      "Payments to nominated subcontractors included as provisional sums or prime cost items",
    ],
    ceiling: "No price-adjustment ceiling is stated in the cited Sub-Clause 70.3–70.7 text. Check the complete executed contract and amendments.",
    sourceUrl: "https://nhai.gov.in/nhai/Doc/22Aug08/Conditions%20of%20Contract%20_Vol-1_.pdf",
    clause: "Conditions of Particular Application, Sub-Clauses 70.1–70.7 (PDF pages 67–68; document pages 69–70)",
    verifiedOn: "2026-10-19",
    verificationNote: "Verified against the NHAI-hosted bid document. This is a historical, package-specific reference; no later amendment or executed agreement was verified.",
    calculatorId: "nhai-or-vii-2008",
  },
];

export const organizationNames = [...new Set(priceVariationReferences.map((item) => item.organization))].sort();
