import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  GoogleSheetsError,
  appendTenderRegisterRows,
  batchUpdateTenderRegister,
  ensureTenderRegisterTab,
  getGoogleSheetsConfig,
  readTenderRegister,
  requireGoogleSheetsConfig,
  writeTenderRegisterHeader,
} from "@/lib/google-sheets";
import {
  SYNC_HISTORY_MIGRATION,
  SyncAlreadyRunningError,
  SyncHistoryUnavailableError,
  finishSyncRun,
  reclaimStaleRuns,
  startSyncRun,
} from "@/lib/google-sheets-runs";
import type { SyncErrorResponse, SyncReport } from "@/lib/google-sheets-types";
import { supabaseRequest } from "@/lib/supabase-server";
import {
  SHEET_HEADER,
  buildSyncPlan,
  formatIstTimestamp,
  headerMatches,
  parseSheetRows,
  type SyncFailure,
  type TenderSourceRow,
} from "@/lib/tender-sheet-model";

export const maxDuration = 60;

const UPDATE_CHUNK_SIZE = 100;

class SyncValidationError extends Error {
  status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.name = "SyncValidationError";
    this.status = status;
  }
}

type TenderRow = {
  id: string;
  internal_id: string | null;
  organization: string | null;
  portal_id: string | null;
  title: string | null;
  publish_date: string | null;
  due_date: string | null;
};

async function loadTenderSources(): Promise<TenderSourceRow[]> {
  const PAGE_SIZE = 1000;
  const select = "select=id,internal_id,organization,portal_id,title,publish_date,due_date";
  const sources: TenderSourceRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await supabaseRequest(
      `/rest/v1/tenders?${select}&order=created_at.desc,id.desc&limit=${PAGE_SIZE}&offset=${offset}`,
    );
    const rows = (await response.json()) as TenderRow[];
    for (const row of rows) {
      sources.push({
        id: String(row.id),
        internalId: String(row.internal_id ?? ""),
        organization: String(row.organization ?? ""),
        portalId: String(row.portal_id ?? ""),
        title: String(row.title ?? ""),
        publishDate: String(row.publish_date ?? ""),
        dueDate: String(row.due_date ?? ""),
      });
    }
    if (rows.length < PAGE_SIZE) break;
  }

  return sources;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Unknown synchronisation error.";
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const config = getGoogleSheetsConfig();
  if (!config.configured) {
    const body: SyncErrorResponse = {
      error: `Google Sheets sync is not configured. Missing: ${config.missing.join(", ")}.`,
      missing: config.missing,
    };
    return NextResponse.json(body, { status: 503 });
  }

  let run;
  try {
    await reclaimStaleRuns();
    run = await startSyncRun(config.sheetId);
  } catch (error) {
    if (error instanceof SyncHistoryUnavailableError) {
      const body: SyncErrorResponse = { error: error.message, migration: SYNC_HISTORY_MIGRATION };
      return NextResponse.json(body, { status: 503 });
    }
    if (error instanceof SyncAlreadyRunningError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Google Sheets sync lock error:", error);
    return NextResponse.json({ error: "Could not start the synchronisation." }, { status: 500 });
  }

  const startedAtMs = Date.now();
  let total = 0;
  let added = 0;
  let updated = 0;
  let skipped = 0;
  let failures: SyncFailure[] = [];
  const warnings: string[] = [];

  try {
    requireGoogleSheetsConfig(config);

    const sources = await loadTenderSources();
    total = sources.length;

    const { created: tabCreated } = await ensureTenderRegisterTab(config);
    const { values } = await readTenderRegister(config);

    const header = values[0] ?? [];
    if (header.length > 0 && !headerMatches(header)) {
      const actual = Array.from(header).map((cell) => String(cell ?? "")).join(" | ");
      throw new SyncValidationError(
        `The "Tender Register" header in row 1 does not match the required columns. Expected: ${SHEET_HEADER.join(" | ")}. Found: ${actual}. Restore the header or clear row 1, then run the sync again. No rows were written.`,
      );
    }
    if (header.length === 0) {
      await writeTenderRegisterHeader(config);
    }

    const sheetRows = parseSheetRows(values.slice(1));
    const plan = buildSyncPlan(sources, sheetRows, formatIstTimestamp(new Date()));
    warnings.push(...plan.warnings);
    failures = [...plan.failures];
    skipped = plan.skipped;

    if (plan.appends.length > 0) {
      try {
        await appendTenderRegisterRows(
          config,
          plan.appends.map((entry) => entry.values),
        );
        added = plan.appends.length;
      } catch (error) {
        const reason = `Could not append rows: ${messageOf(error)}`;
        for (const entry of plan.appends) {
          failures.push({
            internalId: entry.source.internalId,
            organization: entry.source.organization,
            portalId: entry.source.portalId,
            reason,
          });
        }
      }
    }

    for (const group of chunk(plan.updates, UPDATE_CHUNK_SIZE)) {
      try {
        await batchUpdateTenderRegister(
          config,
          group.map((entry) => ({ range: entry.range, values: [entry.values] })),
        );
        updated += group.length;
      } catch (error) {
        const reason = `Could not update rows: ${messageOf(error)}`;
        for (const entry of group) {
          failures.push({
            internalId: entry.source.internalId,
            organization: entry.source.organization,
            portalId: entry.source.portalId,
            reason,
          });
        }
      }
    }

    const status = failures.length > 0 ? "completed_with_errors" : "completed";
    let completedAt: string | null = new Date().toISOString();

    try {
      const finished = await finishSyncRun(run.id, {
        status,
        total,
        added,
        updated,
        skipped,
        failed: failures.length,
        errorDetails: failures,
      });
      completedAt = finished?.completedAt ?? completedAt;
    } catch (error) {
      console.error("Google Sheets sync history update error:", error);
      warnings.push(
        "The sync finished, but the run history could not be updated. The lock will clear automatically after 15 minutes.",
      );
    }

    const report: SyncReport = {
      executionId: run.id,
      status,
      startedAt: new Date(startedAtMs).toISOString(),
      completedAt,
      durationMs: Date.now() - startedAtMs,
      total,
      added,
      updated,
      skipped,
      failed: failures.length,
      failures,
      warnings,
      spreadsheetId: config.sheetId,
      spreadsheetUrl: config.spreadsheetUrl,
      tabCreated,
    };
    return NextResponse.json(report);
  } catch (error) {
    const message = messageOf(error);
    console.error("Google Sheets sync error:", error);

    try {
      await finishSyncRun(run.id, {
        status: "failed",
        total,
        added,
        updated,
        skipped,
        failed: failures.length,
        errorDetails:
          failures.length > 0
            ? failures
            : [{ internalId: "", organization: "", portalId: "", reason: message }],
      });
    } catch (historyError) {
      console.error("Google Sheets sync failure could not be recorded:", historyError);
    }

    const status =
      error instanceof SyncValidationError
        ? error.status
        : error instanceof GoogleSheetsError && error.status && error.status < 500
          ? 502
          : 502;
    const body: SyncErrorResponse = { error: message, executionId: run.id };
    return NextResponse.json(body, { status });
  }
}
