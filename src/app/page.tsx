"use client";

import { motion } from "framer-motion";
import { Search, Bell, Building2, Gavel, ArrowUpRight, Filter } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">GovTender Hub</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden items-center sm:flex">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenders..."
                className="h-10 w-64 rounded-full bg-white/5 pl-10 pr-4 text-sm border border-white/10 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="relative rounded-full p-2 hover:bg-white/5">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="pointer-events-none absolute top-2 right-2 flex h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-white/20" />
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-4"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Real-time Government <br />
            Tender Management.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Aggregate and analyze tenders from multiple government portals in a single, high-fidelity workspace. Stay ahead with automated alerts and predictive insights.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "Active Tenders", value: "1,280", icon: Building2, color: "text-primary" },
            { label: "Expiring Today", value: "12", icon: Bell, color: "text-accent" },
            { label: "Drafted Bids", value: "4", icon: Gavel, color: "text-white" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex items-center gap-4 rounded-3xl p-6 transition-transform hover:scale-[1.02]"
            >
              <div className={`rounded-2xl bg-white/5 p-4 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Content Section */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {["State Govt", "Central Govt", "PSU", "Railway"].map((tag) => (
                  <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                    <div className="h-4 w-4 rounded border border-white/20 group-hover:border-primary/50 transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -4 }}
                className="glass-card group cursor-pointer overflow-hidden rounded-3xl p-8 transition-all hover:bg-white/[0.03]"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="mt-8 flex items-end justify-between border-t border-white/5 pt-6">
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
                  <button className="rounded-full bg-white/5 px-6 py-2 text-sm font-semibold hover:bg-white/10 transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
