"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/status")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not check admin access.");
        setSetupRequired(result.setupRequired);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not check admin access."));
  }, []);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (setupRequired && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(setupRequired ? "/api/admin/setup" : "/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Connection failed.");
      window.location.assign("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-slate-100 grid place-items-center">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-blue-950/50">
        <div className="border-b border-white/10 bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30"><ShieldCheck /></div>
          <p className="text-sm font-semibold tracking-widest text-blue-100 uppercase">GovTender Hub</p>
          <h1 className="mt-2 text-3xl font-bold">{setupRequired ? "Create admin access" : "Admin access"}</h1>
          <p className="mt-2 text-sm text-blue-100">{setupRequired ? "Set the first password to secure this dashboard." : "Connect securely to manage tenders and documents."}</p>
        </div>
        <form onSubmit={connect} className="space-y-5 p-8">
          {setupRequired === null && !error ? <p className="text-sm text-slate-400">Checking admin configuration…</p> : null}
          <label className="block text-sm font-medium text-slate-300" htmlFor="admin-password">{setupRequired ? "Create password" : "Password"}</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="admin-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={setupRequired ? "new-password" : "current-password"} minLength={setupRequired ? 8 : undefined} required autoFocus placeholder={setupRequired ? "At least 8 characters" : "Enter admin password"} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" />
          </div>
          {setupRequired && <>
            <label className="block text-sm font-medium text-slate-300" htmlFor="confirm-password">Confirm password</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input id="confirm-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" autoComplete="new-password" minLength={8} required placeholder="Re-enter password" className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" />
            </div>
          </>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button disabled={isSubmitting || setupRequired === null} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (setupRequired ? "Creating…" : "Connecting…") : (setupRequired ? "Create & connect" : "Connect")}<ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
