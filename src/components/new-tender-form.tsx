"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Calendar, 
  FileText, 
  Clock,
  Briefcase,
  Layers,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import axios from "axios";

interface NewTenderFormProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function NewTenderForm({ onClose, onSuccess }: NewTenderFormProps) {
  const [formData, setFormData] = useState({
    internalId: "",
    title: "",
    organization: "",
    category: "central",
    tenderValue: "",
    tenderNo: "",
    portalId: "",
    emdAmount: "",
    emdThrough: "online",
    publishDate: "",
    dueDate: "",
    tenderType: "open",
    formOfContract: "epc",
    corrigendum: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate Internal Tender ID on mount
  useEffect(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `GHT-${year}-${randomNum}`;
    setFormData(prev => ({ ...prev, internalId: id }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/tenders", formData);
      onSuccess(response.data);
    } catch (err: any) {
      console.error("Error creating tender:", err);
      setError(err.response?.data?.error || "Failed to create tender. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

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
                name="internalId"
                value={formData.internalId} 
                disabled 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm font-mono text-primary outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Title</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text" 
                placeholder="e.g. Smart City Infrastructure Phase 2" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Organization / Department</label>
              <input 
                required
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                type="text" 
                placeholder="e.g. Public Works Department" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="central">Central Govt</option>
                <option value="state">State Govt</option>
                <option value="psu">PSU</option>
                <option value="railway">Railway</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Value (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <input 
                  required
                  name="tenderValue"
                  value={formData.tenderValue}
                  onChange={handleChange}
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
                name="tenderNo"
                value={formData.tenderNo}
                onChange={handleChange}
                type="text" 
                placeholder="TN-2024-001" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Portal Tender ID</label>
              <input 
                required
                name="portalId"
                value={formData.portalId}
                onChange={handleChange}
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
                name="emdAmount"
                value={formData.emdAmount}
                onChange={handleChange}
                type="number" 
                placeholder="0" 
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">EMD Through</label>
              <select 
                name="emdThrough"
                value={formData.emdThrough}
                onChange={handleChange}
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              >
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
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
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
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  type="date" 
                  className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all underline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Contract */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contract Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Type</label>
              <select 
                name="tenderType"
                value={formData.tenderType}
                onChange={handleChange}
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="limited">Limited</option>
                <option value="global">Global</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Form of Contract</label>
              <select 
                name="formOfContract"
                value={formData.formOfContract}
                onChange={handleChange}
                className="w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
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
                onClick={() => setFormData(prev => ({ ...prev, corrigendum: !prev.corrigendum }))}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.corrigendum ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all ${formData.corrigendum ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
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
