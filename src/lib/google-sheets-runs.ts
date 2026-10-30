import "server-only";

import { supabaseRequest } from "@/lib/supabase-server";
import type { SyncFailure } from "@/lib/tender-sheet-model";

export const SYNC_HISTORY_MIGRATION = "supabase/migrations/20261030000000_google_sheets_sync.sql";
export const STALE_RUN_MINUTES = 15;

export type SyncRunStatus = "running" | "completed" | "completed_with_errors" | "failed";

export type SyncRun = {
  id: string;
  status: SyncRunStatus;
  spreadsheetId: string;
  startedAt: string;
  completedAt: string | null;
  total: number;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  errorDetails: SyncFailure[];
};

type SyncRunRow = {
  id: string;
  status: SyncRunStatus;
  spreadsheet_id: string | null;
  started_at: string;
  completed_at: string | null;
  total_records: number | null;
  added: number | null;
  updated: number | null;
  skipped: number | null;
  failed: number | null;
  error_details: SyncFailure[] | null;
};

export class SyncHistoryUnavailableError extends Error {
  constructor() {
    super(
      `The sync history table is missing. Run the migration ${SYNC_HISTORY_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
    this.name = "SyncHistoryUnavailableError";
  }
}

export class SyncAlreadyRunningError extends Error {
  constructor(startedAt?: string) {
    super(
      startedAt
        ? `A synchronisation is already running (started ${startedAt}). Wait for it to finish, then try again.`
        : "A synchronisation is already running. Wait for it to finish, then try again.",
    );
    this.name = "SyncAlreadyRunningError";
  }
}

function isMissingTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /42P01|PGRST205|does not exist|could not find the table|schema cache/i.test(message) &&
    /google_sheets_sync_runs/i.test(message)
  );
}

function isUniqueViolation(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /23505|duplicate key/i.test(message);
}

function toRun(row: SyncRunRow): SyncRun {
  return {
    id: row.id,
    status: row.status,
    spreadsheetId: row.spreadsheet_id ?? "",
    startedAt: row.started_at,
    completedAt: row.completed_at,
    total: row.total_records ?? 0,
    added: row.added ?? 0,
    updated: row.updated ?? 0,
    skipped: row.skipped ?? 0,
    failed: row.failed ?? 0,
    errorDetails: Array.isArray(row.error_details) ? row.error_details : [],
  };
}

/** Returns null when the history table has not been migrated yet. */
export async function listSyncRuns(limit = 10): Promise<SyncRun[] | null> {
  try {
    const response = await supabaseRequest(
      `/rest/v1/google_sheets_sync_runs?select=*&order=started_at.desc&limit=${limit}`,
    );
    const rows = (await response.json()) as SyncRunRow[];
    return rows.map(toRun);
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
}

export async function getRunningSync(): Promise<SyncRun | null> {
  try {
    const response = await supabaseRequest(
      "/rest/v1/google_sheets_sync_runs?select=*&status=eq.running&order=started_at.desc&limit=1",
    );
    const rows = (await response.json()) as SyncRunRow[];
    return rows[0] ? toRun(rows[0]) : null;
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
}

/** Releases locks left behind by a crashed or interrupted execution. */
export async function reclaimStaleRuns() {
  const cutoff = new Date(Date.now() - STALE_RUN_MINUTES * 60_000).toISOString();
  try {
    await supabaseRequest(
      `/rest/v1/google_sheets_sync_runs?status=eq.running&started_at=lt.${encodeURIComponent(cutoff)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_details: [
            {
              internalId: "",
              organization: "",
              portalId: "",
              reason: `The sync did not finish within ${STALE_RUN_MINUTES} minutes, so the lock was released automatically. Check the spreadsheet state and run it again.`,
            },
          ],
        }),
      },
    );
  } catch (error) {
    if (isMissingTable(error)) throw new SyncHistoryUnavailableError();
    throw error;
  }
}

export async function startSyncRun(spreadsheetId: string) {
  try {
    const response = await supabaseRequest("/rest/v1/google_sheets_sync_runs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        status: "running",
        spreadsheet_id: spreadsheetId,
        triggered_by: "admin",
      }),
    });
    const rows = (await response.json()) as SyncRunRow[];
    if (!rows[0]) throw new Error("Supabase did not return the created sync run.");
    return toRun(rows[0]);
  } catch (error) {
    if (isMissingTable(error)) throw new SyncHistoryUnavailableError();
    if (isUniqueViolation(error)) {
      const running = await getRunningSync().catch(() => null);
      throw new SyncAlreadyRunningError(
        running ? new Date(running.startedAt).toISOString() : undefined,
      );
    }
    throw error;
  }
}

export type FinishRunInput = {
  status: Exclude<SyncRunStatus, "running">;
  total: number;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  errorDetails: SyncFailure[];
};

export async function finishSyncRun(id: string, input: FinishRunInput) {
  const response = await supabaseRequest(`/rest/v1/google_sheets_sync_runs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({
      status: input.status,
      completed_at: new Date().toISOString(),
      total_records: input.total,
      added: input.added,
      updated: input.updated,
      skipped: input.skipped,
      failed: input.failed,
      error_details: input.errorDetails,
    }),
  });
  const rows = (await response.json()) as SyncRunRow[];
  return rows[0] ? toRun(rows[0]) : null;
}
