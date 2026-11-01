"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Megaphone,
  Newspaper,
  Radio,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TenderDetailView } from "@/components/tender-detail-view";
import { useSiteSearch } from "@/components/site-search-context";

interface Tender {
  _id: string;
  internalId: string;
  title: string;
  organization: string;
  tenderValue: number;
  tenderNo: string;
  portalId: string;
  emdAmount: number;
  publishDate?: string | null;
  dueDate: string;
  createdAt?: string | null;
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

type TenderStatus = "live" | "closing" | "expired" | "unknown";

const getTenderStatus = (dueDate?: string | null): TenderStatus => {
  const due = new Date(dueDate || "");
  if (Number.isNaN(due.getTime())) return "unknown";
  const now = Date.now();
  const diffMs = due.getTime() - now;
  if (diffMs < 0) return "expired";
  if (diffMs <= 48 * 60 * 60 * 1000) return "closing";
  return "live";
};

const getRelativeDue = (dueDate?: string | null): { label: string; overdue: boolean } => {
  const due = new Date(dueDate || "");
  if (Number.isNaN(due.getTime())) return { label: "—", overdue: false };
  const now = Date.now();
  const diffMs = due.getTime() - now;
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, overdue: true };
  if (days === 0) {
    const hours = Math.ceil(diffMs / (60 * 60 * 1000));
    return { label: hours <= 0 ? "Due today" : `Due in ${hours}h`, overdue: false };
  }
  return { label: `Due in ${days}d`, overdue: false };
};

