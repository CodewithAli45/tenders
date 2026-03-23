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
  Phone
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenderDetailView } from "@/components/tender-detail-view";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { label: "Home", href: "/" },
    { 
      label: "Tools", 
      href: "/tools",
      dropdown: [
        { label: "PDF Manager", href: "/tools/pdf-manager" },
        { label: "Calculator", href: "/tools/calculator" },
        { label: "AutoCAD Viewer", href: "/tools/autocad-viewer" },
        { label: "MS Excel", href: "/tools/ms-excel" },
      ]
    },
    { label: "About US", href: "/about" },
    { 
      label: "Tenders", 
      href: "/tenders",
      dropdown: [
        { label: "Live", href: "/tenders/live" },
        { label: "Status", href: "/tenders/status" },
        { label: "Award", href: "/tenders/award" },
        { label: "Cancelled", href: "/tenders/cancelled" },
      ]
    },
    { 
      label: "Services", 
      href: "/services",
      dropdown: [
        { label: "Registration", href: "/services/registration" },
        { label: "Cost Estimation", href: "/services/cost-estimation" },
        { label: "Bid Preparation", href: "/services/bid-preparation" },
        { label: "Reply of Clarification", href: "/services/reply-of-clarification" },
        { label: "Contract Finalization", href: "/services/contract-finalization" },
        { label: "Billing Schedule", href: "/services/billing-schedule" },
        { label: "L2 Network", href: "/services/l2-network" },
        { label: "Price Variation", href: "/services/price-variation" },
        { label: "Extra Claim", href: "/services/extra-claim" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col">
      <AnimatePresence>
        {selectedTender && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedTender(null)} />
            <div className="relative w-full h-full max-w-[96%] max-h-[90vh] glass-card shadow-2xl overflow-hidden rounded-3xl">
              <TenderDetailView 
                tender={selectedTender} 
                onClose={() => setSelectedTender(null)} 
                onUpdate={() => {}} 
                readOnly={true}
              />
            </div>
          </motion.div>
        )}

        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAdminModal(false)} />
            <div className="relative w-full h-full max-w-[96%] max-h-[90vh] glass-card shadow-2xl overflow-hidden rounded-3xl">
              <AdminDashboard isModal={true} onClose={() => setShowAdminModal(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketing Header */}
      <div className="h-8 w-full bg-primary text-white flex items-center justify-center px-[2%] text-[12px] sm:text-sm font-medium tracking-wide z-[60] fixed top-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Live and real time government tender management
          </span>
          <span className="h-3 w-[1px] bg-white/20" />
          <a href="tel:+919661221326" className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
            <Phone className="h-3 w-3" />
            Contact: +91 9661221326
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-8 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-[2%] gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">GovTender Live</span>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => (
              <div 
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-lg font-medium text-muted-foreground hover:text-foreground dark:hover:bg-white/5 transition-all cursor-pointer">
                  {item.label}
                  {item.dropdown && <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
                </button>

                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.label && (
                    <motion.div
                      className="absolute top-full left-0 mt-1 w-64 rounded-2xl border border-black/5 dark:border-white/10 py-2 shadow-2xl z-[70] overflow-hidden"
                    >
                      {item.dropdown.map((subItem) => (
                        <a
                          key={subItem.label}
                          href={subItem.href}
                          className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="pointer-events-none absolute top-2.5 right-2.5 flex h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <ThemeToggle />
            <button 
              onClick={() => setShowAdminModal(true)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-primary hover:border-primary transition-all cursor-pointer"
              title="Admin Dashboard"
            >
              <Settings className="h-5 w-5 text-muted-foreground dark:text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="flex w-full flex-1 pt-24 px-[2%]">
        {/* Left Sidebar */}
        <aside className="fixed left-[2%] top-24 hidden h-[calc(100vh-6rem)] w-64 flex-col border-r border-black/5 dark:border-white/10 p-6 xl:flex">
          <div className="space-y-8">
            {/* Quick Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Filter className="h-3 w-3" />
                <span>Quick Filters</span>
              </div>
              <div className="space-y-1">
                {["All", "State Govt", "Central Govt", "PSU", "Railway"].map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => setActiveFilter(tag)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeFilter === tag 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Tender Tools Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <LayoutGrid className="h-3 w-3" />
                <span>Tender Tools</span>
              </div>
              <div className="space-y-1">
                {[
                  { icon: Star, label: "Starred Bids" },
                  { icon: History, label: "My Bids" },
                  { icon: Archive, label: "Archived" },
                  { icon: PieChart, label: "Analytics" },
                ].map((item) => (
                  <button 
                    key={item.label}
                    className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all cursor-pointer flex items-center gap-3"
                  >
                    <item.icon className="h-4 w-4 opacity-70" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 border border-primary/10">
              <p className="text-xs font-bold text-primary mb-1">PRO HUB</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Unlock advanced analytics and bulk tender exports.</p>
              <button className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:scale-105 transition-all">Upgrade Now</button>
            </div>
          </div>
        </aside>

        {/* Home Feed Content */}
        <main className="flex-1 px-6 xl:ml-64 py-10">
          <div className="w-full">
            {/* Stats Overview */}
            {/* <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Active Tenders", value: "1,280", icon: Building2, color: "text-primary" },
                { label: "Expiring Today", value: "12", icon: Bell, color: "text-accent" },
                { label: "Drafted Bids", value: "4", icon: Gavel, color: "text-muted-foreground dark:text-white" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card flex items-center gap-4 rounded-3xl p-6 border border-black/5 dark:border-white/5"
                >
                  <div className={`rounded-2xl bg-black/5 dark:bg-white/5 p-4 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div> */}

            {/* Content Feed Header */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold flex items-center gap-3 whitespace-nowrap">
                <span className="h-8 w-1 bg-primary rounded-full" />
                Latest Opportunities
              </h2>
              
              <div className="flex-1 max-w-xl mx-4">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by ID, department, or keyword..."
                    className="h-12 w-full rounded-2xl bg-black/5 dark:bg-white/5 pl-11 pr-4 text-sm border border-black/5 dark:border-white/10 outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Sort by:</span>
                <select className="bg-transparent text-xs font-bold outline-none cursor-pointer hover:text-primary transition-colors">
                  <option>Recent</option>
                  <option>Value: High to Low</option>
                  <option>Due Date</option>
                </select>
              </div>
            </div>
              {/* card details  */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item, index) => {
                const year = new Date().getFullYear();
                const tenderId = `GTME-${year}-000${100 + index * 7}`;
                const tenderValueDecimal = 350000000.00;
                const emdValueDecimal = tenderValueDecimal * 0.01;
                
                const tender = {
                  _id: item,
                  internalId: tenderId,
                  title: `Construction of Smart City Infrastructure - Phase ${item}`,
                  tenderValue: tenderValueDecimal,
                  emdAmount: emdValueDecimal,
                  dueDate: "2024-04-15",
                  publishedDate: "2024-03-24",
                  organization: index % 2 === 0 ? "BCD Jharkhand" : "MECON",
                  category: index % 2 === 0 ? "state" : "psu",
                  department: index % 2 === 0 ? "BCD Jharkhand" : "MECON",
                  tenderNo: `T-REF-${index + 500}`,
                  portalId: `P-ID-${index + 8000}`,
                  tenderType: "open"
                };

                return (
                  <motion.div
                    key={item}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedTender(tender)}
                    className="glass-card group cursor-pointer overflow-hidden rounded-2xl p-4 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.03] border border-black/5 dark:border-white/10"
                  >
                    <div className="space-y-3">
                      {/* Row 1: ID, due date, published date */}
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-3">
                          <span className="text-primary uppercase tracking-tight">ID: {tenderId}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                            <span className="uppercase">Due:</span>
                            <span>{new Date(tender.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground/60">
                            <span className="uppercase font-medium">Published:</span>
                            <span>{new Date(tender.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Title */}
                      <div>
                        <h2 className="text-md font-bold group-hover:text-primary transition-colors leading-snug line-clamp-1">
                          Title: {tender.title}
                        </h2>
                      </div>

                      {/* Row 3: Tender Value and EMD */}
                      <div className="flex items-center gap-8 border-t border-black/5 dark:border-white/5 pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tender Value:</span>
                          <span className="text-sm font-bold">Rs. {tender.tenderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">EMD:</span>
                          <span className="text-sm font-bold">Rs. {tender.emdAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Row 4: Department or Organization */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          {index % 2 === 0 ? (
                            <>
                              <span className="font-bold text-foreground">Department:</span>
                              <span>{tender.department}, {tender.category}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-foreground">Organization:</span>
                              <span>{tender.organization}, {tender.category}</span>
                            </>
                          )}
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
