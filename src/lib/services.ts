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
    description: "Turnkey project estimation & billing schedules",
    icon: Calculator,
    summary:
      "Estimate turnkey work from the full scope, project requirements, and site conditions—not from schedule rates alone. We assess quantities, local availability, logistics, execution constraints, and billing requirements so important costs are visible before you submit a price.",
    includes: [
      "Tender scope and deliverable breakdown",
      "Site visit and local condition assessment",
      "Materials, labour, logistics, and execution costing",
      "Turnkey price build-up and billing schedule",
    ],
  },
  {
    slug: "extra-claim",
    label: "Extra Claims",
    description: "Claims for extra work and BOQ deviations",
    icon: AlertOctagon,
    summary:
      "Identify and document work that falls outside the signed contract or BOQ, including additional items, changed quantities, revised drawings, and instructed scope changes. Prepare a timely, evidence-backed claim under the applicable contract procedure.",
    includes: [
      "Contract, BOQ, and drawing comparison",
      "Extra item and deviation measurement records",
      "Notice, rate build-up, and claim preparation",
      "Evidence schedule and submission follow-up",
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
