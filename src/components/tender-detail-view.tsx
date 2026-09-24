"use client";

import React, { useState } from "react";
import { X, FileText, Save, AlertCircle, Paperclip, CheckCircle2, Plus, MapPin, Phone, Mail, User, Building2, Calendar, Clock, IndianRupee, ShieldCheck, Gavel, FileCheck, Trash2, Banknote, Users, BadgeCheck, Scale, Wrench, ClipboardList, FileSpreadsheet, ReceiptText } from "lucide-react";
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

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${d} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${h}:${m}`;
};

const compactInputClass = "w-full h-8 bg-transparent text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 rounded-lg px-2 border border-transparent focus:border-primary transition-all";
const textareaClass = "w-full bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all min-h-[96px] resize-y";
const fieldLabelClass = "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

type FieldType = "text" | "number" | "date";

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function Section({ icon: Icon, title, dot = "primary", children }: { icon?: React.ComponentType<{ className?: string }>; title: string; dot?: "primary" | "accent"; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dot === "accent" ? "bg-accent" : "bg-primary"}`} />
        {Icon && <Icon className={`h-4 w-4 ${dot === "accent" ? "text-accent" : "text-primary"}`} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldTile({ label, icon: Icon, name, value, readOnly, onChange, type = "text", placeholder, render }: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  name: string;
  value?: unknown;
  readOnly: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: FieldType;
  placeholder?: string;
  render?: (v: unknown) => string;
}) {
  const hasVal = hasValue(value);
  const inputVal = type === "date" && value ? new Date(String(value)).toISOString().split("T")[0] : (hasVal ? String(value) : "");
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3.5 space-y-1.5 transition-all focus-within:border-primary/40 focus-within:bg-primary/[0.03]">
      <p className={fieldLabelClass}>
        {Icon && <Icon className="h-3.5 w-3.5 text-primary/80 shrink-0" />}
        <span className="truncate">{label}</span>
      </p>
      {readOnly ? (
        <p className="text-sm font-semibold leading-snug break-words min-h-[1.25rem]">
          {hasVal ? (render ? render(value) : String(value)) : <span className="italic font-normal text-muted-foreground">—</span>}
        </p>
      ) : type === "date" ? (
        <input type="date" name={name} value={inputVal} onChange={onChange} className={compactInputClass} />
      ) : (
        <input type={type} name={name} value={inputVal} onChange={onChange} placeholder={placeholder} className={`${compactInputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
      )}
    </div>
  );
}

function TextBlock({ label, icon: Icon, name, value, readOnly, onChange, placeholder, rows = 4 }: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  name: string;
  value?: unknown;
  readOnly: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  const text = hasValue(value) ? String(value) : "";
  return (
    <div className="space-y-2">
      <p className={fieldLabelClass}>
        {Icon && <Icon className="h-3.5 w-3.5 text-primary/80 shrink-0" />}
        <span>{label}</span>
      </p>
      {readOnly ? (
        text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">Not specified.</p>
        )
      ) : (
        <textarea name={name} value={text} onChange={onChange} placeholder={placeholder} rows={rows} className={textareaClass} />
      )}
    </div>
  );
}

const renderValue = (v: unknown) => formatValue(Number(v));
const renderEmd = (v: unknown) => formatEmd(Number(v));

export function TenderDetailView({ tender, onClose, onUpdate, readOnly = false }: TenderDetailViewProps) {
  const [formData, setFormData] = useState({ ...tender });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [uploadType, setUploadType] = useState<"document" | "corrigendum">("document");
  const [deletePending, setDeletePending] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isCorrigendum = uploadType === "corrigendum";
    setIsUploading(true);
    setError(null);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("tenderId", tender.internalId);
    uploadData.append("type", uploadType);

    try {
      const response = await axios.post("/api/upload", uploadData);
      const url = response.data.url;
      const updatedTender = {
        ...formData,
        [isCorrigendum ? "corrigendumFiles" : "tenderDocuments"]: [
          ...(isCorrigendum ? formData.corrigendumFiles || [] : formData.tenderDocuments || []),
          url,
        ],
      };
      setFormData(updatedTender);
      setSuccess(isCorrigendum ? "Corrigendum uploaded successfully!" : "File uploaded successfully!");
      await axios.patch(`/api/tenders/${tender._id}`, updatedTender);
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (url: string) => {
    if (deletePending !== url) {
      setDeletePending(url);
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await axios.delete("/api/attachments", { params: { url } });
      const updatedTender = {
        ...formData,
        tenderDocuments: (formData.tenderDocuments || []).filter((u: string) => u !== url),
        corrigendumFiles: (formData.corrigendumFiles || []).filter((u: string) => u !== url),
      };
      setFormData(updatedTender);
      setSuccess("File deleted successfully!");
      onUpdate();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to delete file. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeletePending(null);
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
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <p className="text-xs text-muted-foreground">{readOnly ? "View complete tender record" : "Manage complete tender record"}</p>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <p className="text-[10px] font-semibold text-muted-foreground/80">Last updated {formatTimestamp(formData.updatedAt || formData.createdAt)}</p>
            </div>
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

        {/* Tender Title */}
        <Section icon={FileText} title="Tender Title">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            {readOnly ? (
              <h1 className="text-lg lg:text-xl font-bold leading-snug">{formData.title || "—"}</h1>
            ) : (
              <textarea name="title" value={formData.title} onChange={handleChange} className={`${textareaClass} font-bold min-h-[64px]`} rows={2} />
            )}
          </div>
        </Section>

        {/* Basic Information */}
        <Section icon={Building2} title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 rounded-2xl border border-border bg-card/60 p-4">
            <FieldTile label="Organisation" icon={Building2} name="organization" value={formData.organization} readOnly={readOnly} onChange={handleChange} placeholder="Name of department" />
            <FieldTile label="Reference No." icon={Gavel} name="tenderNo" value={formData.tenderNo} readOnly={readOnly} onChange={handleChange} placeholder="TN-2024-001" />
            <FieldTile label="Portal Tender ID" icon={FileCheck} name="portalId" value={formData.portalId} readOnly={readOnly} onChange={handleChange} placeholder="Portal-ID-12345" />
            <FieldTile label="Published Date" icon={Calendar} name="publishDate" type="date" value={formData.publishDate} readOnly={readOnly} onChange={handleChange} render={(v) => formatDate(String(v))} />
            <FieldTile label="Due Date" icon={Clock} name="dueDate" type="date" value={formData.dueDate} readOnly={readOnly} onChange={handleChange} render={(v) => formatDate(String(v))} />
          </div>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commercial */}
          <Section icon={Banknote} title="Commercial">
            <div className="rounded-2xl border border-border bg-card/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldTile label="EMD" icon={ShieldCheck} name="emdAmount" type="number" value={formData.emdAmount} readOnly={readOnly} onChange={handleChange} render={renderEmd} />
              <FieldTile label="Contract Value" icon={IndianRupee} name="tenderValue" type="number" value={formData.tenderValue} readOnly={readOnly} onChange={handleChange} render={renderValue} />
              <div className="sm:col-span-2">
                <TextBlock label="Payment Terms" icon={ReceiptText} name="paymentTerms" value={formData.paymentTerms} readOnly={readOnly} onChange={handleChange} placeholder="e.g. 90% on milestone completion, 10% retention for one year..." rows={3} />
              </div>
            </div>
          </Section>

          {/* Authority / Contact */}
          <Section icon={Users} title="Authority / Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-card/60 p-4">
              <div className="sm:col-span-2">
                <FieldTile label="Location of Works" icon={MapPin} name="location" value={formData.location} readOnly={readOnly} onChange={handleChange} placeholder="e.g. Nagpur, Maharashtra" />
              </div>
              <FieldTile label="Officer" icon={User} name="contactPerson" value={formData.contactPerson} readOnly={readOnly} onChange={handleChange} placeholder="Name of the officer" />
              <FieldTile label="Designation" icon={BadgeCheck} name="officerDesignation" value={formData.officerDesignation} readOnly={readOnly} onChange={handleChange} placeholder="e.g. Executive Engineer" />
              <FieldTile label="Phone" icon={Phone} name="contactPhone" value={formData.contactPhone} readOnly={readOnly} onChange={handleChange} placeholder="+91 00000 00000" />
              <FieldTile label="Email" icon={Mail} name="contactEmail" value={formData.contactEmail} readOnly={readOnly} onChange={handleChange} placeholder="officer@example.com" />
            </div>
          </Section>
        </div>

        {/* Eligibility */}
        <Section icon={ShieldCheck} title="Eligibility" dot="accent">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-2xl border border-border bg-card/60 p-5">
            <TextBlock label="Financial Criteria" icon={Scale} name="eligibilityFinancial" value={formData.eligibilityFinancial} readOnly={readOnly} onChange={handleChange} placeholder="Turnover, net worth, similar work value requirements..." />
            <TextBlock label="Technical Criteria" icon={Wrench} name="eligibilityTechnical" value={formData.eligibilityTechnical} readOnly={readOnly} onChange={handleChange} placeholder="Qualification, machinery, experience requirements..." />
            <TextBlock label="JV / Consortium" icon={Users} name="eligibilityJV" value={formData.eligibilityJV} readOnly={readOnly} onChange={handleChange} placeholder="Joint venture / consortium participation rules..." />
          </div>
        </Section>

        {/* Scope & Technical Analysis */}
        <Section icon={ClipboardList} title="Scope & Technical Analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-border bg-card/60 p-5">
            <TextBlock label="Scope of Work" icon={ClipboardList} name="scopeOfWork" value={formData.scopeOfWork} readOnly={readOnly} onChange={handleChange} placeholder="Describe the detailed scope of work for this tender..." />
            <TextBlock label="Technical Analysis" icon={Wrench} name="technicalAnalysis" value={formData.technicalAnalysis} readOnly={readOnly} onChange={handleChange} placeholder="Technical feasibility, methodology, specifications, risks..." />
          </div>
        </Section>

        {/* BOQ / Price Schedule */}
        <Section icon={FileSpreadsheet} title="BOQ / Price Schedule">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <TextBlock label="BOQ Summary / Price Schedule Notes" icon={FileSpreadsheet} name="boqSummary" value={formData.boqSummary} readOnly={readOnly} onChange={handleChange} placeholder="Key items, rates, quantities, and price schedule highlights..." rows={4} />
          </div>
        </Section>

        {/* Documents & Corrigenda */}
        <Section icon={Paperclip} title="Tender Documents & Corrigenda">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <div className="flex p-1 bg-muted rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setUploadType("document")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${uploadType === "document" ? "bg-primary text-white shadow-md shadow-primary/25" : "text-muted-foreground hover:text-foreground"}`}
              >
                <FileText className="h-3.5 w-3.5" />
                Tender Docs
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${uploadType === "document" ? "bg-white/20" : "bg-card text-muted-foreground"}`}>{formData.tenderDocuments?.length || 0}</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType("corrigendum")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${uploadType === "corrigendum" ? "bg-primary text-white shadow-md shadow-primary/25" : "text-muted-foreground hover:text-foreground"}`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                Corrigendum
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${uploadType === "corrigendum" ? "bg-white/20" : "bg-card text-muted-foreground"}`}>{formData.corrigendumFiles?.length || 0}</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase flex items-center justify-between">
                Tender Documents (PDF)
                <span className="text-[10px] lowercase font-normal italic">Cloud folder: {tender.internalId}</span>
              </label>
              <FileList files={formData.tenderDocuments} label="Document" canDelete={!readOnly} deleting={isDeleting} pendingDelete={deletePending} onDelete={handleDeleteFile} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">
                Corrigendum Files (PDF)
              </label>
              <FileList files={formData.corrigendumFiles} label="Corrigendum" canDelete={!readOnly} deleting={isDeleting} pendingDelete={deletePending} onDelete={handleDeleteFile} />
            </div>

            {!readOnly && (
              <div className="relative group/upload">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading || isDeleting} />
                <div className="p-4 border-2 border-dashed border-primary/20 dark:border-primary/10 rounded-xl flex flex-col items-center justify-center gap-1.5 group-hover/upload:border-primary/50 transition-all bg-primary/[0.02] group-hover/upload:bg-primary/[0.05] text-center">
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary">Add {uploadType === "corrigendum" ? "Corrigendum" : "Tender"} PDF</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground italic">{uploadType === "corrigendum" ? "Extension or technical-parameter corrigendum" : "Original tender documents"}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
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

function FileList({ files, label, canDelete, deleting, pendingDelete, onDelete }: { files?: string[]; label: string; canDelete: boolean; deleting: boolean; pendingDelete: string | null; onDelete: (url: string) => void }) {
  if (!files || files.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border text-muted-foreground">
        <FileText className="h-4 w-4 shrink-0" />
        <span className="text-xs">No {label.toLowerCase()} files uploaded yet.</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      {files.map((url, idx) => {
        const isPending = pendingDelete === url;
        return (
          <div key={url} className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all ${isPending ? "border-destructive/40 bg-destructive/5" : "border-primary/10 bg-primary/5"}`}>
            <div className="flex items-center gap-3 min-w-0">
              <Paperclip className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium truncate max-w-[220px]">{label}_{idx + 1}.pdf</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline cursor-pointer">VIEW</a>
              {canDelete && (
                isPending ? (
                  <button onClick={() => onDelete(url)} disabled={deleting} className="px-2 py-1 rounded-lg bg-destructive text-white text-[10px] font-bold hover:brightness-110 transition-all cursor-pointer">
                    {deleting ? "Deleting…" : "Confirm?"}
                  </button>
                ) : (
                  <button onClick={() => onDelete(url)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer" title="Delete this file" aria-label="Delete file">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}