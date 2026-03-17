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
  LayoutGrid
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useState } from "react";

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col">
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAdminModal(false)} />
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] glass-card shadow-2xl overflow-hidden rounded-3xl">
              <AdminDashboard isModal={true} onClose={() => setShowAdminModal(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">GovTender Hub</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center hidden md:block"
          >
            <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              Real-time Government Tender Management.
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative hidden items-center lg:flex">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenders..."
                className="h-10 w-48 xl:w-64 rounded-full bg-black/5 dark:bg-white/5 pl-10 pr-4 text-sm border border-black/5 dark:border-white/10 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-black/10 dark:border-white/20 cursor-pointer hidden sm:block" />
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 pt-16">
        {/* Left Sidebar */}
        <aside className="fixed left-[max(0px,calc(50%-40rem))] top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-black/5 dark:border-white/10 p-6 xl:flex">
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
          <div className="max-w-4xl mx-auto">
            {/* Stats Overview */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
            </div>

            {/* Content Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="h-8 w-1 bg-primary rounded-full" />
                Latest Opportunities
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Sort by:</span>
                <select className="bg-transparent text-xs font-bold outline-none cursor-pointer hover:text-primary transition-colors">
                  <option>Recent</option>
                  <option>Value: High to Low</option>
                  <option>Due Date</option>
                </select>
              </div>
            </div>

            <section className="space-y-6">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -4 }}
                  className="glass-card group cursor-pointer overflow-hidden rounded-3xl p-8 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.03] border border-black/5 dark:border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          High Priority
                        </span>
                        <span className="text-xs text-muted-foreground">ID: TENDER-2024-00{item}</span>
                      </div>
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                        Construction of Smart City Infrastructure - Phase {item}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          <span>PWD, Kolkata</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span>State Government</span>
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-end justify-between border-t border-black/5 dark:border-white/5 pt-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Budget</p>
                        <p className="text-xl font-bold">₹ 1.2 Cr</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due In</p>
                        <p className="text-xl font-bold text-accent">4 Days</p>
                      </div>
                    </div>
                    <button className="rounded-full bg-primary text-white shadow-lg shadow-primary/20 px-6 py-2.5 text-sm font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      Analyze Opportunity
                    </button>
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
