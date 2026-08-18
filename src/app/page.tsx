"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  Building2, 
  Gavel, 
  ArrowUpRight, 
  Filter, 
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
  Building,
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenderDetailView } from "@/components/tender-detail-view";

export default function Home() {
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recent");
  const [showNotifications, setShowNotifications] = useState(false);

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

  const filterOptions = [
    { name: "All", count: "1,280" },
    { name: "State Govt", count: "540" },
    { name: "Central Govt", count: "420" },
    { name: "PSU", count: "210" },
    { name: "Railway", count: "110" }
  ];

  // Mock Tender Data
  const tendersList = [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
    const year = new Date().getFullYear();
    const tenderId = `GTME-${year}-000${100 + index * 7}`;
    const tenderValueDecimal = 350000000.00 + (index * 12500000);
    const emdValueDecimal = tenderValueDecimal * 0.01;
    const categories = ["State Govt", "PSU", "Central Govt", "Railway"];
    const currentCategory = categories[index % categories.length];
    
    return {
      _id: item,
      internalId: tenderId,
      title: index % 2 === 0 
        ? `Construction & Electrification of Smart Infrastructure Corridor - Phase ${item}`
        : `Supply, Installation & Maintenance of Heavy Industrial Machinery - Unit ${item}`,
      tenderValue: tenderValueDecimal,
      emdAmount: emdValueDecimal,
      dueDate: `2026-08-${10 + index * 2}`,
      publishedDate: `2026-07-${20 + (index % 5)}`,
      organization: index % 2 === 0 ? "BCD Jharkhand" : "MECON India Limited",
      category: currentCategory,
      department: index % 2 === 0 ? "Building Construction Dept" : "Heavy Engineering & PSU Services",
      tenderNo: `T-REF-2026-${500 + index}`,
      portalId: `P-ID-${8000 + index * 12}`,
      tenderType: index === 0 ? "expiring" : "open",
      statusText: index === 0 ? "EXPIRING SOON" : "LIVE",
    };
  });

  const filteredTenders = tendersList.filter(t => {
    const matchesFilter = activeFilter === "All" || t.category.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch = searchQuery === "" || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.internalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                GovTender <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">Pro</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-0.5">Government Bidding Portal</span>
            </div>
          </a>

          {/* Navigation Items with NON-TRANSPARENT Hover Dropdowns */}
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
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180 text-primary' : ''}`} />
                  )}
                </a>

                {/* SOLID OPAQUE DROPDOWN MENU */}
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

          {/* Action Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Popover Toggle */}
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
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">3 New</span>
                    </div>
                    <div className="space-y-2 py-2">
                      <div className="p-2.5 rounded-xl bg-secondary/50 text-xs space-y-1">
                        <p className="font-semibold text-foreground">New Corrigendum Issued</p>
                        <p className="text-[11px] text-muted-foreground">GTME-2026-000100 updated tender document.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-secondary/50 text-xs space-y-1">
                        <p className="font-semibold text-foreground">Technical Bid Opening</p>
                        <p className="text-[11px] text-muted-foreground">BCD Jharkhand bid evaluation starts today.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />

            {/* Admin Dashboard Launch Button */}
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
            
            {/* Sector Quick Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  Category Filter
                </span>
              </div>
              <div className="space-y-1">
                {filterOptions.map((item) => (
                  <button 
                    key={item.name} 
                    onClick={() => setActiveFilter(item.name)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      activeFilter === item.name 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      activeFilter === item.name ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                    }`}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[1px] w-full bg-border" />

            {/* Tender Tools Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                <span>Quick Modules</span>
              </div>
              <div className="space-y-1">
                {[
                  { icon: Star, label: "Starred Bids", count: "8" },
                  { icon: History, label: "My Tracked Bids", count: "14" },
                  { icon: Archive, label: "Archived Contracts", count: "120" },
                  { icon: PieChart, label: "Analytics & Export", count: "Pro" },
                ].map((item) => (
                  <button 
                    key={item.label}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="h-3.5 w-3.5 text-primary/80" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enterprise Hub Callout */}
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

        {/* Main Content Area (Full Screen Responsive width) */}
        <main className="flex-1 xl:ml-70 pb-16">
          <div className="w-full space-y-6">
            
            {/* Metrics & Analytics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Tenders", value: "1,280", icon: Building2, change: "+12% this week", color: "text-blue-500" },
                { label: "Pipeline Value", value: "₹3,450 Cr", icon: DollarSign, change: "Updated Live", color: "text-emerald-500" },
                { label: "Expiring Today", value: "12 Bids", icon: Clock, change: "Action Required", color: "text-amber-500" },
                { label: "Finalized Awards", value: "84 Bids", icon: Award, change: "+5 today", color: "text-indigo-500" },
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
                    <p className="text-[10px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                      <span>{stat.change}</span>
                    </p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filter, Search & Header Bar */}
            <div className="glass-card rounded-2xl p-4 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
                  Live Opportunities ({filteredTenders.length})
                </h2>
              </div>
              
              {/* Search Bar Input */}
              <div className="flex-1 w-full max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tenders by ID, department, location or keyword..."
                    className="h-11 w-full rounded-xl bg-secondary pl-10 pr-10 text-xs font-semibold border border-border outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 p-1 rounded-full hover:bg-card text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
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

            {/* Opportunities Feed Grid (Full Screen Coverage) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTenders.map((tender) => (
                <motion.div
                  key={tender._id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedTender(tender)}
                  className="glass-card group cursor-pointer rounded-2xl p-5 border border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Row: Tender ID & Status Badge */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold tracking-wide border border-primary/20">
                          {tender.internalId}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider border ${
                          tender.tenderType === 'expiring' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {tender.statusText}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-md">
                          {tender.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {tender.title}
                      </h3>
                    </div>

                    {/* Value & EMD Highlights */}
                    <div className="grid grid-cols-2 gap-4 py-2 px-3 rounded-xl bg-secondary/50 border border-border/50">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Tender Value</span>
                        <span className="text-sm font-black text-foreground">
                          ₹ {(tender.tenderValue / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">EMD Amount</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹ {(tender.emdAmount / 100000).toFixed(2)} Lakh
                        </span>
                      </div>
                    </div>

                    {/* Department & Footer Details */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground truncate">{tender.organization}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary font-bold text-muted-foreground flex-shrink-0">
                          {tender.category}
                        </span>
                      </div>
                      
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
