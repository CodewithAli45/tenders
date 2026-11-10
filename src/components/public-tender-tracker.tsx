"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, FileText, RefreshCw, Search, X } from "lucide-react";

type Bidder = {
  id: string;
  bidder_name: string;
  technical_status: string;
  quoted_rate: number | null;
  financial_rank: number | null;
  profile?: { id: string; name: string; contact_person: string | null; email: string | null; phone: string | null } | null;
};
type RecordItem = {
  id: string;
  stage: string;
  technical_bid_mode: "summary" | "detailed";
  updated_at: string | null;
  tender: { id: string; internal_id: string; title: string; organization: string; due_date: string; tender_no: string; tender_value: number | null };
  bidders: Bidder[];
};

const stages: Record<string, string> = {
  not_added: "Status not added", awaiting_bid_opening: "Awaiting bid opening", technical_evaluation: "Technical evaluation",
  financial_evaluation: "Financial evaluation", awarded: "Awarded", cancelled: "Cancelled", on_hold: "On hold",
};
const outcomes: Record<string, string> = { pending: "Under review", qualified: "Qualified", disqualified: "Rejected", not_applicable: "Not applicable" };
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
const bidderName = (bidder: Bidder) => bidder.profile?.name ?? bidder.bidder_name;

export function PublicTenderTracker() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await fetch("/api/public/tender-tracking", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
      setError("");
      setSelected((current) => current ? (data as RecordItem[]).find((item) => item.tender.id === current.tender.id) ?? null : null);
    } catch { setError("Tender list could not be loaded. Please try again."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    void loadRecords();
    const interval = window.setInterval(() => void loadRecords(true), 30000);
    const onFocus = () => void loadRecords(true);
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? records.filter(({ tender }) => `${tender.internal_id} ${tender.title} ${tender.organization} ${tender.tender_no}`.toLowerCase().includes(value)) : records;
  }, [records, query]);
  const technicalBidders = selected ? [...selected.bidders].sort((a, b) => bidderName(a).localeCompare(bidderName(b))) : [];
  const financialBidders = technicalBidders.filter((bidder) => bidder.technical_status === "qualified").sort((a, b) => (a.financial_rank ?? Number.MAX_SAFE_INTEGER) - (b.financial_rank ?? Number.MAX_SAFE_INTEGER));
  const financialStage = selected?.stage === "financial_evaluation" || selected?.stage === "awarded";

  return <div className="mx-auto w-full max-w-5xl space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Activity className="h-4 w-4" /> Bid results</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tender Status Tracker</h1><p className="mt-2 text-sm text-muted-foreground">Tenders with a passed submission deadline.</p></div>
      <button type="button" onClick={() => void loadRecords(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
    </header>
    <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tender ID, title, or organization" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary" /></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {loading ? <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading tenders…</div> : filtered.length ? <div className="space-y-3">{filtered.map((record) => <article key={record.tender.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">{record.tender.internal_id}</span><span className="text-xs font-semibold text-muted-foreground">{record.tender.organization}</span></div><h2 className="mt-2 font-bold leading-snug">{record.tender.title}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(record.tender.due_date)} · {stages[record.stage] ?? stages.awaiting_bid_opening}</p></div><button type="button" onClick={() => setSelected(record)} className="ml-auto h-9 shrink-0 rounded-lg bg-primary px-3.5 text-xs font-bold text-white transition hover:brightness-110">Show status</button></article>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><FileText className="mx-auto h-8 w-8 text-muted-foreground/60" /><h2 className="mt-3 font-bold">{query ? "No matching tenders" : "No passed deadlines"}</h2><p className="mt-1 text-sm text-muted-foreground">{query ? "Try another search." : "Tenders will appear here after their current due date passes."}</p></div>}

    {selected && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="tender-status-title" className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:max-h-[90vh]">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-7"><div className="min-w-0"><span className="font-mono text-xs font-bold text-primary">{selected.tender.internal_id}</span><h2 id="tender-status-title" className="mt-1 text-xl font-bold sm:text-2xl">{selected.tender.title}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.tender.organization} · Tender {selected.tender.tender_no}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">Due {formatDate(selected.tender.due_date)} · {stages[selected.stage] ?? stages.awaiting_bid_opening}</p></div><button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-muted" aria-label="Close status"><X className="h-4 w-4" /></button></header>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
          {selected.stage === "not_added" ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Status details have not been published yet.</p> : <>
            <section><div className="mb-3"><h3 className="font-bold">Technical bid</h3><p className="mt-1 text-sm text-muted-foreground">{selected.technical_bid_mode === "summary" ? "The portal shows that the technical bid was opened, but does not publish bidder-wise details." : "Technical participants and their qualification results."}</p></div>
              {selected.technical_bid_mode === "summary" ? <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Bidder-wise technical results are not published for this tender.</p> : technicalBidders.length ? <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[460px] text-left text-sm"><thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Bidder</th><th className="px-4 py-3">Technical result</th><th className="px-4 py-3 text-right">Information</th></tr></thead><tbody className="divide-y divide-border">{technicalBidders.map((bidder) => <tr key={bidder.id}><td className="px-4 py-3 font-semibold">{bidderName(bidder)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${bidder.technical_status === "qualified" ? "bg-accent/10 text-accent" : bidder.technical_status === "disqualified" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{outcomes[bidder.technical_status] ?? bidder.technical_status}</span></td><td className="px-4 py-3 text-right">{bidder.profile?.id ? <a href={`/bidders/${bidder.profile.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-semibold text-primary hover:bg-primary/5">More info<span className="sr-only"> about {bidderName(bidder)}</span></a> : <span className="text-xs text-muted-foreground">—</span>}</td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No technical participants have been published.</p>}
            </section>
            {financialStage && <section><h3 className="font-bold">Financial bid</h3><p className="mt-1 text-sm text-muted-foreground">Only bidders qualified in the technical evaluation are listed.</p>{financialBidders.length ? <div className="mt-3 overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[440px] text-left text-sm"><thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Qualified bidder</th><th className="px-4 py-3 text-right">Quoted rate</th></tr></thead><tbody className="divide-y divide-border">{financialBidders.map((bidder) => <tr key={bidder.id}><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{bidder.financial_rank ?? "—"}</td><td className="px-4 py-3 font-semibold">{bidderName(bidder)}</td><td className="px-4 py-3 text-right font-bold tabular-nums">{bidder.quoted_rate == null ? "—" : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(bidder.quoted_rate)}`}</td></tr>)}</tbody></table></div> : <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No technically qualified bidders are listed for financial evaluation.</p>}</section>}
          </>}
        </div>
      </section>
    </div>}
  </div>;
}
