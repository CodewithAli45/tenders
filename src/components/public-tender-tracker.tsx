"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CircleDollarSign, Clock3, FileText, RefreshCw, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PublicBidder = {
  id: string;
  bidder_name: string;
  technical_status: string;
  quoted_rate: number | null;
  financial_rank: number | null;
};

type PublicTrackingRecord = {
  id: string;
  stage: string;
  updated_at: string;
  tender: {
    id: string;
    internal_id: string;
    title: string;
    organization: string;
    due_date: string;
    tender_no: string;
    tender_value: number | null;
  };
  bidders: PublicBidder[];
};

const stageLabels: Record<string, string> = {
  awaiting_bid_opening: "Awaiting bid opening",
  technical_evaluation: "Technical evaluation",
  financial_evaluation: "Financial evaluation",
  awarded: "Awarded",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

const technicalLabels: Record<string, string> = {
  pending: "Pending",
  qualified: "Qualified",
  disqualified: "Disqualified",
  not_applicable: "Not applicable",
};

const formatDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatRate = (value: number | null) => value == null ? "—" : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
const formatTenderValue = (value: number | null) => value == null || value <= 0 ? "Refer tender document" : `₹${(value / 10000000).toFixed(2)} Cr`;
const todayISO = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export function PublicTenderTracker() {
  const [records, setRecords] = useState<PublicTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadRecords = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/public/tender-tracking", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load tender results.");
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Tender results could not be loaded. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
    const interval = window.setInterval(() => void loadRecords(true), 30000);
    const handleFocus = () => void loadRecords(true);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle ? records.filter(({ tender }) => `${tender.internal_id} ${tender.title} ${tender.organization} ${tender.tender_no}`.toLowerCase().includes(needle)) : records;
    return matching;
  }, [query, records]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Activity className="h-4 w-4" /> Bid results</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tender Status Tracker</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Published bidder lists, technical outcomes, and quoted rates for tracked tenders.</p>
        </div>
        <button type="button" onClick={() => void loadRecords(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh results
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tender ID, title, or organization" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading tender results…</div>
      ) : filtered.length ? (
        <div className="space-y-4">
          {filtered.map((record) => {
            const expired = record.tender.due_date < todayISO();
            const bidders = [...record.bidders].sort((a, b) => (a.financial_rank ?? Number.MAX_SAFE_INTEGER) - (b.financial_rank ?? Number.MAX_SAFE_INTEGER));
            return (
              <article key={record.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border bg-gradient-to-r from-card to-primary/[0.04] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">{record.tender.internal_id}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{record.tender.organization}</span>
                      </div>
                      <h2 className="mt-2 text-base font-bold leading-snug sm:text-lg">{record.tender.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">Tender reference: {record.tender.tender_no}</p>
                    </div>
                    <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">{stageLabels[record.stage] ?? record.stage}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <TenderFact icon={CalendarDays} label="Current due date" value={formatDate(record.tender.due_date)} />
                    <TenderFact icon={CircleDollarSign} label="Tender value" value={formatTenderValue(record.tender.tender_value)} />
                    <TenderFact icon={Clock3} label="Deadline" value={expired ? "Passed" : "Current date not passed"} />
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold"><Users className="h-4 w-4 text-primary" /> Bidders and quoted rates</h3>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{bidders.length} bidder{bidders.length === 1 ? "" : "s"}</span>
                  </div>
                  {bidders.length ? (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Bidder</th><th className="px-4 py-3">Technical result</th><th className="px-4 py-3 text-right">Quoted rate</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {bidders.map((bidder) => (
                            <tr key={bidder.id}>
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{bidder.financial_rank ?? "—"}</td>
                              <td className="px-4 py-3 font-semibold">{bidder.bidder_name}</td>
                              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${bidder.technical_status === "qualified" ? "bg-accent/10 text-accent" : bidder.technical_status === "disqualified" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{technicalLabels[bidder.technical_status] ?? bidder.technical_status}</span></td>
                              <td className="px-4 py-3 text-right font-bold tabular-nums">{formatRate(bidder.quoted_rate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"><FileText className="h-4 w-4" /> Bidder details have not been published yet.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <FileText className="mx-auto h-9 w-9 text-muted-foreground/60" />
          <h2 className="mt-3 font-bold">{query ? "No matching tenders" : "No tender results published yet"}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{query ? "Try another tender ID, title, or organization." : "Bidder results will appear here after they are saved by the tender administrator."}</p>
        </div>
      )}
    </div>
  );
}

function TenderFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="min-w-0 rounded-lg border border-border/80 bg-background/60 px-3 py-2"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-3 w-3 text-primary" />{label}</p><p className="mt-1 truncate text-xs font-bold sm:text-sm" title={value}>{value}</p></div>;
}
