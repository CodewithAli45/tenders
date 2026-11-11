"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronDown, RefreshCw, Search, Users } from "lucide-react";

type BidderProfile = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};
type Participation = {
  id: string;
  technical_status: string;
  quoted_rate: number | null;
  financial_rank: number | null;
  tender: { internal_id: string; title: string; organization: string; due_date: string };
  stage: string;
};
type TrackingRecord = {
  id: string;
  stage: string;
  tender: Participation["tender"];
  bidders: Array<{
    id: string;
    bidder_name: string;
    bidder_profile_id: string | null;
    technical_status: string;
    quoted_rate: number | null;
    financial_rank: number | null;
    profile?: BidderProfile | null;
  }>;
};
type BidderSummary = BidderProfile & { participations: Participation[] };

const statusLabels: Record<string, string> = {
  awaiting_bid_opening: "Awaiting bid opening",
  technical_evaluation: "Technical evaluation",
  financial_evaluation: "Financial evaluation",
  awarded: "Awarded",
  cancelled: "Cancelled",
  on_hold: "On hold",
};
const technicalLabels: Record<string, string> = {
  pending: "Under review",
  qualified: "Qualified",
  disqualified: "Rejected",
  not_applicable: "Not applicable",
};
const formatDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};
const formatRate = (value: number | null) => value == null ? "—" : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;

export function BidderAnalysisDashboard() {
  const [profiles, setProfiles] = useState<BidderProfile[]>([]);
  const [tracking, setTracking] = useState<TrackingRecord[]>([]);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [profileResponse, trackingResponse] = await Promise.all([
        axios.get<BidderProfile[]>("/api/admin/bidder-profiles"),
        axios.get<TrackingRecord[]>("/api/admin/tender-tracking"),
      ]);
      setProfiles(profileResponse.data);
      setTracking(trackingResponse.data);
      setError("");
    } catch (reason) {
      setError(axios.isAxiosError(reason) ? reason.response?.data?.error || "Could not load bidder participation history." : "Could not load bidder participation history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const bidders = useMemo<BidderSummary[]>(() => {
    const byId = new Map(profiles.map((profile) => [profile.id, { ...profile, participations: [] as Participation[] }]));
    const byName = new Map(profiles.map((profile) => [profile.name.trim().toLowerCase(), byId.get(profile.id)!]));
    for (const record of tracking) {
      for (const entry of record.bidders ?? []) {
        const profile = (entry.bidder_profile_id && byId.get(entry.bidder_profile_id))
          || (entry.profile?.id && byId.get(entry.profile.id))
          || byName.get(entry.bidder_name.trim().toLowerCase());
        if (!profile) continue;
        profile.participations.push({
          id: entry.id,
          technical_status: entry.technical_status,
          quoted_rate: entry.quoted_rate,
          financial_rank: entry.financial_rank,
          tender: record.tender,
          stage: record.stage,
        });
      }
    }
    return [...byId.values()].map((profile) => ({
      ...profile,
      participations: profile.participations.sort((a, b) => b.tender.due_date.localeCompare(a.tender.due_date)),
    })).sort((a, b) => b.participations.length - a.participations.length || a.name.localeCompare(b.name));
  }, [profiles, tracking]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? bidders.filter((bidder) => `${bidder.name} ${bidder.contact_person ?? ""} ${bidder.email ?? ""} ${bidder.phone ?? ""}`.toLowerCase().includes(value)) : bidders;
  }, [bidders, query]);

  const totalParticipations = bidders.reduce((sum, bidder) => sum + bidder.participations.length, 0);
  const qualifiedCount = bidders.reduce((sum, bidder) => sum + bidder.participations.filter((item) => item.technical_status === "qualified").length, 0);
  const rejectedCount = bidders.reduce((sum, bidder) => sum + bidder.participations.filter((item) => item.technical_status === "disqualified").length, 0);

  return <div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Users className="h-4 w-4" /> Company history</p><h2 className="mt-1 text-xl font-bold">Bidder participation</h2><p className="mt-1 text-sm text-muted-foreground">See each bidder’s tender history and technical outcomes.</p></div>
      <button type="button" onClick={() => void refresh(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
    </header>

    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Bidder companies" value={profiles.length} />
      <StatCard label="Tender participations" value={totalParticipations} />
      <StatCard label="Qualified / rejected" value={`${qualifiedCount} / ${rejectedCount}`} />
    </div>

    <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bidder, contact, email, phone" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Bidder</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Participations</th><th className="px-4 py-3">Qualified</th><th className="px-4 py-3">Rejected</th><th className="px-4 py-3">Latest tender</th><th className="px-4 py-3" /></tr></thead>
        <tbody className="divide-y divide-border">{loading ? <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading bidders…</td></tr> : filtered.map((bidder) => {
          const qualified = bidder.participations.filter((item) => item.technical_status === "qualified").length;
          const rejected = bidder.participations.filter((item) => item.technical_status === "disqualified").length;
          const expanded = expandedId === bidder.id;
          return <FragmentRow key={bidder.id} bidder={bidder} expanded={expanded} qualified={qualified} rejected={rejected} onToggle={() => setExpandedId(expanded ? null : bidder.id)} />;
        })}</tbody></table></div>
      <div className="divide-y divide-border md:hidden">{loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading bidders…</p> : filtered.map((bidder) => <MobileBidderRow key={bidder.id} bidder={bidder} expanded={expandedId === bidder.id} onToggle={() => setExpandedId(expandedId === bidder.id ? null : bidder.id)} />)}</div>
      {!loading && !filtered.length && <p className="p-8 text-center text-sm text-muted-foreground">{query ? "No bidders match your search." : "No bidders in the directory yet. Add bidders in the Status Tracker’s Bidder Directory."}</p>}
    </div>
  </div>;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div>;
}

function FragmentRow({ bidder, expanded, qualified, rejected, onToggle }: { bidder: BidderSummary; expanded: boolean; qualified: number; rejected: number; onToggle: () => void }) {
  const latest = bidder.participations[0];
  return <>
    <tr className="hover:bg-muted/30"><td className="px-4 py-3 font-semibold">{bidder.name}</td><td className="px-4 py-3 text-xs text-muted-foreground">{bidder.contact_person || bidder.email || bidder.phone || "—"}</td><td className="px-4 py-3 tabular-nums">{bidder.participations.length}</td><td className="px-4 py-3">{qualified}</td><td className="px-4 py-3">{rejected}</td><td className="max-w-[15rem] px-4 py-3"><span className="block truncate text-xs font-semibold">{latest?.tender.internal_id ?? "—"}</span><span className="block truncate text-xs text-muted-foreground">{latest?.tender.title ?? "No tenders yet"}</span></td><td className="px-4 py-3"><button type="button" onClick={onToggle} aria-expanded={expanded} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label={expanded ? "Hide tender history" : "Show tender history"}><ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} /></button></td></tr>
    {expanded && <tr><td colSpan={7} className="bg-muted/20 p-4"><ParticipationList participations={bidder.participations} /></td></tr>}
  </>;
}

