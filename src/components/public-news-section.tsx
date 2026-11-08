"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Newspaper, X } from "lucide-react";
import { useEffect, useState } from "react";

type PublicNewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
};

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PublicNewsSection() {
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [selected, setSelected] = useState<PublicNewsItem | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/public/news")
      .then((response) => response.json())
      .then((data) => { if (active) setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setItems([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return <>
    <section className="rounded-2xl border border-border bg-card/70 p-3.5 shadow-sm">
      <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Newspaper className="h-4 w-4 text-primary" /> News &amp; Updates
      </h2>
      <div className="mt-3 space-y-2">
        {items.length ? items.slice(0, 4).map((item) => (
          <button key={item.id} type="button" onClick={() => setSelected(item)} className="block w-full rounded-xl bg-muted/30 px-3 py-3 text-left transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">{item.category}</span><span className="shrink-0 text-[10px] text-muted-foreground">{displayDate(item.publishedAt)}</span></span>
            <span className="mt-2 block text-xs font-bold leading-5 text-foreground">{item.title}</span>
            <span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-muted-foreground">{item.summary}</span>
            <span className="mt-2 block text-[10px] font-semibold text-primary">Read details</span>
          </button>
        )) : <p className="rounded-xl bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">No news updates currently.</p>}
      </div>
    </section>

    <AnimatePresence>
      {selected && <motion.div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" aria-label="Close news details" onClick={() => setSelected(null)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
        <motion.section role="dialog" aria-modal="true" aria-labelledby="news-dialog-title" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }} className="relative z-10 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{selected.category}</span><p className="mt-3 text-xs text-muted-foreground">{displayDate(selected.publishedAt)}</p><h2 id="news-dialog-title" className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{selected.title}</h2></div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-foreground/85">{selected.content}</p>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>;
}
