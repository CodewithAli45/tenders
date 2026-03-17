"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Upload, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  FileCheck2,
  Paperclip
} from "lucide-react";

interface NewTenderFormProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function NewTenderForm({ onClose, onSuccess }: NewTenderFormProps) {
  const [internalId, setInternalId] = useState("");
  const [showCorrigendumUpload, setShowCorrigendumUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate Internal Tender ID on mount
  useEffect(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInternalId(`GHT-${year}-${randomNum}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({ id: internalId });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-xl">
      <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Add New Tender</h2>
        </div>
        <button 
          onClick={onClose}
          className="h-10 w-10 border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {/* Section: General Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">General Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Our Tender ID (Auto-generated)</label>
              <input 
                type="text" 
                value={internalId} 
                disabled 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm font-mono text-primary outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Smart City Infrastructure Phase 2" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Value (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <input 
                  required
                  type="number" 
                  placeholder="0.00" 
                  className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-8 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender No.</label>
              <input 
                required
                type="text" 
                placeholder="TN-2024-001" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Portal Tender ID</label>
              <input 
                required
                type="text" 
                placeholder="Portal-ID-12345" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Section: Financials & Dates */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Financials & Timeline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">EMD Amount (Rs.)</label>
              <input 
                required
                type="number" 
                placeholder="0" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">EMD Through</label>
              <select className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                <option value="online">Online</option>
                <option value="bg">Bank Guarantee</option>
                <option value="msme">MSME</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Publish Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  required
                  type="date" 
                  className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  required
                  type="date" 
                  className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all underline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Contract & Documents */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contract & Documents</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Type</label>
              <select className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                <option value="open">Open</option>
                <option value="limited">Limited</option>
                <option value="global">Global</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Form of Contract</label>
              <select className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                <option value="epc">EPC</option>
                <option value="item">Item Rate</option>
                <option value="turnkey">Turnkey</option>
                <option value="supply">Supply</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-2xl">
              <div>
                <p className="font-semibold text-sm">Corrigendum Issued?</p>
                <p className="text-xs text-muted-foreground">Toggle if a corrigendum is available for this tender</p>
              </div>
              <div 
                onClick={() => setShowCorrigendumUpload(!showCorrigendumUpload)}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${showCorrigendumUpload ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all ${showCorrigendumUpload ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>

            {showCorrigendumUpload && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-all"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-medium">Click to upload corrigendum list</p>
                <p className="text-[10px] text-muted-foreground italic">Accepted formats: .pdf, .xlsx</p>
                <input type="file" className="hidden" />
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Tender Documents (PDF)</label>
            <div className="p-8 border-2 border-dashed border-primary/20 dark:border-primary/10 rounded-3xl flex flex-col items-center justify-center gap-3 bg-primary/[0.02] hover:bg-primary/[0.05] transition-all group cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all">
                <Paperclip className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Drop main tender documents here</p>
                <p className="text-[11px] text-muted-foreground mt-1">Maximum size: 25MB • Format: PDF Only</p>
              </div>
              <button 
                type="button"
                className="mt-2 text-xs font-bold text-primary underline underline-offset-4"
              >
                Choose from file system
              </button>
              <input type="file" accept=".pdf" className="hidden" />
            </div>
          </div>
        </section>

        <div className="pt-6 flex gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-sm font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            Discard
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] h-12 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FileCheck2 className="h-4 w-4" />
                Add Tender
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