const avatarPalette = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500"];
const getAvatarClass = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return avatarPalette[hash % avatarPalette.length];
};
const getAvatarInitial = (name: string) => {
  const clean = (name || "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "") : "";
  return (first + second).toUpperCase();
};

export default function Home() {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const { searchQuery } = useSiteSearch();
  const [statusFilter, setStatusFilter] = useState<"all" | TenderStatus>("all");
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/tenders")
      .then((res) => res.json())
      .then((data) => setTenders(Array.isArray(data) ? data : []))
      .catch(() => setTenders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOrgMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const organizations = Array.from(new Set(tenders.map((t) => t.organization).filter(Boolean))).sort();

  const matchingTenders = tenders.filter((t) => {
    const matchesSearch = !searchQuery ||
      t.internalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = !orgFilter || t.organization === orgFilter;
    return matchesSearch && matchesOrg;
  });

  const filteredTenders = matchingTenders.filter((t) => {
    const matchesStatus = statusFilter === "all" || getTenderStatus(t.dueDate) === statusFilter;
    return matchesStatus;
  });

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    const aCreatedAt = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreatedAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreatedAt - aCreatedAt;
  });

  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(sortedTenders.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedTenders = sortedTenders.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <AnimatePresence>
        {selectedTender && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 md:p-6"
          >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedTender(null)} />
            <div className="relative h-[100dvh] w-full max-h-[100dvh] overflow-hidden rounded-none border border-border bg-background shadow-2xl sm:h-full sm:max-h-[92vh] sm:max-w-[98%] sm:rounded-3xl glass-card">
              <TenderDetailView
                tender={selectedTender}
                onClose={() => setSelectedTender(null)}
                onUpdate={() => {}}
                readOnly={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="mb-5 flex flex-wrap items-center gap-2" ref={filterRef}>
            {([
              { key: "all", label: "All", icon: Layers, count: matchingTenders.length },
              { key: "live", label: "Live", icon: Radio, count: matchingTenders.filter((t) => getTenderStatus(t.dueDate) === "live").length },
              { key: "closing", label: "Closing Soon", icon: Clock, count: matchingTenders.filter((t) => getTenderStatus(t.dueDate) === "closing").length },
              { key: "expired", label: "Expired", icon: Archive, count: matchingTenders.filter((t) => getTenderStatus(t.dueDate) === "expired").length },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                    : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  statusFilter === tab.key ? "bg-white/20" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOrgMenuOpen((open) => !open)}
                className={`flex min-h-8 max-w-56 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${orgFilter ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"}`}
                aria-expanded={orgMenuOpen}
              >
                <span className="truncate">{orgFilter || "Organization"}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${orgMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {orgMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute left-0 top-full z-[110] mt-2 max-h-80 w-64 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => { setOrgFilter(null); setCurrentPage(1); setOrgMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-muted"
                    >
                      All Organizations
                      {!orgFilter && <Check className="h-4 w-4 text-primary" />}
                    </button>
                    {organizations.map((org) => (
                      <button
                        type="button"
                        key={org}
                        onClick={() => { setOrgFilter(org); setCurrentPage(1); setOrgMenuOpen(false); }}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                      >
                        <span className="truncate">{org}</span>
                        {orgFilter === org && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>

        <div className="grid w-full grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
          {/* Tender List - Full Width Single Rows */}
          <section className="glass-card rounded-2xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted/50 animate-pulse" />
                ))
              ) : filteredTenders.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-bold text-foreground">No tenders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery || orgFilter || statusFilter !== "all" ? "Try adjusting your search, status tab or filter." : "Tenders will appear here once added from the admin portal."}
                  </p>
                </div>
              ) : (
                pagedTenders.map((tender) => {
                  const status = getTenderStatus(tender.dueDate);
                  const relDue = getRelativeDue(tender.dueDate);
                  return (
                  <motion.div
                    key={tender._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onClick={() => setSelectedTender(tender)}
                    className="group relative cursor-pointer px-4 py-3 hover:bg-muted/40 transition-colors border-l-[3px] border-l-transparent hover:border-l-primary"
                  >
                    {/* Row 1: ID left · Due date + status right */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tracking-wide border border-primary/20">
                          {tender.internalId}
                        </span>
                        {relDue.overdue && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border border-danger/40 bg-danger/10 text-danger">
                            {relDue.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="due-date-badge text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                          Due: <span className="font-bold text-foreground">{formatDate(tender.dueDate)}</span>
                        </span>
                        {status === "closing" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border border-warning/40 bg-warning/10 text-warning">
                            CLOSING SOON
                          </span>
                        )}
                        {status === "live" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border bg-success/10 text-success border-success/20">
                            LIVE
                          </span>
                        )}
                        {status === "expired" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border border-danger/40 bg-danger/10 text-danger">
                            EXPIRED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Full title (wraps, nothing hidden) */}
                    <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug text-justify">
                      {tender.title}
                    </h3>

                    {/* Row 3: Org · Value pill · EMD pill · Published — fixed columns align vertically across all rows */}
                    <div className="mt-2 grid items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-muted-foreground grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,18rem)_9rem_9.5rem_minmax(0,1fr)]">
                      <span className="flex items-center gap-2 break-words min-w-0">
                        <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-extrabold text-white ${getAvatarClass(tender.organization)}`}>
                          {getAvatarInitial(tender.organization)}
                        </span>
                        <span className="truncate">{tender.organization}</span>
                      </span>
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5">
                        <span className="uppercase tracking-wider text-[10px]">Value</span>
                        <span className="font-bold text-foreground">{formatValue(tender.tenderValue)}</span>
                      </span>
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-secondary px-2 py-0.5">
                        <span className="uppercase tracking-wider text-[10px]">EMD</span>
                        <span className="font-bold text-foreground">{formatEmd(tender.emdAmount)}</span>
                      </span>
                      <span>
                        Published: <span className="font-bold text-foreground">{formatDate(tender.publishDate)}</span>
                      </span>
                    </div>
                  </motion.div>
                  );
                })
              )}
            </div>
          </section>

          {!loading && sortedTenders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
              <p className="text-xs text-muted-foreground font-semibold">
                Showing <span className="text-foreground font-bold">{sortedTenders.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1}</span>–
                <span className="text-foreground font-bold">{Math.min(safePage * PER_PAGE, sortedTenders.length)}</span> of{" "}
                <span className="text-foreground font-bold">{sortedTenders.length}</span> tenders
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition cursor-pointer ${
                      page === safePage
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          </div>

        <aside aria-label="Advertising and news" className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-card/70 p-3.5 shadow-sm">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Megaphone className="h-4 w-4 text-primary" /> AdSense
            </h2>
            <div className="mt-3 flex min-h-[210px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Advertisement</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card/70 p-3.5 shadow-sm">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Newspaper className="h-4 w-4 text-primary" /> News &amp; Updates
            </h2>
            <div className="mt-3 rounded-xl bg-muted/30 px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">News updates coming soon</p>
            </div>
          </section>
        </aside>
        </div>
    </>
  );
}
