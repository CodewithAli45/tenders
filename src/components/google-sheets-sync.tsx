"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CloudUpload,
  ExternalLink,
  FileSpreadsheet,
  History,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type {
  SheetsStatusResponse,
  SyncErrorResponse,
  SyncReport,
  SyncRunSummary,
} from "@/lib/google-sheets-types";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function StatusPill({ status }: { status: SyncRunSummary["status"] }) {
  const styles: Record<SyncRunSummary["status"], string> = {
    running: "bg-primary/10 text-primary",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    completed_with_errors: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    failed: "bg-destructive/10 text-destructive",
  };
  const labels: Record<SyncRunSummary["status"], string> = {
    running: "Running",
    completed: "Completed",
    completed_with_errors: "Completed with errors",
    failed: "Failed",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function GoogleSheetsSync() {
  const [status, setStatus] = useState<SheetsStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [syncError, setSyncError] = useState<{
    message: string;
    migration?: string;
    executionId?: string;
  } | null>(null);

  const loadStatus = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await axios.get<SheetsStatusResponse>("/api/admin/google-sheets/status");
      setStatus(response.data);
      setLoadError(null);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? String(error.response?.data?.error ?? error.message)
        : "Could not load the Google Sheets status.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!confirming) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirming(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirming]);

  useEffect(() => {
    if (!status?.running) return;
    const timer = window.setInterval(() => void loadStatus(false), 5000);
    return () => window.clearInterval(timer);
  }, [status?.running, loadStatus]);

  async function runSync() {
    setConfirming(false);
    setSyncing(true);
    setReport(null);
    setSyncError(null);
    try {
      const response = await axios.post<SyncReport>("/api/admin/google-sheets/sync");
      setReport(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as SyncErrorResponse | undefined;
        setSyncError({
          message: String(data?.error ?? error.message),
          migration: data?.migration,
          executionId: data?.executionId,
        });
      } else {
        setSyncError({ message: "The synchronisation request could not be completed." });
      }
    } finally {
      setSyncing(false);
      void loadStatus(false);
    }
  }

  if (loading && !status) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
        <h2 className="flex items-center gap-2 font-bold text-destructive">
          <XCircle className="h-5 w-5" aria-hidden="true" />
          Could not load Google Sheets status
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  const running = status.running;
  const syncDisabled = !status.configured || syncing || Boolean(running);
  const buttonLabel = syncing
    ? "Synchronising…"
    : running
      ? "Sync in progress"
      : "Sync Tenders Now";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Tender register</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold">
            <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden="true" />
            Google Sheets Sync
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Synchronise the tender records shown on the website into the &quot;Tender Register&quot; sheet. Existing
            rows are updated only when their exported fields change, and rows are never deleted
            automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loading || syncing}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={syncDisabled}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing || running ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CloudUpload className="h-4 w-4" aria-hidden="true" />
            )}
            {buttonLabel}
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-sm text-amber-800 dark:text-amber-300">
          Status refresh failed: {loadError}
        </div>
      ) : null}

      {!status.configured ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h3 className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Configuration required
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add these server-only environment variables, then restart the app or redeploy:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {status.missing.map((name) => (
              <li key={name} className="rounded-lg border border-border bg-card px-2 py-1 font-mono text-xs font-semibold">
                {name}
              </li>
            ))}
          </ul>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Create a Google Cloud service-account key and enable the Google Sheets API for its
              project.
            </li>
            <li>
              Share the spreadsheet with{" "}
              <span className="font-mono text-xs font-semibold text-foreground">
                {status.serviceAccountEmail || "the service-account email"}
              </span>{" "}
              as <strong>Editor</strong>.
            </li>
            <li>
              Keep <code className="font-mono text-xs">GOOGLE_PRIVATE_KEY</code> server-side only.
              Never prefix it with <code className="font-mono text-xs">NEXT_PUBLIC_</code>.
            </li>
          </ol>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Website tenders"
          value={status.websiteError ? "—" : status.websiteTenders}
          hint={status.websiteError ? "Count unavailable" : "Tender records in Supabase"}
        />
        <StatCard
          label="Rows in sheet"
          value={status.sheet.tabExists ? status.sheet.dataRows : "—"}
          hint={status.sheet.tabExists ? "Data rows under the header" : "Tender Register tab not created yet"}
        />
        <StatCard
          label="Last successful sync"
          value={status.lastSuccessful ? formatDateTime(status.lastSuccessful.completedAt) : "Never"}
          hint={status.lastSuccessful ? `${status.lastSuccessful.added} added · ${status.lastSuccessful.updated} updated${status.lastSuccessful.failed ? ` · ${status.lastSuccessful.failed} failed` : ""}` : "No completed sync yet"}
        />
        <StatCard
          label="Connection"
          value={status.sheet.reachable ? "Connected" : "Not connected"}
          hint={status.sheet.reachable ? "Google Sheets API reachable" : "Check credentials and sharing"}
        />
      </div>

      {running ? (
        <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <p>
            A synchronisation is currently running (started {formatDateTime(running.startedAt)}). The
            button stays disabled until it finishes; refreshing this page is safe.
          </p>
        </div>
      ) : null}

      {syncing ? (
        <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm" role="status">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <p>Reading the spreadsheet and writing changed rows. Do not close this page.</p>
        </div>
      ) : null}

      {syncError ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4" role="alert">
          <h3 className="flex items-center gap-2 font-bold text-destructive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Synchronisation failed
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{syncError.message}</p>
          {syncError.migration ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Run{" "}
              <code className="rounded bg-card px-1 py-0.5 font-mono text-[11px]">{syncError.migration}</code>{" "}
              in the Supabase SQL editor, then try again.
            </p>
          ) : null}
          {syncError.executionId ? (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              Execution {syncError.executionId.slice(0, 8)} · full ID {syncError.executionId}
            </p>
          ) : null}
        </div>
      ) : null}

      {report ? (
        <div
          className={`rounded-2xl border p-4 ${
            report.failed > 0
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-emerald-500/25 bg-emerald-500/5"
          }`}
          role="status"
        >
          <h3 className="flex items-center gap-2 font-bold">
            {report.failed > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            )}
            {report.failed > 0 ? "Sync finished with failed records" : "Sync completed"}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              ["Added", report.added],
              ["Updated", report.updated],
              ["Skipped", report.skipped],
              ["Failed", report.failed],
              ["Processed", report.total],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-border bg-card px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-base font-bold">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Execution {report.executionId} · started {formatDateTime(report.startedAt)} ·{" "}
            {(report.durationMs / 1000).toFixed(1)}s
            {report.tabCreated ? " · created the Tender Register tab" : ""}
          </p>
          {report.warnings.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              {report.warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}
          {report.failures.length > 0 ? (
            <details className="mt-3 border-t border-border pt-3">
              <summary className="cursor-pointer text-xs font-bold text-foreground">
                Failed records ({report.failures.length})
              </summary>
              <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                {report.failures.map((failure, index) => (
                  <li key={`${failure.internalId}-${index}`} className="rounded-lg border border-border bg-card p-2">
                    <p className="font-semibold text-foreground">
                      {failure.internalId || "Unknown record"} · {failure.organization || "No organization"} ·{" "}
                      {failure.portalId || "No Portal ID"}
                    </p>
                    <p className="mt-0.5">{failure.reason}</p>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {report.spreadsheetUrl ? (
            <a
              href={report.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Open the spreadsheet
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Connection
          </h3>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-start gap-2">
              {status.sheet.reachable ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              )}
              <p className="text-muted-foreground">{status.sheet.message}</p>
            </div>
            <dl className="grid gap-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Service account
                </dt>
                <dd className="break-all font-mono text-xs">{status.serviceAccountEmail || "Not configured"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Spreadsheet ID
                </dt>
                <dd className="break-all font-mono text-xs">{status.sheetId || "Not configured"}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              The spreadsheet ID and credentials come from server-side environment variables. They
              are shown read-only here and never sent to the browser as secrets.
            </p>
            {status.spreadsheetUrl ? (
              <a
                href={status.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                Open spreadsheet
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
            {status.lastRun ? (
              <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Last run {formatDateTime(status.lastRun.startedAt)} · <StatusPill status={status.lastRun.status} />
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 font-bold">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            Sync history
          </h3>
          {status.history === null ? (
            <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">History table not found</p>
              <p className="mt-1">
                Run{" "}
                <code className="rounded bg-card px-1 py-0.5 font-mono text-[11px]">
                  {status.historyMigration}
                </code>{" "}
                in the Supabase SQL editor to enable the sync lock and history.
              </p>
            </div>
          ) : status.history.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No sync runs yet. The first run will create a history entry.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">Started</th>
                    <th className="py-2 pr-3">Completed</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Execution</th>
                    <th className="py-2 pr-3 text-right">Added</th>
                    <th className="py-2 pr-3 text-right">Updated</th>
                    <th className="py-2 pr-3 text-right">Skipped</th>
                    <th className="py-2 pr-3 text-right">Failed</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {status.history.map((run) => (
                    <Fragment key={run.id}>
                      <tr>
                        <td className="py-2 pr-3 whitespace-nowrap">{formatDateTime(run.startedAt)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{formatDateTime(run.completedAt)}</td>
                        <td className="py-2 pr-3">
                          <StatusPill status={run.status} />
                        </td>
                        <td className="py-2 pr-3">
                          <span className="font-mono text-[10px]" title={run.id}>
                            {run.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right font-semibold">{run.added}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{run.updated}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{run.skipped}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{run.failed}</td>
                        <td className="py-2 text-right font-semibold">{run.total}</td>
                      </tr>
                      {run.errorDetails.length > 0 ? (
                        <tr>
                          <td colSpan={9} className="pb-2">
                            <details>
                              <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground">
                                Error details ({run.errorDetails.length})
                              </summary>
                              <ul className="mt-1 space-y-1">
                                {run.errorDetails.map((failure, index) => (
                                  <li
                                    key={`${run.id}-${index}`}
                                    className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                                  >
                                    <span className="font-semibold text-foreground">
                                      {failure.internalId || "Unknown record"}
                                    </span>{" "}
                                    · {failure.organization || "No organization"} ·{" "}
                                    {failure.portalId || "No Portal ID"} — {failure.reason}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Rows removed from the website are left in the spreadsheet. Duplicate keys already present
            in the sheet are never deleted automatically.
          </p>
        </section>
      </div>

      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setConfirming(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheets-sync-confirm-title"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="sheets-sync-confirm-title" className="text-lg font-bold">
              Sync all tenders to Google Sheets?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This reads{" "}
              {status.websiteError
                ? "all website tender records"
                : `all ${status.websiteTenders} website tender records`}{" "}
              and adds or updates rows in the &quot;Tender Register&quot; sheet.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• New tenders are appended with the next serial number.</li>
              <li>• Existing rows update only when organization, Portal ID, title, or dates change.</li>
              <li>• Unchanged records are skipped; no spreadsheet rows are deleted.</li>
            </ul>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void runSync()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
              >
                <CloudUpload className="h-4 w-4" aria-hidden="true" />
                Sync now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
