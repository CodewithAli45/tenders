"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { FilePlus2, Newspaper, Pencil, Send, Trash2, X } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

type NewsForm = Pick<NewsItem, "title" | "summary" | "content" | "category" | "published">;

const emptyForm: NewsForm = { title: "", summary: "", content: "", category: "Update", published: false };

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error || "Could not complete the news request.";
  return "Could not complete the news request.";
}

export function PlatformNewsManager() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    try {
      const response = await axios.get<NewsItem[]>("/api/admin/news");
      setItems(response.data);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadItems(); }, []);

  function startNew() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setFormOpen(true);
  }

  function startEdit(item: NewsItem) {
    setForm({ title: item.title, summary: item.summary, content: item.content, category: item.category, published: item.published });
    setEditingId(item.id);
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await axios.patch("/api/admin/news", { id: editingId, ...form });
      else await axios.post("/api/admin/news", form);
      closeForm();
      await loadItems();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: NewsItem) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError("");
    try {
      await axios.delete("/api/admin/news", { data: { id: item.id } });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
      <div><h2 className="font-bold">News &amp; updates</h2><p className="mt-1 text-sm text-muted-foreground">Write and publish the news shown below the ad on the public dashboard.</p></div>
      <button type="button" onClick={startNew} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"><FilePlus2 className="h-4 w-4" />Add news</button>
    </div>

    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}

    {formOpen && <form onSubmit={save} className="space-y-4 rounded-2xl border border-primary/20 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h3 className="font-bold">{editingId ? "Edit news" : "New news item"}</h3><button type="button" onClick={closeForm} aria-label="Close form" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Title<input required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} /></label>
        <label className="text-sm font-semibold">Category<input required minLength={2} maxLength={50} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass} placeholder="Update, Announcement…" /></label>
      </div>
      <label className="block text-sm font-semibold">Short summary <span className="font-normal text-muted-foreground">(shown on the dashboard)</span><textarea required minLength={10} maxLength={300} rows={2} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className={inputClass} /></label>
      <label className="block text-sm font-semibold">Full details<textarea required minLength={20} maxLength={20000} rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className={inputClass} placeholder="Write the full news item. Paragraph breaks are preserved." /></label>
      <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" /><span><span className="font-semibold">Publish now</span><span className="mt-0.5 block text-xs text-muted-foreground">Unpublished drafts are visible only in this admin panel.</span></span></label>
      <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={closeForm} className="min-h-10 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Send className="h-4 w-4" />{saving ? "Saving…" : form.published ? "Save & publish" : "Save draft"}</button></div>
    </form>}

    <div className="space-y-3">
      {loading ? <div className="rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">Loading news…</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center"><Newspaper className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">No news items yet</p><p className="mt-1 text-sm text-muted-foreground">Add a news item and publish it to show it on the public dashboard.</p></div> : items.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.published ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{item.published ? "Published" : "Draft"}</span><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{item.category}</span></div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p><p className="mt-2 text-xs text-muted-foreground">{item.publishedAt ? `Published ${new Date(item.publishedAt).toLocaleDateString()}` : `Created ${new Date(item.createdAt).toLocaleDateString()}`}</p></div>
        <div className="flex shrink-0 gap-2"><button type="button" onClick={() => startEdit(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:border-primary hover:text-primary"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" onClick={() => void remove(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-destructive hover:border-destructive"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>
      </article>)}
    </div>
  </div>;
}
