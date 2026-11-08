"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Building2, FileSpreadsheet, FileText, FolderOpen, Home, LayoutDashboard, LogOut, Newspaper, Plus, RefreshCw, Search, X } from "lucide-react";
import axios from "axios";
import { GoogleSheetsSync } from "./google-sheets-sync";
import { NewTenderForm } from "./new-tender-form";
import { NewOrganizationForm } from "./new-organization-form";
import { TenderDetailView } from "./tender-detail-view";
import { TenderTrackingManager } from "./tender-tracking-manager";

interface AdminDashboardProps { onClose?: () => void; isModal?: boolean; initialSection?: Section }
type Section = "tenders" | "organizations" | "attachments" | "tracking" | "sheets" | "news";
type Tender = { _id: string; internalId: string; title: string; organization: string; dueDate: string; tenderValue?: number; tenderDocuments?: string[]; corrigendumFiles?: string[]; createdAt?: string };
type Organization = { _id: string; name: string; details: string; contactPerson?: string; email?: string; phone?: string; address?: string; createdAt?: string };

export function AdminDashboard({ onClose, isModal = false, initialSection = "tenders" }: AdminDashboardProps) {
  const [section, setSection] = useState<Section>(initialSection);
  const [mode, setMode] = useState<"list" | "newTender" | "newOrganization">("list");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [viewingTender, setViewingTender] = useState<Tender | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tenderSearch, setTenderSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenderResponse, organizationResponse] = await Promise.all([axios.get("/api/tenders"), axios.get("/api/organizations")]);
      setTenders(tenderResponse.data);
      setOrganizations(organizationResponse.data);
    } catch (error) { console.error("Could not load admin records:", error); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const attachments = useMemo(() => tenders.flatMap((tender) => [
    ...(tender.tenderDocuments || []).map((url, index) => ({ id: `${tender._id}-document-${index}`, url, tender, type: "Document" })),
    ...(tender.corrigendumFiles || []).map((url, index) => ({ id: `${tender._id}-corrigendum-${index}`, url, tender, type: "Corrigendum" })),
  ]), [tenders]);
  const label = section === "tenders" ? "Tenders" : section === "organizations" ? "Organization" : section === "attachments" ? "Attachment" : section === "sheets" ? "Google Sheets" : section === "news" ? "Platform News" : "Status Tracker";
  const navSections = [
    { id: "tenders", label: "Tenders", short: "Tenders", icon: FileText },
    { id: "tracking", label: "Status Tracker", short: "Tracker", icon: Activity },
    { id: "organizations", label: "Organizations", short: "Orgs", icon: Building2 },
    { id: "attachments", label: "Attachments", short: "Files", icon: FolderOpen },
    { id: "sheets", label: "Google Sheets", short: "Sheets", icon: FileSpreadsheet },
    { id: "news", label: "News Preview", short: "News", icon: Newspaper },
  ] as const;
  const showMobileNav = mode === "list" && !viewingTender && !viewingOrganization;

  async function logout() { setIsLoggingOut(true); await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/"); }
  function closeEditor() { setMode("list"); setViewingTender(null); setViewingOrganization(null); }

  return <div className={`flex h-full w-full flex-col overflow-hidden bg-background text-foreground lg:flex-row ${isModal ? "rounded-2xl" : ""}`}>
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center justify-center gap-3 border-b border-border px-2 py-6 lg:justify-start lg:px-5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><LayoutDashboard className="h-5 w-5" /></div><div className="hidden lg:block"><p className="font-bold">Admin panel</p><p className="text-xs text-muted-foreground">Tender records</p></div></div>
      <nav className="flex-1 space-y-1 p-3">
        {navSections.map((item) => <button key={item.id} onClick={() => { setSection(item.id); closeEditor(); }} className={`flex w-full items-center justify-start gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><item.icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></button>)}
      </nav>
      <div className="space-y-1 border-t border-border p-3"><Link href="/" className="flex w-full items-center justify-start gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><Home className="h-4 w-4 shrink-0" /><span>Back to Home</span></Link><button onClick={logout} disabled={isLoggingOut} className="flex w-full items-center justify-start gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"><LogOut className="h-4 w-4 shrink-0" /><span>{isLoggingOut ? "Signing out…" : "Logout"}</span></button></div>
    </aside>

    <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === "newTender" ? <motion.div key="new-tender" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewTenderForm onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        mode === "newOrganization" ? <motion.div key="new-organization" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewOrganizationForm onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        viewingOrganization ? <motion.div key="edit-organization" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewOrganizationForm organization={viewingOrganization} onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        viewingTender ? <motion.div key="tender-detail" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><TenderDetailView tender={viewingTender} onClose={closeEditor} onUpdate={loadData} /></motion.div> :
        <motion.div key="list" className="flex h-full flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 md:min-h-20 md:px-8"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">{section === "tracking" ? "Post-bid workflow" : section === "sheets" ? "Publishing" : section === "news" ? "AI generated · preview only" : "Database table"}</p><h1 className="mt-0.5 truncate text-lg font-bold sm:mt-1 sm:text-xl">{label}</h1></div><div className="flex items-center gap-2">{section !== "tracking" && section !== "sheets" && section !== "news" && <button onClick={loadData} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary" aria-label="Refresh records" title="Refresh"><RefreshCw className="h-4 w-4" /></button>}{(section === "tenders" || section === "organizations") && <button onClick={() => setMode(section === "tenders" ? "newTender" : "newOrganization")} className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 sm:px-4"><Plus className="h-4 w-4" />Add<span className="hidden sm:inline">&nbsp;{section === "tenders" ? "tender" : "organization"}</span></button>}<button onClick={logout} disabled={isLoggingOut} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-60 lg:hidden" aria-label="Logout" title="Logout"><LogOut className="h-4 w-4" /></button>{isModal && <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>}</div></header>
          {section === "tracking" ? (
            <div className="min-h-0 flex-1"><TenderTrackingManager tenders={tenders} /></div>
          ) : section === "sheets" ? (
            <section className="flex-1 overflow-auto p-3 sm:p-5 md:p-8"><GoogleSheetsSync /></section>
          ) : section === "news" ? (
            <section className="flex-1 overflow-auto p-3 sm:p-5 md:p-8"><PlatformNewsPreview /></section>
          ) : <section className="flex-1 overflow-auto p-3 sm:p-5 md:p-8">
            {section === "tenders" && (
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={tenderSearch}
                    onChange={(e) => setTenderSearch(e.target.value)}
                    placeholder="Search ID, title, organization..."
                    className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Showing {tenders.length} tender{tenders.length === 1 ? "" : "s"} · newest first</p>
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {section === "tenders" && <TenderTable tenders={tenders} search={tenderSearch} loading={loading} onSelect={setViewingTender} />}
              {section === "organizations" && <OrganizationTable organizations={organizations} loading={loading} onSelect={setViewingOrganization} />}
              {section === "attachments" && <AttachmentTable attachments={attachments} loading={loading} />}
            </div>
            {section === "tenders" && tenders.length > 0 && !loading && (
              <p className="mt-3 text-xs text-muted-foreground">
                Tip: search or scroll to find older tenders, then click any row to edit it — updates sync to the dashboard.
              </p>
            )}
          </section>}
        </motion.div>}
      </AnimatePresence>
    </main>

    {showMobileNav && <nav aria-label="Admin sections" className="flex shrink-0 items-stretch justify-around border-t border-border bg-card px-1 py-1 lg:hidden">
      {navSections.map((item) => <button key={item.id} type="button" onClick={() => { setSection(item.id); closeEditor(); }} className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] font-bold transition ${section === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><item.icon className="h-4 w-4" /><span className="truncate">{item.short}</span></button>)}
      <Link href="/" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] font-bold text-muted-foreground transition hover:bg-muted"><Home className="h-4 w-4" /><span className="truncate">Home</span></Link>
    </nav>}
  </div>;
}

function LoadingRows({ columns }: { columns: number }) { return <tbody>{[1, 2, 3].map((row) => <tr key={row} className="animate-pulse"><td colSpan={columns} className="h-16 bg-muted/50" /></tr>)}</tbody>; }
function EmptyRow({ columns, children }: { columns: number; children: string }) { return <tbody><tr><td colSpan={columns} className="px-6 py-16 text-center text-sm text-muted-foreground">{children}</td></tr></tbody>; }
function TenderTable({ tenders, search = "", loading, onSelect }: { tenders: Tender[]; search?: string; loading: boolean; onSelect: (tender: Tender) => void }) {
  const query = search.trim().toLowerCase();
  const filtered = query ? tenders.filter((t) => t.internalId.toLowerCase().includes(query) || t.title.toLowerCase().includes(query) || t.organization.toLowerCase().includes(query)) : tenders;
  return <>
    <div className="divide-y divide-border md:hidden">
      {loading ? [1, 2, 3].map((row) => <div key={row} className="h-24 animate-pulse bg-muted/50" />) : filtered.length ? filtered.map((tender) => <button key={tender._id} type="button" onClick={() => onSelect(tender)} className="block w-full p-4 text-left transition hover:bg-muted/50">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold text-primary">{tender.internalId}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{new Date(tender.dueDate).toLocaleDateString()}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold">{tender.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{tender.organization}</p>
      </button>) : <p className="p-8 text-center text-sm text-muted-foreground">{query ? `No tenders match "${search.trim()}".` : "No tenders yet. Add your first tender."}</p>}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Tender ID</th><th className="px-5 py-4">Tender</th><th className="px-5 py-4">Organization</th><th className="px-5 py-4">Due date</th></tr></thead>{loading ? <LoadingRows columns={4} /> : filtered.length ? <tbody className="divide-y divide-border">{filtered.map((tender) => <tr key={tender._id} onClick={() => onSelect(tender)} className="cursor-pointer transition hover:bg-muted/50"><td className="px-5 py-4 font-mono text-xs font-bold text-primary">{tender.internalId}</td><td className="max-w-sm px-5 py-4 text-sm font-semibold">{tender.title}</td><td className="px-5 py-4 text-sm text-muted-foreground">{tender.organization}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">{new Date(tender.dueDate).toLocaleDateString()}</td></tr>)}</tbody> : <EmptyRow columns={4}>{query ? `No tenders match "${search.trim()}".` : "No tenders yet. Add your first tender."}</EmptyRow>}</table>
    </div>
  </>;
}
function OrganizationTable({ organizations, loading, onSelect }: { organizations: Organization[]; loading: boolean; onSelect: (organization: Organization) => void }) {
  return <>
    <div className="divide-y divide-border md:hidden">
      {loading ? [1, 2, 3].map((row) => <div key={row} className="h-24 animate-pulse bg-muted/50" />) : organizations.length ? organizations.map((organization) => <button key={organization._id} type="button" onClick={() => onSelect(organization)} className="block w-full p-4 text-left transition hover:bg-muted/50">
        <p className="text-sm font-bold">{organization.name}</p>
        {organization.details && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{organization.details}</p>}
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{organization.contactPerson || organization.email || organization.phone || "No contact details"}</p>
      </button>) : <p className="p-8 text-center text-sm text-muted-foreground">No organizations yet. Add an organization with its details.</p>}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Organization</th><th className="px-5 py-4">Details</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Email / phone</th></tr></thead>{loading ? <LoadingRows columns={4} /> : organizations.length ? <tbody className="divide-y divide-border">{organizations.map((organization) => <tr key={organization._id} onClick={() => onSelect(organization)} className="cursor-pointer transition hover:bg-muted/50"><td className="px-5 py-4 text-sm font-bold">{organization.name}</td><td className="max-w-sm px-5 py-4 text-sm text-muted-foreground">{organization.details || "—"}</td><td className="px-5 py-4 text-sm text-muted-foreground">{organization.contactPerson || "—"}</td><td className="px-5 py-4 text-sm text-muted-foreground">{organization.email || organization.phone || "—"}</td></tr>)}</tbody> : <EmptyRow columns={4}>No organizations yet. Add an organization with its details.</EmptyRow>}</table>
    </div>
  </>;
}
function AttachmentTable({ attachments, loading }: { attachments: { id: string; url: string; tender: Tender; type: string }[]; loading: boolean }) {
  return <>
    <div className="divide-y divide-border md:hidden">
      {loading ? [1, 2, 3].map((row) => <div key={row} className="h-24 animate-pulse bg-muted/50" />) : attachments.length ? attachments.map((attachment) => <div key={attachment.id} className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{attachment.type}</span>
          <a className="text-xs font-bold text-primary hover:underline" href={attachment.url} target="_blank" rel="noreferrer">View file</a>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold">{attachment.tender.title}</p>
        <p className="mt-1 font-mono text-xs text-primary">{attachment.tender.internalId}</p>
      </div>) : <p className="p-8 text-center text-sm text-muted-foreground">No attachments have been uploaded to tenders yet.</p>}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Type</th><th className="px-5 py-4">Tender</th><th className="px-5 py-4">Tender ID</th><th className="px-5 py-4">Open</th></tr></thead>{loading ? <LoadingRows columns={4} /> : attachments.length ? <tbody className="divide-y divide-border">{attachments.map((attachment) => <tr key={attachment.id}><td className="px-5 py-4 text-sm font-semibold">{attachment.type}</td><td className="max-w-sm px-5 py-4 text-sm text-muted-foreground">{attachment.tender.title}</td><td className="px-5 py-4 font-mono text-xs text-primary">{attachment.tender.internalId}</td><td className="px-5 py-4"><a className="text-sm font-semibold text-primary hover:underline" href={attachment.url} target="_blank" rel="noreferrer">View file</a></td></tr>)}</tbody> : <EmptyRow columns={4}>No attachments have been uploaded to tenders yet.</EmptyRow>}</table>
    </div>
  </>;
}

type PlatformNewsItem = { id: string; title: string; summary: string; category: string; date: string; tag: "Feature" | "Update" | "Announcement" };

function PlatformNewsPreview() {
  const [items, setItems] = useState<PlatformNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/admin/news-preview");
      setItems(response.data.items);
    } catch (cause) {
      setError(axios.isAxiosError(cause) ? cause.response?.data?.error || "Could not generate the preview." : "Could not generate the preview.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
      <div><h2 className="font-bold">Test platform news generation</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Gemini will create three draft highlights using only verified GovTender Pro capabilities. This preview is not saved or shown to visitors.</p></div>
      <button onClick={generate} disabled={loading} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"><Newspaper className="h-4 w-4" />{loading ? "Generating…" : "Generate preview"}</button>
    </div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {items.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div><div className="mb-3 flex items-center justify-between gap-2"><span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{item.tag}</span><time className="text-xs text-muted-foreground">{item.date}</time></div><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p></div>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">Category: <span className="font-medium text-foreground">{item.category}</span></p>
    </article>)}</div> : !loading && !error ? <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Generate a preview to see how platform news cards could look.</div> : null}
  </div>;
}
