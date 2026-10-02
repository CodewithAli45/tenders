"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, CalendarDays, Check, ChevronRight, CircleDollarSign, Clock3, FileText, Plus, Save, Search, Trash2, UserRound, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TenderOption = {
  _id: string;
  internalId: string;
  title: string;
  organization: string;
  dueDate: string;
  tenderValue?: number;
};

type Bidder = {
  id: string;
  bidder_name: string;
  technical_status: string;
  quoted_rate: number | null;
  financial_rank: number | null;
  notes: string | null;
};

type TrackingRecord = {
  id: string;
  stage: string;
  notes: string | null;
  tender: { id: string; internal_id: string; title: string; organization: string; due_date: string; tender_value: number | null };
  bidders: Bidder[];
};

type BidderDraft = { bidderName: string; technicalStatus: string; quotedRate: string; financialRank: string; notes: string };

const stages = [
  ["awaiting_bid_opening", "Awaiting bid opening"],
  ["technical_evaluation", "Technical evaluation"],
  ["financial_evaluation", "Financial evaluation"],
  ["awarded", "Awarded"],
  ["cancelled", "Cancelled"],
  ["on_hold", "On hold"],
] as const;

const technicalStatuses = [
  ["pending", "Pending"],
  ["qualified", "Qualified"],
  ["disqualified", "Disqualified"],
  ["not_applicable", "Not applicable"],
] as const;

const formatDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatRate = (value: number | null) => value == null ? "—" : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
const todayISO = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export function TenderTrackingManager({ tenders }: { tenders: TenderOption[] }) {
  const [records, setRecords] = useState<TrackingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [tenderToAdd, setTenderToAdd] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [editingBidder, setEditingBidder] = useState<Bidder | null | undefined>(undefined);
  const [bidderSaveRequest, setBidderSaveRequest] = useState<{ values: BidderDraft; bidder?: Bidder } | null>(null);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (preferredId: string | null = null) => {
    setLoading(true);
    try {
      const response = await axios.get<TrackingRecord[]>("/api/admin/tender-tracking");
      const nextRecords = response.data;
      setRecords(nextRecords);
      const nextSelected = nextRecords.find((record) => record.id === preferredId) ?? nextRecords[0] ?? null;
      setSelectedId(nextSelected?.id ?? null);
      setNotesDraft(nextSelected?.notes ?? "");
      setError("");
    } catch {
      setError("Could not load the tender tracker. Confirm the tracker migration has been applied.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(null); }, [refresh]);

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const trackedTenderIds = useMemo(() => new Set(records.map((record) => record.tender.id)), [records]);
  const availableTenders = useMemo(() => tenders
    .filter((tender) => !trackedTenderIds.has(tender._id))
    .sort((a, b) => Number(b.dueDate < todayISO()) - Number(a.dueDate < todayISO()) || a.dueDate.localeCompare(b.dueDate)), [tenders, trackedTenderIds]);
  const filteredRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return records;
    return records.filter(({ tender }) => `${tender.internal_id} ${tender.title} ${tender.organization}`.toLowerCase().includes(value));
  }, [query, records]);

  async function addTender() {
    if (!tenderToAdd) return;
    setSaving(true);
    setError("");
    try {
      const response = await axios.post<TrackingRecord>("/api/admin/tender-tracking", { tenderId: tenderToAdd });
      setShowAdd(false);
      setTenderToAdd("");
      await refresh(response.data.id);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not add this tender to the tracker." : "Could not add this tender to the tracker.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTracking(changes: { stage?: string; notes?: string }) {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await axios.patch(`/api/admin/tender-tracking/${selected.id}`, changes);
      await refresh(selected.id);
    } catch {
      setError("Could not save tracker changes.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTracking() {
    if (!selected || !window.confirm(`Remove ${selected.tender.internal_id} and its bidder records from the tracker?`)) return;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/tender-tracking/${selected.id}`);
      setEditingBidder(undefined);
      await refresh(null);
    } catch {
      setError("Could not remove this tender from the tracker.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBidder(values: { bidderName: string; technicalStatus: string; quotedRate: string; financialRank: string; notes: string }, bidder?: Bidder) {
    if (!selected) return;
    setSaving(true);
    setError("");
    const payload = {
      ...values,
      quotedRate: values.quotedRate === "" ? null : values.quotedRate,
      financialRank: values.financialRank === "" ? null : values.financialRank,
    };
    try {
      if (bidder) await axios.patch(`/api/admin/tender-tracking/bidders/${bidder.id}`, payload);
      else await axios.post(`/api/admin/tender-tracking/${selected.id}/bidders`, payload);
      setEditingBidder(undefined);
      setBidderSaveRequest(null);
      setNotice("Bidder details saved and published to the public Status Tracker.");
      await refresh(selected.id);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not save bidder details." : "Could not save bidder details.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBidder(bidder: Bidder) {
    if (!window.confirm(`Remove ${bidder.bidder_name} from this tender?`)) return;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/tender-tracking/bidders/${bidder.id}`);
      await refresh(selectedId);
    } catch {
      setError("Could not remove bidder.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-7">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Post-bid workflow</p>
              <h2 className="mt-1 text-xl font-bold">Tender status tracker</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Track bidder outcomes and evaluation progress. A due-date extension updates the deadline badge; it won’t remove the tender from this list.</p>
            </div>
            <button type="button" onClick={() => { setShowAdd((value) => !value); setError(""); }} disabled={!availableTenders.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="h-4 w-4" /> Add expired tender
            </button>
          </div>

          {showAdd && (
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 space-y-1.5 text-xs font-bold text-muted-foreground">
                Select tender <span className="font-normal">(expired deadlines are listed first; you can also add a tender whose deadline was extended)</span>
                <select value={tenderToAdd} onChange={(event) => setTenderToAdd(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-primary">
                  <option value="">Choose a tender…</option>
                  {availableTenders.map((tender) => <option key={tender._id} value={tender._id}>{tender.internalId} · {tender.title} · due {formatDate(tender.dueDate)}</option>)}
                </select>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => void addTender()} disabled={!tenderToAdd || saving} className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-white disabled:opacity-50">{saving ? "Adding…" : "Add to tracker"}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground" aria-label="Cancel"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">{notice}</p>}

          <div className="grid min-h-[32rem] grid-cols-1 gap-4 xl:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.6fr)]">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 font-bold"><Activity className="h-4 w-4 text-primary" />Tracked tenders <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{records.length}</span></div>
                <button type="button" onClick={() => void refresh(selectedId)} className="text-xs font-bold text-primary hover:underline">Refresh</button>
              </div>
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, title, organization" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="max-h-[34rem] divide-y divide-border overflow-y-auto">
                {loading && !records.length ? <p className="p-6 text-sm text-muted-foreground">Loading tracker…</p> : filteredRecords.length ? filteredRecords.map((record) => {
                  const due = record.tender.due_date;
                  const expired = due < todayISO();
                  return (
                    <button key={record.id} type="button" onClick={() => { setSelectedId(record.id); setNotesDraft(record.notes ?? ""); setEditingBidder(undefined); }} className={`w-full p-4 text-left transition hover:bg-muted/50 ${selectedId === record.id ? "bg-primary/[0.06]" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{record.tender.internal_id}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold">{record.tender.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{record.tender.organization}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold">{stages.find(([value]) => value === record.stage)?.[1] ?? record.stage}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${expired ? "text-warning" : "text-muted-foreground"}`}><Clock3 className="h-3 w-3" />Due {formatDate(due)}</span>
                      </div>
                    </button>
                  );
                }) : <div className="p-7 text-center"><FileText className="mx-auto h-7 w-7 text-muted-foreground/60" /><p className="mt-2 text-sm font-semibold">{query ? "No matching tenders" : "No tenders tracked yet"}</p><p className="mt-1 text-xs text-muted-foreground">Add a tender after bidding closes to begin tracking evaluation.</p></div>}
              </div>
            </section>

            {selected ? (
              <section className="min-w-0 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-primary">{selected.tender.internal_id}</p>
                      <h3 className="mt-1 text-base font-bold leading-snug">{selected.tender.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{selected.tender.organization}</p>
                    </div>
                    <button type="button" onClick={() => void removeTracking()} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 px-2.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <SummaryItem icon={CalendarDays} label="Current due date" value={formatDate(selected.tender.due_date)} />
                    <SummaryItem icon={CircleDollarSign} label="Tender value" value={selected.tender.tender_value == null ? "Refer document" : formatRate(selected.tender.tender_value)} />
                    <SummaryItem icon={Users} label="Bidders" value={String(selected.bidders.length)} />
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-bold text-muted-foreground">Evaluation stage
                      <select value={selected.stage} onChange={(event) => void updateTracking({ stage: event.target.value })} disabled={saving} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60">
                        {stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <div className="space-y-1.5 text-xs font-bold text-muted-foreground">Deadline status
                      <p className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm ${selected.tender.due_date < todayISO() ? "border-warning/20 bg-warning/5 text-warning" : "border-accent/20 bg-accent/5 text-accent"}`}>
                        <Clock3 className="h-4 w-4" />{selected.tender.due_date < todayISO() ? "Submission deadline passed" : "Current due date has not passed"}
                      </p>
                    </div>
                  </div>
                  <label className="mt-4 block space-y-1.5 text-xs font-bold text-muted-foreground">Internal tracking notes
                    <textarea value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} rows={3} placeholder="Opening date, next evaluation meeting, follow-up…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary" />
                  </label>
                  <button type="button" onClick={() => void updateTracking({ notes: notesDraft })} disabled={saving || notesDraft === (selected.notes ?? "")} className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-white disabled:opacity-50"><Save className="h-3.5 w-3.5" /> Save notes</button>
                </div>

                <div className="rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div><h4 className="font-bold">Bidders & quoted rates</h4><p className="mt-0.5 text-xs text-muted-foreground">Saved bidder results appear on the public Status Tracker.</p></div>
                    {editingBidder === undefined && <button type="button" onClick={() => setEditingBidder(null)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Add bidder</button>}
                  </div>
                  <div className="space-y-3 p-4">
                    {editingBidder === null && <BidderEditor saving={saving} onCancel={() => setEditingBidder(undefined)} onRequestSave={(values) => { setError(""); setNotice(""); setBidderSaveRequest({ values }); }} />}
                    {selected.bidders.length === 0 && editingBidder !== null && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No bidders recorded yet.</p>}
                    {selected.bidders.map((bidder) => editingBidder?.id === bidder.id ? (
                      <BidderEditor key={bidder.id} bidder={bidder} saving={saving} onCancel={() => setEditingBidder(undefined)} onRequestSave={(values) => { setError(""); setNotice(""); setBidderSaveRequest({ values, bidder }); }} />
                    ) : (
                      <article key={bidder.id} className="rounded-xl border border-border bg-background/50 p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0"><p className="font-semibold">{bidder.bidder_name}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${bidder.technical_status === "qualified" ? "bg-accent/10 text-accent" : bidder.technical_status === "disqualified" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{technicalStatuses.find(([value]) => value === bidder.technical_status)?.[1] ?? bidder.technical_status}</span></div>
                          <div className="flex items-center gap-4"><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quoted rate</p><p className="font-bold">{formatRate(bidder.quoted_rate)}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rank</p><p className="font-bold">{bidder.financial_rank ?? "—"}</p></div></div>
                        </div>
                        {bidder.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{bidder.notes}</p>}
                        <div className="mt-3 flex justify-end gap-2 border-t border-border pt-2"><button type="button" onClick={() => setEditingBidder(bidder)} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">Edit</button><button type="button" onClick={() => void removeBidder(bidder)} disabled={saving} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/5">Remove</button></div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center"><div><UserRound className="mx-auto h-8 w-8 text-muted-foreground/60" /><p className="mt-2 font-semibold">Choose a tracked tender</p><p className="mt-1 text-sm text-muted-foreground">Its evaluation and bidder details will appear here.</p></div></div>
            )}
          </div>
        </div>
      </div>
      {bidderSaveRequest && (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="bidder-save-title" className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Save className="h-5 w-5" /></div>
            <div className="text-center"><h2 id="bidder-save-title" className="text-lg font-bold">Save bidder details?</h2><p className="mt-2 text-sm text-muted-foreground">{bidderSaveRequest.bidder ? "Your changes" : "This bidder"} will appear on the public Status Tracker with the technical result, quoted rate, and rank. Internal notes stay private.</p></div>
            {error && <p role="alert" className="rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex gap-3"><button type="button" onClick={() => { setBidderSaveRequest(null); setError(""); }} disabled={saving} className="h-10 flex-1 rounded-lg border border-border text-sm font-bold disabled:opacity-50">Continue editing</button><button type="button" onClick={() => void saveBidder(bidderSaveRequest.values, bidderSaveRequest.bidder)} disabled={saving} className="h-10 flex-1 rounded-lg bg-primary text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save and publish"}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="min-w-0 rounded-lg border border-border bg-background/60 px-3 py-2"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-3 w-3 text-primary" />{label}</p><p className="mt-1 truncate text-sm font-bold" title={value}>{value}</p></div>;
}

function BidderEditor({ bidder, saving, onRequestSave, onCancel }: {
  bidder?: Bidder;
  saving: boolean;
  onRequestSave: (values: BidderDraft) => void;
  onCancel: () => void;
}) {
  const [bidderName, setBidderName] = useState(bidder?.bidder_name ?? "");
  const [technicalStatus, setTechnicalStatus] = useState(bidder?.technical_status ?? "pending");
  const [quotedRate, setQuotedRate] = useState(bidder?.quoted_rate == null ? "" : String(bidder.quoted_rate));
  const [financialRank, setFinancialRank] = useState(bidder?.financial_rank == null ? "" : String(bidder.financial_rank));
  const [notes, setNotes] = useState(bidder?.notes ?? "");
  const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary";
  return (
    <form onSubmit={(event) => { event.preventDefault(); onRequestSave({ bidderName, technicalStatus, quotedRate, financialRank, notes }); }} className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold text-muted-foreground">Bidder / contractor name<input required value={bidderName} onChange={(event) => setBidderName(event.target.value)} className={inputClass} /></label>
        <label className="space-y-1 text-xs font-semibold text-muted-foreground">Technical result<select value={technicalStatus} onChange={(event) => setTechnicalStatus(event.target.value)} className={inputClass}>{technicalStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="space-y-1 text-xs font-semibold text-muted-foreground">Quoted rate (₹)<input type="number" min="0" step="0.01" value={quotedRate} onChange={(event) => setQuotedRate(event.target.value)} className={inputClass} placeholder="Leave blank if not opened" /></label>
        <label className="space-y-1 text-xs font-semibold text-muted-foreground">Financial rank<input type="number" min="1" step="1" value={financialRank} onChange={(event) => setFinancialRank(event.target.value)} className={inputClass} placeholder="Optional" /></label>
      </div>
      <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary" /></label>
      <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Cancel</button><button type="submit" disabled={!bidderName.trim() || saving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" />Continue to save</button></div>
    </form>
  );
}
