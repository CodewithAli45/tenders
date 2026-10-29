import {
  AlertOctagon,
  Calculator,
  CheckSquare,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface ServiceDetail {
  slug: string;
  label: string;
  /** Short one-liner used in the navigation dropdown. */
  description: string;
  icon: LucideIcon;
  summary: string;
  includes: string[];
}

export const services: ServiceDetail[] = [
  {
    slug: "price-variation",
    label: "Price Variation",
    description: "WPI & escalation calculations",
    icon: TrendingUp,
    summary:
      "Check the price adjustment clause written into a contract, follow the cited index sources, and calculate an adjustment only where a verified formula and its inputs are available.",
    includes: [
      "Source-verified PVC references",
      "Formula-specific calculator",
      "Applicability checker",
      "Index and clause verification",
    ],
  },
  {
    slug: "registration",
    label: "Registration",
    description: "Vendor & portal registration",
    icon: ShieldCheck,
    summary:
      "Get registered as a vendor on government procurement portals with the right class, categories, and supporting documents so your bids are never rejected on eligibility grounds.",
    includes: [
      "Portal and vendor enrolment",
      "Class and category selection",
      "Document checklist review",
      "Renewal and profile updates",
    ],
  },
  {
    slug: "bid-preparation",
    label: "Bid Preparation",
    description: "Technical & financial bidding",
    icon: CheckSquare,
    summary:
      "Prepare complete technical and financial bids that answer every clause of the tender document, from EMD and eligibility papers to BOQ rates and submission formalities.",
    includes: [
      "Tender document review",
      "Technical bid compilation",
      "Financial bid and BOQ rates",
      "Submission compliance check",
    ],
  },
  {
    slug: "clarification-submission",
    label: "Clarification Submission",
    description: "Pre-bid query drafting",
    icon: HelpCircle,
    summary:
      "Draft and submit pre-bid and post-bid clarifications that protect your commercial position while keeping the response precise, referenced, and within the query deadline.",
    includes: [
      "Pre-bid query drafting",
      "Clause and drawing references",
      "Deadline and format compliance",
      "Reply tracking and follow-up",
    ],
  },
  {
    slug: "estimation-billing-schedule",
    label: "Estimation & Billing Schedule",
    description: "BOQ costing & RA bill schedules",
    icon: Calculator,
    summary:
      "Build reliable cost estimates from the BOQ and rate analysis, then keep the billing schedule and measurement books aligned through every running account bill.",
    includes: [
      "BOQ costing and rate analysis",
      "Quantity and measurement checks",
      "RA bill and billing schedule",
      "Variation and escalation tracking",
    ],
  },
  {
    slug: "extra-claim",
    label: "Extra Claim",
    description: "Dispute & deviation filings",
    icon: AlertOctagon,
    summary:
      "Prepare extra item and deviation claims with the measurement, correspondence, and contractual basis needed to support them through evaluation and settlement.",
    includes: [
      "Claim basis and clause mapping",
      "Measurement and record evidence",
      "Deviation and extra item filings",
      "Correspondence and follow-up",
    ],
  },
];

export const getService = (slug: string) =>
  services.find((service) => service.slug === slug);

/** Navigation dropdown entries, kept in sync with the services above. */
export const serviceNavItems = services.map(({ slug, label, description, icon }) => ({
  label,
  href: `/services/${slug}`,
  description,
  icon,
}));
