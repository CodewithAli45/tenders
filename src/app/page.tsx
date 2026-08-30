"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Gavel,
  ArrowUpRight,
  Settings,
  Star,
  History,
  Archive,
  PieChart,
  LayoutGrid,
  ChevronDown,
  Phone,
  Radio,
  Activity,
  Award,
  AlertTriangle,
  FileText,
  Calculator,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  DollarSign,
  CheckSquare,
  HelpCircle,
  FileCheck,
  Clock,
  Users,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TenderDetailView } from "@/components/tender-detail-view";

interface Tender {
  _id: string;
  internalId: string;
  title: string;
  organization: string;
  tenderValue: number;
  tenderNo: string;
  portalId: string;
  emdAmount: number;
  publishDate?: string | null;
  dueDate: string;
  createdAt?: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatValue = (amount?: number | null) => (!amount || amount <= 0 ? "Refer Doc" : `₹${(amount / 10000000).toFixed(2)} Cr`);
const formatEmd = (amount?: number | null) => (!amount || amount <= 0 ? "Refer Doc" : `₹${(amount / 100000).toFixed(2)} Lakh`);

export default function Home() {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("DueDate");
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/tenders")
      .then((res) => res.json())
      .then((data) => setTenders(Array.isArray(data) ? data : []))
      .catch(() => setTenders([]))
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
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
      ]
    },
    {
      label: "Tools",
      href: "/tools",
      dropdown: [
        { label: "PDF Manager", href: "/pdf-manager", description: "Merge, split & edit tender documents", icon: FileText, target: "_blank" },
        { label: "Calculator", href: "/tools/calculator", description: "EMD & cost estimation toolkit", icon: Calculator },
        { label: "AutoCAD Viewer", href: "/tools/autocad-viewer", description: "Preview DWG & blueprint files", icon: Layers },
        { label: "MS Excel", href: "/tools/ms-excel", description: "Export & process tender BOQs", icon: FileSpreadsheet },
      ]
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
      ]
    },
  ];

  const organizations = Array.from(new Set(tenders.map((t) => t.organization).filter(Boolean))).sort();

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = !searchQuery ||
      t.internalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = !orgFilter || t.organization === orgFilter;
    return matchesSearch && matchesOrg;
  });

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (filterBy === "HighValue") return (b.tenderValue || 0) - (a.tenderValue || 0);
    if (filterBy === "Organization") return a.organization.localeCompare(b.organization);
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(sortedTenders.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedTenders = sortedTenders.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const totalValue = tenders.reduce((sum, t) => sum + (t.tenderValue || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col font-sans">
      <AnimatePresence>
        {selectedTender && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6"
          >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedTender(null)} />
            <div className="relative w-full h-full max-w-[98%] max-h-[92vh] glass-card shadow-2xl overflow-hidden rounded-3xl border border-border">
              <TenderDetailView
                tender={selectedTender}
                onClose={() => setSelectedTender(null)}
                onUpdate={() => {}}
                readOnly={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Marketing & Announcement Bar */}
      <div className="h-9 w-full bg-slate-900 dark:bg-slate-950 text-slate-100 flex items-center justify-between px-[2%] text-xs font-medium border-b border-slate-800 z-[60] fixed top-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            ENTERPRISE HUB
          </span>
          <span className="hidden sm:inline text-slate-300">EPC, Turnkey & PSU Infrastructure Tenders</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:+919661221326" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline font-semibold">Contact:</span> +91 9661221326
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="fixed top-9 z-50 w-full border-b border-border/80 bg-card/90 backdrop-blur-xl shadow-xs">
        <div className="flex h-16 w-full items-center justify-between px-[2%] gap-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                GovTender <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">Pro</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-0.5">PSU BIDDING INTELLIGENCE</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeDropdown === item.label
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180 text-primary" : ""}`} />
                  )}
                </a>
                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1.5 w-80 rounded-2xl dropdown-popover p-2 shadow-2xl z-[100] border border-border bg-card text-card-foreground"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1 flex items-center justify-between">
                        <span>{item.label} Modules</span>
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        {item.dropdown.map((subItem) => {
                          const IconComponent = subItem.icon || FileText;
                          return (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              target={(subItem as Record<string, unknown>).target as string | undefined}
                              rel={(subItem as Record<string, unknown>).target ? "noopener noreferrer" : undefined}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group/item cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-lg bg-secondary group-hover/item:bg-primary/20 flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors flex-shrink-0 mt-0.5">
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-foreground group-hover/item:text-primary flex items-center justify-between">
                                  <span>{subItem.label}</span>
                                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                                {subItem.description && (
                                  <p className="text-[11px] text-muted-foreground group-hover/item:text-primary/80 line-clamp-1 mt-0.5">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs shadow-md hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Full-Screen Layout Container */}
      <div className="flex w-full flex-1 pt-28 px-[1%] gap-6">

        {/* Left Enterprise Sidebar */}
        <aside className="fixed left-[1%] top-28 hidden h-[calc(100vh-8rem)] w-64 flex-col border border-border rounded-2xl bg-card p-5 xl:flex shadow-xs overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                <span>Quick Modules</span>
              </div>
              <div className="space-y-1">
                {[
                  { icon: Star, label: "Starred Bids" },
                  { icon: History, label: "My Tracked Bids" },
                  { icon: Archive, label: "Archived Contracts" },
                  { icon: PieChart, label: "Analytics & Export" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary/80" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Live Stats</span>
              </div>
              <div className="space-y-1">
                {[
                  { icon: Building2, label: "Active Tenders", value: tenders.length.toLocaleString() },
                  { icon: DollarSign, label: "Pipeline Value", value: `₹${(totalValue / 10000000).toFixed(0)} Cr` },
                  { icon: Award, label: "Organizations", value: `${new Set(tenders.map((t) => t.organization)).size}` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center gap-2.5"
                  >
                    <stat.icon className="h-3.5 w-3.5 text-primary/80" />
                    <span>{stat.label}</span>
                    <span className="ml-auto font-bold text-foreground">{loading ? "—" : stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 xl:ml-70 pb-16">
          <div className="w-full space-y-4">

            {/* Search & Sort Bar */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="w-full md:w-[28rem]">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by ID, title, organization..."
                    className="h-11 w-full rounded-xl bg-secondary pl-10 pr-10 text-sm font-semibold border border-border outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 p-1 rounded-full hover:bg-card text-muted-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className="flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold border border-border outline-none hover:border-primary transition-all cursor-pointer text-foreground"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter By</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {filterMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-card border border-border shadow-2xl p-2 z-[100]"
                    >
                      <button
                        onClick={() => { setFilterBy("DueDate"); setOrgFilter(null); setCurrentPage(1); setFilterMenuOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${filterBy === "DueDate" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                      >
                        Due Date <span className="text-[10px] text-muted-foreground font-bold">Default</span>
                      </button>
                      <button
                        onClick={() => { setFilterBy("HighValue"); setOrgFilter(null); setCurrentPage(1); setFilterMenuOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${filterBy === "HighValue" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                      >
                        High Value
                      </button>

                      <div className="relative group">
                        <button
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${filterBy === "Organization" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                        >
                          Organization
                          <ChevronDown className="h-4 w-4 -rotate-90" />
                        </button>
                        <div className="absolute left-full top-0 ml-1 hidden group-hover:block w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 max-h-72 overflow-y-auto z-[110]">
                          <button
                            onClick={() => { setFilterBy("Organization"); setOrgFilter(null); setCurrentPage(1); setFilterMenuOpen(false); }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                          >
                            All Organizations
                            {!orgFilter && filterBy === "Organization" && <Check className="h-4 w-4 text-primary" />}
                          </button>
                          {organizations.map((org) => (
                            <button
                              key={org}
                              onClick={() => { setFilterBy("Organization"); setOrgFilter(org); setCurrentPage(1); setFilterMenuOpen(false); }}
                              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                            >
                              <span className="truncate">{org}</span>
                              {orgFilter === org && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tender List - Full Width Single Rows */}
            <section className="glass-card rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted/50 animate-pulse" />
                  ))
                ) : filteredTenders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-bold text-foreground">No tenders found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery || orgFilter ? "Try adjusting your search or filter." : "Tenders will appear here once added from the admin portal."}
                    </p>
                  </div>
                ) : (
                  pagedTenders.map((tender) => (
                    <motion.div
                      key={tender._id}
                      onClick={() => setSelectedTender(tender)}
                      className="group cursor-pointer px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      {/* Row 1: ID left · Due date + Live right */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tracking-wide border border-primary/20">
                          {tender.internalId}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                            Due: <span className="font-bold text-foreground">{formatDate(tender.dueDate)}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Full title (wraps, nothing hidden) */}
                      <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {tender.title}
                      </h3>

                      {/* Row 3: Org · Value pill · EMD pill · Published — fixed columns align vertically across all rows */}
                      <div className="mt-2 grid items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-muted-foreground grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,18rem)_9rem_9.5rem_minmax(0,1fr)]">
                        <span className="break-words">{tender.organization}</span>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5">
                          <span className="uppercase tracking-wider text-[10px]">Value</span>
                          <span className="font-bold text-foreground">{formatValue(tender.tenderValue)}</span>
                        </span>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
                          <span className="uppercase tracking-wider text-[10px]">EMD</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatEmd(tender.emdAmount)}</span>
                        </span>
                        <span>
                          Published: <span className="font-bold text-foreground">{formatDate(tender.publishDate)}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {!loading && sortedTenders.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                <p className="text-xs text-muted-foreground font-semibold">
                  Showing <span className="text-foreground font-bold">{sortedTenders.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1}</span>–
                  <span className="text-foreground font-bold">{Math.min(safePage * PER_PAGE, sortedTenders.length)}</span> of{" "}
                  <span className="text-foreground font-bold">{sortedTenders.length}</span> tenders
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition cursor-pointer ${
                        page === safePage
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card/40 xl:ml-70">
        <div className="w-full px-[4%] md:px-[6%] py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-md shadow-blue-500/20">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-foreground">
                  GovTender <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">Pro</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Real-time Government Tender Management for EPC, Turnkey &amp; PSU Infrastructure projects. Find, track and win tenders with intelligent bidding intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm font-semibold text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/tenders/live" className="hover:text-primary transition-colors">Live Tenders</Link></li>
                <li><Link href="/tools/calculator" className="hover:text-primary transition-colors">EMD Calculator</Link></li>
                <li><Link href="/pdf-manager" className="hover:text-primary transition-colors">PDF Manager</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">Our Services</h4>
              <ul className="space-y-2.5 text-sm font-semibold text-muted-foreground">
                <li><Link href="/services/registration" className="hover:text-primary transition-colors">Vendor Registration</Link></li>
                <li><Link href="/services/cost-estimation" className="hover:text-primary transition-colors">Cost Estimation</Link></li>
                <li><Link href="/services/bid-preparation" className="hover:text-primary transition-colors">Bid Preparation</Link></li>
                <li><Link href="/services/contract-finalization" className="hover:text-primary transition-colors">Contract Finalization</Link></li>
                <li><Link href="/services/billing-schedule" className="hover:text-primary transition-colors">Billing Schedule</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground mb-4">Contact</h4>
              <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <a href="tel:+919661221326" className="hover:text-primary transition-colors">+91 96612 21326</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <a href="mailto:info@govtenderhub.com" className="hover:text-primary transition-colors">info@govtenderhub.com</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>India — Serving EPC, Turnkey &amp; PSU clients nationwide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-5 px-[4%] md:px-[6%] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">© {new Date().getFullYear()} GovTender Pro. All rights reserved.</p>
          <p className="text-xs font-semibold text-muted-foreground">Real-time Government Tender Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
