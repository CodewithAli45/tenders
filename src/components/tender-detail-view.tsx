"use client";

import React, { useState } from "react";
import { X, FileText, Save, AlertCircle, Paperclip, CheckCircle2, Plus, MapPin, Phone, Mail, User, Building2, Calendar, Clock, IndianRupee, ShieldCheck, Gavel, FileCheck } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface TenderDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tender: any;
  onClose: () => void;
  onUpdate: () => void;
  readOnly?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  return `${d} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const formatValue = (amount?: number | null) => (!amount || amount <= 0 ? "Refer Doc" : `₹${(amount / 10000000).toFixed(2)} Cr`);
const formatEmd = (amount?: number | null) => (!amount || amount <= 0 ? "Refer Doc" : `₹${(amount / 100000).toFixed(2)} Lakh`);

const compactInputClass = "w-full h-8 bg-transparent text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 rounded-lg px-2 border border-transparent focus:border-primary transition-all";
const textareaClass = "w-full bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all min-h-[120px] resize-y";

export function TenderDetailView({ tender, onClose, onUpdate, readOnly = false }: TenderDetailViewProps) {
  const [formData, setFormData] = useState({ ...tender });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("tenderId", tender.internalId);
    uploadData.append("type", "document");

    try {
      const response = await axios.post("/api/upload", uploadData);
      const url = response.data.url;
      const updatedTender = { ...formData, tenderDocuments: [...(formData.tenderDocuments || []), url] };
      setFormData(updatedTender);
      setSuccess("File uploaded successfully!");
      await axios.patch(`/api/tenders/${tender._id}`, updatedTender);
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.patch(`/api/tenders/${tender._id}`, formData);
      setSuccess("Tender updated successfully!");
      onUpdate();
      setTimeout(() => { setSuccess(null); setShowVerifyPrompt(false); }, 2000);
    } catch {
      setError("Failed to update tender.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const facts = [
    { icon: Building2, label: "Organization", name: "organization", type: "text", raw: formData.organization, fmt: undefined as undefined | ((v: unknown) => string) },
    { icon: Gavel, label: "Tender No.", name: "tenderNo", type: "text", raw: formData.tenderNo, fmt: undefined },
    { icon: FileCheck, label: "Portal ID", name: "portalId", type: "text", raw: formData.portalId, fmt: undefined },
    { icon: IndianRupee, label: "Tender Value", name: "tenderValue", type: "number", raw: formData.tenderValue, fmt: formatValue },
    { icon: ShieldCheck, label: "EMD Amount", name: "emdAmount", type: "number", raw: formData.emdAmount, fmt: formatEmd },
    { icon: Calendar, label: "Publish Date", name: "publishDate", type: "date", raw: formData.publishDate, fmt: formatDate },
    { icon: Clock, label: "Due Date", name: "dueDate", type: "date", raw: formData.dueDate, fmt: formatDate },
  ];

  const contacts = [
    { icon: MapPin, label: "Location", name: "location", value: formData.location, placeholder: "e.g. Nagpur, Maharashtra" },
    { icon: User, label: "Contact Person", name: "contactPerson", value: formData.contactPerson, placeholder: "Name of the contact officer" },
    { icon: Phone, label: "Contact Phone", name: "contactPhone", value: formData.contactPhone, placeholder: "+91 ..." },
    { icon: Mail, label: "Contact Email", name: "contactEmail", value: formData.contactEmail, placeholder: "officer@example.com" },
  ];

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tracking-wide border border-primary/20">
                {tender.internalId}
              </span>
              <h2 className="text-xl font-bold truncate">{tender.tenderNo}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{readOnly ? "View details and documents" : "Manage details and documents"}</p>
          </div>
        </div>
        <button onClick={onClose} className="h-10 w-10 shrink-0 border border-border rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-accent/10 border border-accent/20 text-accent p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Title */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Tender Title
          </h3>
          {readOnly ? (
            <h1 className="text-lg lg:text-xl font-bold leading-snug">{formData.title || "—"}</h1>
          ) : (
            <textarea name="title" value={formData.title} onChange={handleChange} className={`${textareaClass} font-bold`} rows={2} />
          )}
        </section>

        {/* Key Facts — single source of truth (editable inline for admins) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div key={fact.name} className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary/80" />
                  <span>{fact.label}</span>
                </div>
                {readOnly ? (
                  <p className="text-sm font-bold leading-snug">{fact.fmt ? fact.fmt(fact.raw) : (fact.raw || "—")}</p>
                ) : fact.type === "date" ? (
                  <input type="date" name={fact.name} value={fact.raw ? new Date(fact.raw).toISOString().split('T')[0] : ""} onChange={handleChange} className={`${compactInputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
                ) : (
                  <input type={fact.type} name={fact.name} value={fact.raw} onChange={handleChange} className={`${compactInputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
                )}
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scope of Work */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Scope of Work
            </h3>
            {readOnly ? (
              formData.scopeOfWork ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{formData.scopeOfWork}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No scope of work specified.</p>
              )
            ) : (
              <textarea name="scopeOfWork" value={formData.scopeOfWork} onChange={handleChange} placeholder="Describe the detailed scope of work for this tender..." className={textareaClass} rows={5} />
            )}
          </section>

          {/* Location & Contacts + Documents */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Location & Contacts
            </h3>
            <div className="rounded-2xl border border-border bg-card/60 divide-y divide-border">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="flex items-center gap-3 px-4 py-3">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28 shrink-0">{item.label}</span>
                    {readOnly ? (
                      <span className={`text-sm font-semibold min-w-0 break-words ${item.value ? "" : "text-muted-foreground italic"}`}>{item.value || "—"}</span>
                    ) : (
                      <input name={item.name} value={item.value} onChange={handleChange} placeholder={item.placeholder} className="flex-1 h-9 bg-transparent text-sm font-semibold outline-none min-w-0 placeholder:font-normal placeholder:text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Documents */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Document Management
              </h3>
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase flex items-center justify-between">
                Tender Documents (PDF)
                <span className="text-[10px] lowercase font-normal italic">Cloud folder: {tender.internalId}</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {formData.tenderDocuments?.map((doc: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium truncate max-w-[200px]">Document_{idx + 1}.pdf</span>
                    </div>
                    <a href={doc} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline">VIEW</a>
                  </div>
                ))}
                {!readOnly && (
                  <div className="relative group/upload">
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading} />
                    <div className="p-4 border-2 border-dashed border-primary/20 dark:border-primary/10 rounded-xl flex items-center justify-center gap-2 group-hover/upload:border-primary/50 transition-all bg-primary/[0.02] group-hover/upload:bg-primary/[0.05]">
                      {isUploading ? (
                        <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-primary">Add {formData.tenderDocuments?.length > 0 ? 'More' : ''} Tender PDF</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-border bg-background/50 backdrop-blur-md flex gap-4">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-sm font-bold border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
          Close
        </button>
        {!readOnly && (
          <button onClick={() => setShowVerifyPrompt(true)} className="flex-[2] h-12 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Save className="h-4 w-4" />
            Save & Verify
          </button>
        )}
      </div>

      <AnimatePresence>
        {showVerifyPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 rounded-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-background max-w-sm w-full p-8 rounded-3xl shadow-2xl space-y-6 text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Verify Changes</h3>
                <p className="text-sm text-muted-foreground text-balance">
                  Please review the details for tender <strong>{tender.internalId}</strong>. Are you sure you want to save these changes?
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowVerifyPrompt(false)} className="flex-1 h-11 rounded-xl text-sm font-bold border border-border hover:bg-black/5 transition-all">Edit More</button>
                <button onClick={handleSave} disabled={isSubmitting} className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all flex items-center justify-center">
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Confirm Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}