function MobileBidderRow({ bidder, expanded, onToggle }: { bidder: BidderSummary; expanded: boolean; onToggle: () => void }) {
  const qualified = bidder.participations.filter((item) => item.technical_status === "qualified").length;
  const rejected = bidder.participations.filter((item) => item.technical_status === "disqualified").length;
  return <div><button type="button" onClick={onToggle} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 p-4 text-left"><div className="min-w-0"><p className="truncate text-sm font-bold">{bidder.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{bidder.contact_person || bidder.email || bidder.phone || "No contact details"}</p><p className="mt-2 text-xs text-muted-foreground">{bidder.participations.length} tender{bidder.participations.length === 1 ? "" : "s"} · {qualified} qualified · {rejected} rejected</p></div><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} /></button>{expanded && <div className="border-t border-border bg-muted/20 p-3"><ParticipationList participations={bidder.participations} /></div>}</div>;
}

function ParticipationList({ participations }: { participations: Participation[] }) {
  return participations.length ? <div className="space-y-2">{participations.map((item) => <article key={item.id} className="rounded-lg border border-border bg-card p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-xs font-bold text-primary">{item.tender.internal_id}</p><p className="mt-1 text-sm font-semibold">{item.tender.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.tender.organization} · Due {formatDate(item.tender.due_date)}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold">{statusLabels[item.stage] ?? item.stage}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs"><span><span className="text-muted-foreground">Technical: </span><strong>{technicalLabels[item.technical_status] ?? item.technical_status}</strong></span><span><span className="text-muted-foreground">Rate: </span><strong>{formatRate(item.quoted_rate)}</strong></span><span><span className="text-muted-foreground">Financial rank: </span><strong>{item.financial_rank ?? "—"}</strong></span></div></article>)}</div> : <p className="text-sm text-muted-foreground">No tender participation recorded.</p>;
}
