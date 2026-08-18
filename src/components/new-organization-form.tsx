"use client";

import { FormEvent, useState } from "react";
import { Building2, X } from "lucide-react";

export function NewOrganizationForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: (organization: unknown) => void }) {
  const [data, setData] = useState({ name: "", details: "", contactPerson: "", email: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/organizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save organization.");
      onSuccess(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save organization.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
  return <div className="h-full overflow-y-auto bg-background p-6 md:p-8">
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div><div><h2 className="text-xl font-bold">Add organization</h2><p className="text-sm text-muted-foreground">Save the organization name and its details.</p></div></div>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div><label className="mb-2 block text-sm font-medium">Organization name</label><input required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className={inputClass} placeholder="e.g. Public Works Department" /></div>
        <div><label className="mb-2 block text-sm font-medium">Organization details</label><textarea required value={data.details} onChange={(e) => setData({ ...data, details: e.target.value })} className="min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Describe the department, work scope, or relevant details." /></div>
        <div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-medium">Contact person</label><input value={data.contactPerson} onChange={(e) => setData({ ...data, contactPerson: e.target.value })} className={inputClass} /></div><div><label className="mb-2 block text-sm font-medium">Phone</label><input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className={inputClass} /></div><div><label className="mb-2 block text-sm font-medium">Email</label><input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className={inputClass} /></div><div><label className="mb-2 block text-sm font-medium">Address</label><input value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} className={inputClass} /></div></div>
        {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted">Cancel</button><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save organization"}</button></div>
      </form>
    </div>
  </div>;
}
