"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Building2, Gavel, ArrowUpRight, Filter, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useState } from "react";

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20">
        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "Active Tenders", value: "1,280", icon: Building2, color: "text-primary" },
            { label: "Expiring Today", value: "12", icon: Bell, color: "text-accent" },
            { label: "Drafted Bids", value: "4", icon: Gavel, color: "text-muted-foreground dark:text-white" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex items-center gap-4 rounded-3xl p-6 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <div className={`rounded-2xl bg-black/5 dark:bg-white/5 p-4 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters Bar (Moved to top instead of sidebar to save space) */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
            <Filter className="h-4 w-4" />
            <span>Quick Filters:</span>
          </div>
          {["State Govt", "Central Govt", "PSU", "Railway"].map((tag) => (
            <button key={tag} className="rounded-full bg-black/5 dark:bg-white/5 px-4 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-black/5 dark:border-white/5">
              {tag}
            </button>
          ))}
        </div>

        <section className="space-y-6">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -4 }}
              className="glass-card group cursor-pointer overflow-hidden rounded-3xl p-8 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      High Priority
                    </span>
                    <span className="text-xs text-muted-foreground">ID: TENDER-2024-00{item}</span>
                  </div>
                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Construction of Smart City Infrastructure - Phase {item}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Public Works Department • Kolkata, WB
                  </p>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ends In</p>
                    <p className="text-xl font-bold text-accent">4 Days</p>
                  </div>
                </div>
                <button className="rounded-full bg-black/5 dark:bg-white/5 px-6 py-2 text-sm font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
