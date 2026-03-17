"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { NewTenderForm } from "./new-tender-form";
import { TenderDetailView } from "./tender-detail-view";
import axios from "axios";

interface AdminDashboardProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function AdminDashboard({ onClose, isModal = false }: AdminDashboardProps) {
  const [isAddingTender, setIsAddingTender] = useState(false);
  const [viewingTender, setViewingTender] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newInternalId, setNewInternalId] = useState("");
  const [tenders, setTenders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/tenders");
      setTenders(response.data);
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleTenderAdded = (tender: any) => {
    setIsAddingTender(false);
    setNewInternalId(tender.internalId);
    setShowSuccess(true);
    fetchTenders();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={`flex h-full w-full bg-background text-foreground overflow-hidden ${isModal ? 'rounded-2xl' : ''}`}>
      {/* Sidebar - Collapses when adding/viewing tender on mobile */}
      <aside className={`w-64 border-r border-black/5 dark:border-white/10 flex flex-col bg-black/2 dark:bg-white/2 backdrop-blur-md transition-all ${isAddingTender || viewingTender ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: "Overview", active: !isAddingTender && !viewingTender },
            { id: 'users', icon: Users, label: "Users" },
            { id: 'tenders', icon: FileText, label: "Tenders", active: !!viewingTender },
            { id: 'analytics', icon: BarChart3, label: "Analytics" },
            { id: 'settings', icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                item.active 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 dark:border-white/10 mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-accent text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 pointer-events-none"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-bold">Tender Created: {newInternalId}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isAddingTender ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-hidden"
          >
            <NewTenderForm 
              onClose={() => setIsAddingTender(false)} 
              onSuccess={handleTenderAdded} 
            />
          </motion.div>
        ) : viewingTender ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-hidden"
          >
            <TenderDetailView 
              tender={viewingTender} 
              onClose={() => setViewingTender(null)}
              onUpdate={fetchTenders}
            />
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search tenders..." 
                    className="w-full h-10 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsAddingTender(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  New Tender
                </button>
                {isModal && (
                  <button 
                    onClick={onClose}
                    className="h-10 w-10 border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Tenders", value: tenders.length.toString(), change: "active" },
                  { label: "Active Revenue", value: `₹ ${(tenders.reduce((acc, t) => acc + (t.tenderValue || 0), 0) / 10000000).toFixed(1)} Cr`, change: "est." },
                  { label: "Pending Uploads", value: tenders.filter(t => !t.tenderDocuments?.length).length.toString(), change: "action needed" },
                  { label: "System Health", value: "99.9%", change: "stable" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-6 rounded-3xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stat.change === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Area */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Manage Tenders</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last updated: Just now
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/2 dark:bg-white/2 border-b border-black/5 dark:border-white/10">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tender ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Due Date</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {isLoading ? (
                        [1, 2, 3].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-6 py-8 h-16 bg-black/5 dark:bg-white/5" />
                          </tr>
                        ))
                      ) : tenders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm italic">
                            No tenders found. Create one to get started.
                          </td>
                        </tr>
                      ) : (
                        tenders.map((tender) => (
                          <tr 
                            key={tender._id} 
                            onClick={() => setViewingTender(tender)}
                            className="hover:bg-black/1 dark:hover:bg-white/1 transition-all cursor-pointer group"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-primary group-hover:underline">
                                {tender.internalId}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm truncate max-w-[300px]">{tender.title}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-medium text-muted-foreground bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded italic">
                                    {tender.organization}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">₹ {tender.tenderValue.toLocaleString()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tender.tenderDocuments?.length 
                                  ? 'bg-accent/10 text-accent' 
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {tender.tenderDocuments?.length ? 'Documents Ready' : 'Pending Upload'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {new Date(tender.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
