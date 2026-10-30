import type { SyncFailure } from "@/lib/tender-sheet-model";

export type SyncRunSummary = {
  id: string;
  status: "running" | "completed" | "completed_with_errors" | "failed";
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

export type SheetConnectionInfo = {
  reachable: boolean;
  tabExists: boolean;
  headerValid: boolean;
  dataRows: number;
  syncedRows: number;
  message: string;
};

export type SheetsStatusResponse = {
  configured: boolean;
  missing: string[];
  serviceAccountEmail: string;
  sheetId: string;
  spreadsheetUrl: string;
  websiteTenders: number;
  websiteError?: string | null;
  sheet: SheetConnectionInfo;
  lastRun: SyncRunSummary | null;
  lastSuccessful: SyncRunSummary | null;
  running: SyncRunSummary | null;
  history: SyncRunSummary[] | null;
  historyMigration: string;
};

export type SyncReport = {
  executionId: string;
  status: "completed" | "completed_with_errors";
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  total: number;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: SyncFailure[];
  warnings: string[];
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabCreated: boolean;
};

export type SyncErrorResponse = {
  error: string;
  missing?: string[];
  executionId?: string;
  migration?: string;
};
