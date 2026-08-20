"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
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
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
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
  dueDate: string;
}

export default function Home() {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recent");
  const [showNotifications, setShowNotifications] = useState(false);
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
    {
      label: "Tools",
      href: "/tools",
      dropdown: [
        { label: "PDF Manager", href: "/tools/pdf-manager", description: "Merge, split & edit tender documents", icon: FileText },
        { label: "Calculator", href: "/tools/calculator", description: "EMD & cost estimation toolkit", icon: Calculator },
        { label: "AutoCAD Viewer", href: "/tools/autocad-viewer", description: "Preview DWG & blueprint files", icon: Layers },
        { label: "MS Excel", href: "/tools/ms-excel", description: "Export & process tender BOQs", icon: FileSpreadsheet },
      ]
    },
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

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch = !searchQuery ||
      t.internalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <span className="hidden sm:inline text-slate-300">Live & Real-time Government Tender Management System</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:+919661221326" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline font-semibold">Helpline:</span> +91 9661221326
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
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-0.5">Government Bidding Portal</span>
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl p-2.5 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="pointer-events-none absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl dropdown-popover p-4 shadow-2xl z-[100] border border-border bg-card"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Live Alerts</h4>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <div className="space-y-2 py-2">
                      {tenders.slice(0, 3).map((t) => (
                        <div key={t._id} className="p-2.5 rounded-xl bg-secondary/50 text-xs space-y-1 cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => { setSelectedTender(t); setShowNotifications(false); }}>
                          <p className="font-semibold text-foreground">{t.internalId}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{t.title}</p>
                        </div>
                      ))}
                      {tenders.length === 0 && <p className="text-xs text-muted-foreground py-2">No live tenders yet.</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ThemeToggle />
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs shadow-md hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Full-Screen Layout Container */}
      <div className="flex w-full flex-1 pt-28 px-[2%] gap-6">

        {/* Left Enterprise Sidebar */}
        <aside className="fixed left-[2%] top-28 hidden h-[calc(100vh-8rem)] w-64 flex-col border border-border rounded-2xl bg-card p-5 xl:flex shadow-xs overflow-y-auto">
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
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-emerald-600/10 p-4 border border-blue-500/20 text-card-foreground">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                <p className="text-xs font-extrabold text-primary uppercase tracking-wider">GovTender API</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Automated ERP integration & custom tender webhooks available.</p>
              <button className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
                Request API Key
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 xl:ml-70 pb-16">
          <div className="w-full space-y-6">

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Active Tenders", value: tenders.length.toLocaleString(), icon: Building2, color: "text-blue-500" },
                { label: "Pipeline Value", value: `₹${(totalValue / 10000000).toFixed(0)} Cr`, icon: DollarSign, color: "text-emerald-500" },
                { label: "Organizations", value: `${new Set(tenders.map((t) => t.organization)).size}`, icon: Award, color: "text-indigo-500" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-4 border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-black tracking-tight text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Search & Sort Bar */}
            <div className="glass-card rounded-2xl p-4 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
                  Live Opportunities ({filteredTenders.length})
                </h2>
              </div>

              <div className="flex-1 w-full max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, title, organization..."
                    className="h-11 w-full rounded-xl bg-secondary pl-10 pr-10 text-xs font-semibold border border-border outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 p-1 rounded-full hover:bg-card text-muted-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-secondary text-xs font-semibold px-3 py-2 rounded-xl border border-border outline-none cursor-pointer hover:border-primary transition-all text-foreground"
                >
                  <option value="Recent">Recent First</option>
                  <option value="ValueHigh">Value: High to Low</option>
                  <option value="DueDate">Due Date: Earliest</option>
                </select>
              </div>
            </div>

            {/* Tender List - Full Width Single Rows */}
            <section className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
                ))
              ) : filteredTenders.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 border border-border text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-bold text-foreground">No tenders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? "Try a different search term." : "Tenders will appear here once added from the admin portal."}
                  </p>
                </div>
              ) : (
                filteredTenders.map((tender) => (
                  <motion.div
                    key={tender._id}
                    whileHover={{ y: -1 }}
                    onClick={() => setSelectedTender(tender)}
                    className="glass-card group cursor-pointer rounded-2xl border border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-5 p-5">
                      <div className="flex-shrink-0">
                        <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tracking-wide border border-primary/20">
                          {tender.internalId}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {tender.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tender.organization}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Value</p>
                        <p className="text-sm font-black text-foreground">
                          ₹{(tender.tenderValue / 10000000).toFixed(2)} Cr
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right hidden md:block">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">EMD</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(tender.emdAmount / 100000).toFixed(2)} Lakh
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due</p>
                        <p className="text-xs font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-md inline-block">
                          {tender.dueDate}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          LIVE
                        </span>
                      </div>

                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
