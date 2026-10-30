import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  SYNC_HISTORY_MIGRATION,
  SyncHistoryUnavailableError,
  getRunningSync,
  listSyncRuns,
  reclaimStaleRuns,
  type SyncRun,
} from "@/lib/google-sheets-runs";
import { getGoogleSheetsConfig, getSpreadsheetTabs, readTenderRegister } from "@/lib/google-sheets";
import type { SheetConnectionInfo, SheetsStatusResponse } from "@/lib/google-sheets-types";
import { supabaseRequest } from "@/lib/supabase-server";
import { SHEET_TAB, headerMatches, parseSheetRows, tenderKey } from "@/lib/tender-sheet-model";

const emptySheetInfo: SheetConnectionInfo = {
  reachable: false,
  tabExists: false,
  headerValid: false,
  dataRows: 0,
  syncedRows: 0,
  message: "Google Sheets is not connected.",
};

async function countTenders() {
  const response = await supabaseRequest("/rest/v1/tenders?select=id", {
    headers: { Prefer: "count=exact", Range: "0-0" },
  });
  const range = response.headers.get("content-range") ?? "";
  const total = Number.parseInt(range.split("/")[1] ?? "", 10);
  if (Number.isFinite(total)) return total;
  const rows = (await response.json()) as unknown[];
  return rows.length;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const config = getGoogleSheetsConfig();
  let websiteTenders = 0;
  let websiteError: string | null = null;
  try {
    websiteTenders = await countTenders();
  } catch (error) {
    websiteError = error instanceof Error ? error.message : "Could not count tender records.";
  }

  let history: SyncRun[] | null = null;
  let running: SyncRun | null = null;
  try {
    // Release locks left behind by a crashed run before reporting "running", so
    // the admin can start a new sync instead of waiting indefinitely.
    await reclaimStaleRuns();
  } catch (error) {
    if (!(error instanceof SyncHistoryUnavailableError)) {
      console.error("Google Sheets stale-lock cleanup error:", error);
    }
  }
  try {
    [history, running] = await Promise.all([listSyncRuns(10), getRunningSync()]);
  } catch (error) {
    console.error("Google Sheets history load error:", error);
  }

  let sheet: SheetConnectionInfo = { ...emptySheetInfo };
  if (!config.configured) {
    sheet.message = `Google Sheets sync is not configured. Missing: ${config.missing.join(", ")}.`;
  } else {
    try {
      const tabs = await getSpreadsheetTabs(config);
      sheet = { ...emptySheetInfo, reachable: true, message: "Connected to Google Sheets." };
      const tab = tabs.find((entry) => entry.title === SHEET_TAB);
      if (!tab) {
        sheet.message =
          'Connected, but the "Tender Register" sheet does not exist yet. It will be created on the first sync.';
      } else {
        const { values } = await readTenderRegister(config);
        sheet.tabExists = true;
        sheet.headerValid = headerMatches(values[0]);
        const rows = parseSheetRows(values.slice(1));
        sheet.dataRows = rows.length;
        sheet.syncedRows = rows.filter(
          (row) => tenderKey(row.organization, row.portalId) !== "::",
        ).length;
        sheet.message = sheet.headerValid
          ? "Connected and the Tender Register header matches."
          : "Connected, but the Tender Register header does not match the required A:G columns.";
      }
    } catch (error) {
      sheet = {
        ...emptySheetInfo,
        message: error instanceof Error ? error.message : "Could not reach Google Sheets.",
      };
    }
  }

  const completedRuns = (history ?? []).filter((run) => run.status !== "running");
  const lastRun = completedRuns[0] ?? null;
  const lastSuccessful =
    completedRuns.find((run) => run.status === "completed" || run.status === "completed_with_errors") ??
    null;

  const body: SheetsStatusResponse = {
    configured: config.configured,
    missing: config.missing,
    serviceAccountEmail: config.serviceAccountEmail,
    sheetId: config.sheetId,
    spreadsheetUrl: config.spreadsheetUrl,
    websiteTenders,
    sheet,
    lastRun,
    lastSuccessful,
    running,
    history,
    historyMigration: SYNC_HISTORY_MIGRATION,
  };

  return NextResponse.json({ ...body, websiteError });
}
