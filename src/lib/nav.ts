import {
  Activity,
  AlertTriangle,
  Archive,
  Award,
  Calculator,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  PieChart,
  Star,
  type LucideIcon,
} from "lucide-react";
import { serviceNavItems } from "@/lib/services";

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
      { label: "AutoCAD Viewer", href: "/tools/autocad-viewer", description: "Preview DWG & blueprint files", icon: Layers, target: "_blank" },
      { label: "MS Excel", href: "/tools/ms-excel", description: "Export & process tender BOQs", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Services",
    href: "/services",
    dropdown: serviceNavItems,
  },
];

export const quickModules = [
  { icon: Star, label: "Starred Bids" },
  { icon: History, label: "My Tracked Bids" },
  { icon: Archive, label: "Archived Contracts" },
  { icon: PieChart, label: "Analytics & Export" },
];
