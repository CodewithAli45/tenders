import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Archive,
  Award,
  Calculator,
  CheckSquare,
  Clock,
  DollarSign,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  History,
  Layers,
  PieChart,
  Radio,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  target?: string;
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: NavSubItem[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Tenders",
    href: "/tenders",
    dropdown: [
      { label: "Live Tenders", href: "/tenders/live", description: "Active open bidding opportunities", icon: Radio },
      { label: "Status Tracker", href: "/tenders/status", description: "Check evaluation & technical bids", icon: Activity },
      { label: "Awarded Bids", href: "/tenders/award", description: "Recently finalized contract awards", icon: Award },
      { label: "Cancelled", href: "/tenders/cancelled", description: "Archived & revoked tenders", icon: AlertTriangle },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    dropdown: [
      { label: "Tender Document Tools", href: "/tender-document-tools", description: "Prepare your tender documents for portal submission", icon: FileText, target: "_blank" },
      { label: "Calculator", href: "/tools/calculator", description: "EMD & cost estimation toolkit", icon: Calculator },
      { label: "AutoCAD Viewer", href: "/tools/autocad-viewer", description: "Preview DWG & blueprint files", icon: Layers },
      { label: "MS Excel", href: "/tools/ms-excel", description: "Export & process tender BOQs", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Services",
    href: "/services",
    dropdown: [
      { label: "Registration", href: "/services/registration", description: "Vendor & Portal Registration", icon: ShieldCheck },
      { label: "Cost Estimation", href: "/services/cost-estimation", description: "Precision BOQ & financial rates", icon: DollarSign },
      { label: "Bid Preparation", href: "/services/bid-preparation", description: "Technical & Financial Bidding", icon: CheckSquare },
      { label: "Reply of Clarification", href: "/services/reply-of-clarification", description: "Pre-bid Query Drafting", icon: HelpCircle },
      { label: "Contract Finalization", href: "/services/contract-finalization", description: "LOA & Agreement Assistance", icon: FileCheck },
      { label: "Billing Schedule", href: "/services/billing-schedule", description: "RA Bill & Measurement Books", icon: Clock },
      { label: "L2 Network", href: "/services/l2-network", description: "Sub-contractor & Vendor Connect", icon: Users },
      { label: "Price Variation", href: "/services/price-variation", description: "WPI & Escalation Calculations", icon: TrendingUp },
      { label: "Extra Claim", href: "/services/extra-claim", description: "Dispute & Deviation Filings", icon: AlertOctagon },
    ],
  },
];

export const quickModules = [
  { icon: Star, label: "Starred Bids" },
  { icon: History, label: "My Tracked Bids" },
  { icon: Archive, label: "Archived Contracts" },
  { icon: PieChart, label: "Analytics & Export" },
];
