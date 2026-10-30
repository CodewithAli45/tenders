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
      "Practical assistance preparing your business profile and completing vendor enrolment on the relevant government procurement portal. Requirements and approval depend on the portal, buyer, and your business.",
    includes: [
      "Portal and vendor enrolment",
      "Portal-specific onboarding guidance",
      "Business profile and document review",
      "Category, renewal, and profile update support",
    ],
  },
  {
    slug: "bid-preparation",
    label: "Bid Preparation",
    description: "Technical & financial bidding",
    icon: CheckSquare,
    summary:
      "Prepare a complete tender submission from the notice, bidding documents, eligibility criteria, prescribed annexures, and submission instructions, with every requirement checked against the tender conditions.",
    includes: [
      "Tender document and clause review",
      "Technical bid and annexure preparation",
      "Financial bid and BOQ review",
      "Submission compliance and final checklist",
    ],
  },
  {
    slug: "clarification-submission",
    label: "Clarification Submission",
    description: "Pre-bid query drafting",
    icon: HelpCircle,
    summary:
      "Prepare clear, clause-specific queries on tender conditions, technical specifications, BOQ items, and commercial requirements, and assemble them into the prescribed clarification schedule before the deadline.",
    includes: [
      "Tender clause and BOQ review",
      "Clause-referenced query drafting",
      "Clarification schedule preparation",
      "Deadline and submission instruction checks",
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
