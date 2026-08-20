"use client";

import React, { useState } from "react";
import { X, FileText, Save, AlertCircle, Paperclip, CheckCircle2, Plus } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface TenderDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tender: any;
  onClose: () => void;
  onUpdate: () => void;
  readOnly?: boolean;
}

export function TenderDetailView({ tender, onClose, onUpdate, readOnly = false }: TenderDetailViewProps) {
  const [formData, setFormData] = useState({ ...tender });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-xl">
      <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <motion.div layoutId={`icon-${tender._id}`}>
              <FileText className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{tender.internalId}</h2>
            <p className="text-xs text-muted-foreground">{readOnly ? "View details and documents" : "Manage details and documents"}</p>
          </div>
        </div>
        <button onClick={onClose} className="h-10 w-10 border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tender Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Organization</label>
                <input name="organization" value={formData.organization} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Tender Title</label>
                <input name="title" value={formData.title} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Tender No.</label>
                  <input name="tenderNo" value={formData.tenderNo} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Portal ID</label>
                  <input name="portalId" value={formData.portalId} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Value (Rs.)</label>
                  <input type="number" name="tenderValue" value={formData.tenderValue} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-semibold disabled:opacity-70 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">EMD Amount</label>
                  <input type="number" name="emdAmount" value={formData.emdAmount} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-semibold disabled:opacity-70 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Publish Date</label>
                  <input type="date" name="publishDate" value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ""} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ""} onChange={handleChange} disabled={readOnly} className="w-full h-11 bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Document Management
            </h3>
            <div className="space-y-3">
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

      <div className="p-6 border-t border-black/5 dark:border-white/10 bg-background/50 backdrop-blur-md flex gap-4">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-sm font-bold border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
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
                <button onClick={() => setShowVerifyPrompt(false)} className="flex-1 h-11 rounded-xl text-sm font-bold border border-black/5 dark:border-white/10 hover:bg-black/5 transition-all">Edit More</button>
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
