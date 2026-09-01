"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, FileText, FolderOpen, Home, LayoutDashboard, LogOut, Plus, RefreshCw, Search, X } from "lucide-react";
import axios from "axios";
import { NewTenderForm } from "./new-tender-form";
import { NewOrganizationForm } from "./new-organization-form";
import { TenderDetailView } from "./tender-detail-view";

interface AdminDashboardProps { onClose?: () => void; isModal?: boolean }
type Section = "tenders" | "organizations" | "attachments";
type Tender = { _id: string; internalId: string; title: string; organization: string; dueDate: string; tenderDocuments?: string[]; createdAt?: string };
type Organization = { _id: string; name: string; details: string; contactPerson?: string; email?: string; phone?: string; address?: string; createdAt?: string };

export function AdminDashboard({ onClose, isModal = false }: AdminDashboardProps) {
  const [section, setSection] = useState<Section>("tenders");
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

  const attachments = useMemo(() => tenders.flatMap((tender) => (tender.tenderDocuments || []).map((url, index) => ({ id: `${tender._id}-${index}`, url, tender }))), [tenders]);
  const label = section === "tenders" ? "Tenders" : section === "organizations" ? "Organization" : "Attachment";

  async function logout() { setIsLoggingOut(true); await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/"); }
  function closeEditor() { setMode("list"); setViewingTender(null); setViewingOrganization(null); }

  return <div className={`flex h-full w-full overflow-hidden bg-background text-foreground ${isModal ? "rounded-2xl" : ""}`}>
    <aside className={`flex w-16 shrink-0 flex-col border-r border-border bg-card lg:w-64 ${mode !== "list" || viewingTender ? "hidden md:flex" : ""}`}>
      <div className="flex items-center justify-center gap-3 border-b border-border px-2 py-6 lg:justify-start lg:px-5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><LayoutDashboard className="h-5 w-5" /></div><div className="hidden lg:block"><p className="font-bold">Admin panel</p><p className="text-xs text-muted-foreground">Tender records</p></div></div>
      <nav className="flex-1 space-y-1 p-2 lg:p-3">
        {([{ id: "tenders", label: "Tenders", icon: FileText }, { id: "organizations", label: "Organization", icon: Building2 }, { id: "attachments", label: "Attachment", icon: FolderOpen }] as const).map((item) => <button key={item.id} onClick={() => { setSection(item.id); closeEditor(); }} className={`flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition lg:justify-start ${section === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><item.icon className="h-4 w-4 shrink-0" /><span className="hidden lg:inline">{item.label}</span></button>)}
      </nav>
      <div className="border-t border-border p-2 space-y-1 lg:p-3"><a href="/" className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground lg:justify-start"><Home className="h-4 w-4 shrink-0" /><span className="hidden lg:inline">Back to Home</span></a><button onClick={logout} disabled={isLoggingOut} className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60 lg:justify-start"><LogOut className="h-4 w-4 shrink-0" /><span className="hidden lg:inline">{isLoggingOut ? "Signing out…" : "Logout"}</span></button></div>
    </aside>

    <main className="min-w-0 flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === "newTender" ? <motion.div key="new-tender" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewTenderForm onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        mode === "newOrganization" ? <motion.div key="new-organization" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewOrganizationForm onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        viewingOrganization ? <motion.div key="edit-organization" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><NewOrganizationForm organization={viewingOrganization} onClose={closeEditor} onSuccess={() => { closeEditor(); loadData(); }} /></motion.div> :
        viewingTender ? <motion.div key="tender-detail" className="h-full" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}><TenderDetailView tender={viewingTender} onClose={closeEditor} onUpdate={loadData} /></motion.div> :
        <motion.div key="list" className="flex h-full flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 md:px-8"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Database table</p><h1 className="mt-1 text-xl font-bold">{label}</h1></div><div className="flex items-center gap-2"><button onClick={loadData} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary" aria-label="Refresh records" title="Refresh"><RefreshCw className="h-4 w-4" /></button>{section !== "attachments" && <button onClick={() => setMode(section === "tenders" ? "newTender" : "newOrganization")} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"><Plus className="h-4 w-4" />Add {section === "tenders" ? "tender" : "organization"}</button>}{isModal && <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>}</div></header>
          <section className="flex-1 overflow-auto p-5 md:p-8">
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
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              {section === "tenders" && <TenderTable tenders={tenders} search={tenderSearch} loading={loading} onSelect={setViewingTender} />}
              {section === "organizations" && <OrganizationTable organizations={organizations} loading={loading} onSelect={setViewingOrganization} />}
              {section === "attachments" && <AttachmentTable attachments={attachments} loading={loading} />}
            </div>
            {section === "tenders" && tenders.length > 0 && !loading && (
              <p className="mt-3 text-xs text-muted-foreground">
                Tip: search or scroll to find older tenders, then click any row to edit it — updates sync to the dashboard.
              </p>
            )}
          </section>
        </motion.div>}
      </AnimatePresence>
    </main>
  </div>;
}

function LoadingRows({ columns }: { columns: number }) { return <tbody>{[1, 2, 3].map((row) => <tr key={row} className="animate-pulse"><td colSpan={columns} className="h-16 bg-muted/50" /></tr>)}</tbody>; }
function EmptyRow({ columns, children }: { columns: number; children: string }) { return <tbody><tr><td colSpan={columns} className="px-6 py-16 text-center text-sm text-muted-foreground">{children}</td></tr></tbody>; }
function TenderTable({ tenders, search = "", loading, onSelect }: { tenders: Tender[]; search?: string; loading: boolean; onSelect: (tender: Tender) => void }) {
  const query = search.trim().toLowerCase();
  const filtered = query ? tenders.filter((t) => t.internalId.toLowerCase().includes(query) || t.title.toLowerCase().includes(query) || t.organization.toLowerCase().includes(query)) : tenders;
  return <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Tender ID</th><th className="px-5 py-4">Tender</th><th className="px-5 py-4">Organization</th><th className="px-5 py-4">Due date</th></tr></thead>{loading ? <LoadingRows columns={4} /> : filtered.length ? <tbody className="divide-y divide-border">{filtered.map((tender) => <tr key={tender._id} onClick={() => onSelect(tender)} className="cursor-pointer transition hover:bg-muted/50"><td className="px-5 py-4 font-mono text-xs font-bold text-primary">{tender.internalId}</td><td className="max-w-sm px-5 py-4 text-sm font-semibold">{tender.title}</td><td className="px-5 py-4 text-sm text-muted-foreground">{tender.organization}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">{new Date(tender.dueDate).toLocaleDateString()}</td></tr>)}</tbody> : <EmptyRow columns={4}>{query ? `No tenders match "${search.trim()}".` : "No tenders yet. Add your first tender."}</EmptyRow>}</table>;
}
function OrganizationTable({ organizations, loading, onSelect }: { organizations: Organization[]; loading: boolean; onSelect: (organization: Organization) => void }) { return <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Organization</th><th className="px-5 py-4">Details</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Email / phone</th></tr></thead>{loading ? <LoadingRows columns={4} /> : organizations.length ? <tbody className="divide-y divide-border">{organizations.map((organization) => <tr key={organization._id} onClick={() => onSelect(organization)} className="cursor-pointer transition hover:bg-muted/50"><td className="px-5 py-4 text-sm font-bold">{organization.name}</td><td className="max-w-sm px-5 py-4 text-sm text-muted-foreground">{organization.details || "—"}</td><td className="px-5 py-4 text-sm text-muted-foreground">{organization.contactPerson || "—"}</td><td className="px-5 py-4 text-sm text-muted-foreground">{organization.email || organization.phone || "—"}</td></tr>)}</tbody> : <EmptyRow columns={4}>No organizations yet. Add an organization with its details.</EmptyRow>}</table>; }
function AttachmentTable({ attachments, loading }: { attachments: { id: string; url: string; tender: Tender }[]; loading: boolean }) { return <table className="w-full min-w-[720px] text-left"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">File</th><th className="px-5 py-4">Tender</th><th className="px-5 py-4">Tender ID</th><th className="px-5 py-4">Open</th></tr></thead>{loading ? <LoadingRows columns={4} /> : attachments.length ? <tbody className="divide-y divide-border">{attachments.map((attachment, index) => <tr key={attachment.id}><td className="px-5 py-4 text-sm font-semibold">Attachment {index + 1}</td><td className="max-w-sm px-5 py-4 text-sm text-muted-foreground">{attachment.tender.title}</td><td className="px-5 py-4 font-mono text-xs text-primary">{attachment.tender.internalId}</td><td className="px-5 py-4"><a className="text-sm font-semibold text-primary hover:underline" href={attachment.url} target="_blank" rel="noreferrer">View file</a></td></tr>)}</tbody> : <EmptyRow columns={4}>No attachments have been uploaded to tenders yet.</EmptyRow>}</table>; }
