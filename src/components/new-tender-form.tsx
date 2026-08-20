"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, FileText, Clock, Briefcase, FileCheck2, AlertCircle } from "lucide-react";
import axios from "axios";

interface NewTenderFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
}

interface Organization {
  _id: string;
  name: string;
}

export function NewTenderForm({ onClose, onSuccess }: NewTenderFormProps) {
  const [formData, setFormData] = useState({
    internalId: "",
    title: "",
    organization: "",
    tenderValue: "",
    tenderNo: "",
    portalId: "",
    emdAmount: "",
    publishDate: "",
    dueDate: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, internalId: `GHT-${year}-${randomNum}` }));

    axios.get("/api/organizations").then((res) => setOrganizations(res.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axios.post("/api/tenders", { ...formData, category: "PSU" });
      onSuccess(response.data);
    } catch (err: unknown) {
      console.error("Error creating tender:", err);
      const message = err instanceof Error ? err.message : "Failed to create tender. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-11 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all";
  const numberInputClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-xl">
      <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Add New Tender</h2>
        </div>
        <button onClick={onClose} className="h-10 w-10 border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
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

        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">General Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Our Tender ID (Auto-generated)</label>
              <input type="text" name="internalId" value={formData.internalId} disabled className={`${inputClass} font-mono text-primary cursor-not-allowed`} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. Smart City Infrastructure Phase 2" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Organization / Department</label>
              <select required name="organization" value={formData.organization} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                <option value="" disabled>Select organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org.name}>{org.name}</option>
                ))}
              </select>
              {organizations.length === 0 && <p className="text-[11px] text-muted-foreground ml-1">No organizations found. Add one from the Organization tab first.</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender No.</label>
              <input required name="tenderNo" value={formData.tenderNo} onChange={handleChange} type="text" placeholder="TN-2024-001" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Portal Tender ID</label>
              <input required name="portalId" value={formData.portalId} onChange={handleChange} type="text" placeholder="Portal-ID-12345" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Tender Value (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <input required name="tenderValue" value={formData.tenderValue} onChange={handleChange} type="number" placeholder="0.00" className={`${numberInputClass} pl-8`} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Financials & Timeline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">EMD Amount (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <input required name="emdAmount" value={formData.emdAmount} onChange={handleChange} type="number" placeholder="0" className={`${numberInputClass} pl-8`} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Publish Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input required name="publishDate" value={formData.publishDate} onChange={handleChange} type="date" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input required name="dueDate" value={formData.dueDate} onChange={handleChange} type="date" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl text-sm font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
            Discard
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-[2] h-12 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
