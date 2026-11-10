"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, CalendarDays, Check, ChevronRight, CircleDollarSign, Clock3, FileText, Plus, Save, Search, Trash2, UserRound, Users } from "lucide-react";
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
  bidder_profile_id?: string | null;
  profile?: BidderProfile | null;
};
type BidderProfile = { id: string; name: string; contact_person: string | null; email: string | null; phone: string | null; address: string | null; notes: string | null };

type TrackingRecord = {
  id: string | null;
  stage: string;
  technical_bid_mode: "summary" | "detailed";
  notes: string | null;
  tender: { id: string; internal_id: string; title: string; organization: string; due_date: string; tender_value: number | null };
  bidders: Bidder[];
};

type BidderDraft = { bidderName: string; profileId: string; technicalStatus: string; quotedRate: string; financialRank: string; notes: string };
type ProfileDraft = { name: string; contactPerson: string; email: string; phone: string; address: string; notes: string };

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
  ["qualified", "Qualified for next stage"],
  ["disqualified", "Rejected"],
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
  const [profiles, setProfiles] = useState<BidderProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"status" | "technical" | "financial" | "directory">("status");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stageDraft, setStageDraft] = useState("");
  const [technicalBidModeDraft, setTechnicalBidModeDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [editingBidder, setEditingBidder] = useState<Bidder | null | undefined>(undefined);
  const [bidderSaveRequest, setBidderSaveRequest] = useState<{ values: BidderDraft; bidder?: Bidder } | null>(null);
  const [editingProfile, setEditingProfile] = useState<BidderProfile | null | undefined>(undefined);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (preferredId: string | null = null) => {
    setLoading(true);
    try {
      const response = await axios.get<TrackingRecord[]>("/api/admin/tender-tracking");
      const profileResponse = await axios.get<BidderProfile[]>("/api/admin/bidder-profiles");
      setProfiles(profileResponse.data);
      const nextRecords = response.data;
      setRecords(nextRecords);
      const expiredTenders = tenders.filter((tender) => tender.dueDate < todayISO());
      const preferredTender = expiredTenders.find((tender) => tender._id === preferredId) ?? expiredTenders[0] ?? null;
      setSelectedId(preferredTender?._id ?? null);
      setError("");
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not load expired tenders and saved statuses." : "Could not load expired tenders and saved statuses.");
    } finally {
      setLoading(false);
    }
  }, [tenders]);

  useEffect(() => { void refresh(null); }, [refresh]);

  const trackerRows = useMemo(() => {
    const trackingByTender = new Map(records.map((record) => [record.tender.id, record]));
    return tenders.filter((tender) => tender.dueDate < todayISO()).map((tender): TrackingRecord => trackingByTender.get(tender._id) ?? {
      id: null,
      stage: "not_added",
      technical_bid_mode: "summary",
      notes: null,
      tender: { id: tender._id, internal_id: tender.internalId, title: tender.title, organization: tender.organization, due_date: tender.dueDate, tender_value: tender.tenderValue ?? null },
      bidders: [],
    }).sort((a, b) => b.tender.due_date.localeCompare(a.tender.due_date));
  }, [records, tenders]);
  const selected = trackerRows.find((record) => record.tender.id === selectedId) ?? null;
  const filteredRecords = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return trackerRows;
    return trackerRows.filter(({ tender }) => `${tender.internal_id} ${tender.title} ${tender.organization}`.toLowerCase().includes(value));
  }, [query, trackerRows]);

  useEffect(() => {
    if (!selected) return;
    setStageDraft(selected.stage === "not_added" ? "" : selected.stage);
    setTechnicalBidModeDraft(selected.id ? selected.technical_bid_mode : "");
    setNotesDraft(selected.notes ?? "");
    setEditingBidder(undefined);
  }, [selected?.tender.id, selected?.id, selected?.stage, selected?.technical_bid_mode, selected?.notes]);

  useEffect(() => {
    if (selectedId && !trackerRows.some((record) => record.tender.id === selectedId)) {
      setSelectedId(trackerRows[0]?.tender.id ?? null);
    }
  }, [selectedId, trackerRows]);

  async function saveStatus() {
    if (!selected || !stageDraft || !technicalBidModeDraft) return;
    setSaving(true);
    setError("");
    try {
      const payload = { stage: stageDraft, technicalBidMode: technicalBidModeDraft, notes: notesDraft };
      if (selected.id) await axios.patch(`/api/admin/tender-tracking/${selected.id}`, payload);
      else await axios.post("/api/admin/tender-tracking", { tenderId: selected.tender.id, ...payload });
      setNotice("Tender status saved successfully.");
      await refresh(selected.tender.id);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "The server could not save this tender status." : "The server could not save this tender status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBidder(values: BidderDraft, bidder?: Bidder) {
    if (!selected?.id) {
      setError("Save this tender status before adding bidder details.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      bidderName: values.bidderName,
      bidderProfileId: values.profileId,
      technicalStatus: values.technicalStatus,
      quotedRate: values.quotedRate === "" ? null : values.quotedRate,
      financialRank: values.financialRank === "" ? null : values.financialRank,
      notes: values.notes,
    };
    try {
      if (!values.profileId) throw new Error("Select a bidder from the directory first.");
      if (bidder) await axios.patch(`/api/admin/tender-tracking/bidders/${bidder.id}`, payload);
      else await axios.post(`/api/admin/tender-tracking/${selected.id}/bidders`, payload);
      setEditingBidder(undefined);
      setBidderSaveRequest(null);
      setNotice(activePanel === "financial" ? "Financial bid details saved successfully." : "Technical bidder details saved successfully.");
      await refresh(selected.tender.id);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not save bidder details." : reason instanceof Error ? reason.message : "Could not save bidder details.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(values: ProfileDraft, profile?: BidderProfile) {
    setSaving(true);
    setError("");
    try {
      if (profile) await axios.patch(`/api/admin/bidder-profiles/${profile.id}`, values);
      else await axios.post("/api/admin/bidder-profiles", values);
      setEditingProfile(undefined);
      setNotice(profile ? "Bidder directory details updated." : "Bidder added to the directory.");
      await refresh(selected?.tender.id ?? null);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not save bidder directory details." : reason instanceof Error ? reason.message : "Could not save bidder directory details.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBidder(bidder: Bidder) {
    if (!window.confirm(`Remove ${bidder.bidder_name} from this tender?`)) return;
    setSaving(true);
    try {
      await axios.delete(`/api/admin/tender-tracking/bidders/${bidder.id}`);
      setNotice("Bidder removed from this tender. Their directory profile is unchanged.");
      await refresh(selected?.tender.id ?? null);
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not remove bidder from this tender." : "Could not remove bidder from this tender.");
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
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">All tenders with a passed due date appear here. Save a status to publish it on the public tracker; extending the date removes the tender from both trackers.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setActivePanel("status")} disabled={!selected} className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Tender status</button>
              <button type="button" onClick={() => setActivePanel("technical")} disabled={!selected} className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Technical bid</button>
              <button type="button" onClick={() => setActivePanel("financial")} disabled={!selected} className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Financial bid</button>
              <button type="button" onClick={() => { setEditingProfile(undefined); setActivePanel("directory"); setError(""); }} className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted">Bidder directory</button>
            </div>
          </div>
          {!selected && <p className="-mt-2 text-xs text-muted-foreground">Select an expired tender below to enter its status and bidder details.</p>}

          {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">{notice}</p>}

          <div className="grid min-h-[32rem] grid-cols-1 gap-4 xl:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.6fr)]">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 font-bold"><Activity className="h-4 w-4 text-primary" />Expired tenders <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{trackerRows.length}</span></div>
                <button type="button" onClick={() => void refresh(selectedId)} className="text-xs font-bold text-primary hover:underline">Refresh</button>
              </div>
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, title, organization" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="max-h-[34rem] divide-y divide-border overflow-y-auto">
                {loading && !trackerRows.length ? <p className="p-6 text-sm text-muted-foreground">Loading tenders…</p> : filteredRecords.length ? filteredRecords.map((record) => {
                  const due = record.tender.due_date;
                  const expired = due < todayISO();
                  return (
                      <button key={record.tender.id} type="button" onClick={() => { setSelectedId(record.tender.id); setEditingBidder(undefined); setActivePanel("status"); setError(""); setNotice(""); }} className={`w-full p-4 text-left transition hover:bg-muted/50 ${selectedId === record.tender.id ? "bg-primary/[0.06]" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{record.tender.internal_id}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold">{record.tender.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{record.tender.organization}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold">{record.stage === "not_added" ? "Status not added" : stages.find(([value]) => value === record.stage)?.[1] ?? record.stage}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${expired ? "text-warning" : "text-muted-foreground"}`}><Clock3 className="h-3 w-3" />Due {formatDate(due)}</span>
                      </div>
                    </button>
                  );
                }) : <div className="p-7 text-center"><FileText className="mx-auto h-7 w-7 text-muted-foreground/60" /><p className="mt-2 text-sm font-semibold">{query ? "No matching tenders" : "No expired tenders"}</p><p className="mt-1 text-xs text-muted-foreground">Expired tenders will appear here automatically.</p></div>}
              </div>
            </section>

            {activePanel === "directory" ? (
              <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Bidder directory</h3><p className="mt-1 text-sm text-muted-foreground">Names and contact details are saved independently and can be reused on any tender.</p></div>{editingProfile === undefined && <button type="button" onClick={() => setEditingProfile(null)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Add bidder</button>}</div>
                {editingProfile !== undefined && <BidderProfileEditor profile={editingProfile ?? undefined} saving={saving} onCancel={() => setEditingProfile(undefined)} onSave={(values) => void saveProfile(values, editingProfile ?? undefined)} />}
                {profiles.length ? <div className="divide-y divide-border rounded-xl border border-border">{profiles.map((profile) => <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5"><div className="min-w-0"><p className="font-semibold">{profile.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{[profile.contact_person, profile.email, profile.phone].filter(Boolean).join(" · ") || "No contact details added"}</p></div><button type="button" onClick={() => setEditingProfile(profile)} className="rounded-md px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">Edit details</button></div>)}</div> : editingProfile === undefined && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No bidders in the directory yet. Add a bidder here before assigning them to a tender.</p>}
              </section>
            ) : selected ? (
              <section className="min-w-0 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-primary">{selected.tender.internal_id}</p>
                      <h3 className="mt-1 text-base font-bold leading-snug">{selected.tender.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{selected.tender.organization}</p>
                    </div>
                    {selected.id && <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">Saved</span>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <SummaryItem icon={CalendarDays} label="Current due date" value={formatDate(selected.tender.due_date)} />
                    <SummaryItem icon={CircleDollarSign} label="Tender value" value={selected.tender.tender_value == null ? "Refer document" : formatRate(selected.tender.tender_value)} />
                    <SummaryItem icon={Users} label="Bidders" value={String(selected.bidders.length)} />
                  </div>
                  {activePanel === "status" && <>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-bold text-muted-foreground">Tender status
                      <select value={stageDraft} onChange={(event) => setStageDraft(event.target.value)} disabled={saving} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60">
                        <option value="">Select status…</option>
                        {stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-xs font-bold text-muted-foreground">Technical bid information
                      <select value={technicalBidModeDraft} onChange={(event) => setTechnicalBidModeDraft(event.target.value)} disabled={saving} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60">
                        <option value="">Select what the portal shows…</option>
                        <option value="summary">Portal shows opening only</option><option value="detailed">Portal shows bidder details</option>
                      </select>
                    </label>
                    <div className="space-y-1.5 text-xs font-bold text-muted-foreground">Deadline status
                      <p className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm ${selected.tender.due_date < todayISO() ? "border-warning/20 bg-warning/5 text-warning" : "border-accent/20 bg-accent/5 text-accent"}`}>
                        <Clock3 className="h-4 w-4" />{selected.tender.due_date < todayISO() ? "Submission deadline passed" : "Current due date has not passed"}
                      </p>
                    </div>
                  </div>
                  <label className="mt-4 block space-y-1.5 text-xs font-bold text-muted-foreground">Additional status details (optional)
                    <textarea value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} rows={3} placeholder="Opening date, next evaluation meeting, follow-up…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary" />
                  </label>
                  <button type="button" onClick={() => void saveStatus()} disabled={saving || !stageDraft || !technicalBidModeDraft} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : selected.id ? "Save changes" : "Save status"}</button>
                  </>}
                </div>

                {(activePanel === "technical" || activePanel === "financial") && (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div><h4 className="font-bold">{activePanel === "technical" ? "Technical bid participants" : "Financial bid participants"}</h4><p className="mt-0.5 text-xs text-muted-foreground">{activePanel === "technical" ? "Select bidders from the independent directory and record who qualified." : "Only technically qualified bidders appear here."}</p></div>
                    {activePanel === "technical" && editingBidder === undefined && selected.id && <button type="button" onClick={() => setEditingBidder(null)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" /> Add participant</button>}
                  </div>
                  <div className="space-y-3 p-4">
                    {!selected.id && <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Save this tender status first. Then you can add and evaluate bidders.</p>}
                    {activePanel === "technical" && !profiles.length && selected.id && <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Add bidder names to the Bidder Directory first.</p>}
                    {activePanel === "technical" && editingBidder === null && <BidderEditor mode="technical" profiles={profiles} excludeProfileIds={selected.bidders.map((bidder) => bidder.bidder_profile_id).filter((id): id is string => Boolean(id))} saving={saving} onCancel={() => setEditingBidder(undefined)} onRequestSave={(values) => { setError(""); setNotice(""); setBidderSaveRequest({ values }); }} />}
                    {(activePanel === "technical" ? selected.bidders : selected.bidders.filter((bidder) => bidder.technical_status === "qualified")).length === 0 && editingBidder !== null && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{activePanel === "technical" ? "No bidders added to the technical bid yet." : "No bidders qualified for financial evaluation yet."}</p>}
                    {(activePanel === "technical" ? selected.bidders : selected.bidders.filter((bidder) => bidder.technical_status === "qualified")).map((bidder) => editingBidder?.id === bidder.id ? (
                      <BidderEditor key={bidder.id} mode={activePanel === "financial" ? "financial" : "technical"} bidder={bidder} profiles={profiles} excludeProfileIds={selected.bidders.filter((item) => item.id !== bidder.id).map((item) => item.bidder_profile_id).filter((id): id is string => Boolean(id))} saving={saving} onCancel={() => setEditingBidder(undefined)} onRequestSave={(values) => { setError(""); setNotice(""); setBidderSaveRequest({ values, bidder }); }} />
                    ) : (
                      <article key={bidder.id} className="rounded-xl border border-border bg-background/50 p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0"><p className="font-semibold">{bidder.profile?.name ?? bidder.bidder_name}</p>{activePanel === "technical" && <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${bidder.technical_status === "qualified" ? "bg-accent/10 text-accent" : bidder.technical_status === "disqualified" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{technicalStatuses.find(([value]) => value === bidder.technical_status)?.[1] ?? bidder.technical_status}</span>}</div>
                          {activePanel === "financial" && <div className="flex items-center gap-4"><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quoted rate</p><p className="font-bold">{formatRate(bidder.quoted_rate)}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rank</p><p className="font-bold">{bidder.financial_rank ?? "—"}</p></div></div>}
                        </div>
                        {bidder.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{bidder.notes}</p>}
                        <div className="mt-3 flex justify-end gap-2 border-t border-border pt-2"><button type="button" onClick={() => setEditingBidder(bidder)} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">{activePanel === "technical" ? "Edit technical result" : "Edit financial result"}</button>{activePanel === "technical" && <button type="button" onClick={() => void removeBidder(bidder)} disabled={saving} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/5">Remove from tender</button>}</div>
                      </article>
                    ))}
                  </div>
                </div>
                )}
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
            <div className="text-center"><h2 id="bidder-save-title" className="text-lg font-bold">Save bidder details?</h2><p className="mt-2 text-sm text-muted-foreground">{activePanel === "financial" ? "Save this qualified bidder’s financial rate and rank." : "Save this directory bidder’s technical result. Only qualified bidders will appear in the financial bid."} Internal notes stay private.</p></div>
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

function BidderEditor({ bidder, profiles, excludeProfileIds = [], mode, saving, onRequestSave, onCancel }: {
  bidder?: Bidder;
  profiles: BidderProfile[];
  excludeProfileIds?: string[];
  mode: "technical" | "financial";
  saving: boolean;
  onRequestSave: (values: BidderDraft) => void;
  onCancel: () => void;
}) {
  const [bidderName, setBidderName] = useState(bidder?.profile?.name ?? bidder?.bidder_name ?? "");
  const [profileId, setProfileId] = useState(bidder?.bidder_profile_id ?? "");
  const [technicalStatus, setTechnicalStatus] = useState(bidder?.technical_status ?? "pending");
  const [quotedRate, setQuotedRate] = useState(bidder?.quoted_rate == null ? "" : String(bidder.quoted_rate));
  const [financialRank, setFinancialRank] = useState(bidder?.financial_rank == null ? "" : String(bidder.financial_rank));
  const [notes, setNotes] = useState(bidder?.notes ?? "");
  const availableProfiles = profiles.filter((item) => !excludeProfileIds.includes(item.id));
  const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary";
  return (
    <form onSubmit={(event) => { event.preventDefault(); onRequestSave({ bidderName, profileId, technicalStatus, quotedRate, financialRank, notes }); }} className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "technical" ? <>
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">Select bidder from directory<select required value={profileId} onChange={(event) => { const id = event.target.value; setProfileId(id); setBidderName(profiles.find((item) => item.id === id)?.name ?? ""); }} className={inputClass}><option value="">Choose bidder…</option>{availableProfiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">Technical result<select value={technicalStatus} onChange={(event) => setTechnicalStatus(event.target.value)} className={inputClass}>{technicalStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </> : <>
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold">{bidderName}</div>
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">Quoted rate (₹)<input type="number" min="0" step="0.01" value={quotedRate} onChange={(event) => setQuotedRate(event.target.value)} className={inputClass} placeholder="Enter quoted rate" /></label>
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">Financial rank<input type="number" min="1" step="1" value={financialRank} onChange={(event) => setFinancialRank(event.target.value)} className={inputClass} placeholder="Optional" /></label>
        </>}
      </div>
      {mode === "technical" && <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Technical notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary" /></label>}
      {mode === "financial" && <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Financial notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary" /></label>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Cancel</button><button type="submit" disabled={(mode === "technical" && !profileId) || saving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" />Continue to save</button></div>
    </form>
  );
}

function BidderProfileEditor({ profile, saving, onSave, onCancel }: { profile?: BidderProfile; saving: boolean; onSave: (values: ProfileDraft) => void; onCancel: () => void }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [contactPerson, setContactPerson] = useState(profile?.contact_person ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary";
  return <form onSubmit={(event) => { event.preventDefault(); onSave({ name, contactPerson, email, phone, address, notes }); }} className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
    <h4 className="text-sm font-bold">{profile ? "Edit bidder directory details" : "Add bidder to directory"}</h4>
    <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-semibold text-muted-foreground">Bidder / company name<input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></label><label className="space-y-1 text-xs font-semibold text-muted-foreground">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className={inputClass} /></label><label className="space-y-1 text-xs font-semibold text-muted-foreground">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label><label className="space-y-1 text-xs font-semibold text-muted-foreground">Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} /></label><label className="space-y-1 text-xs font-semibold text-muted-foreground sm:col-span-2">Address<input value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} /></label></div>
    <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Other bidder information<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
    <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Cancel</button><button type="submit" disabled={!name.trim() || saving} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save bidder details"}</button></div>
  </form>;
}
