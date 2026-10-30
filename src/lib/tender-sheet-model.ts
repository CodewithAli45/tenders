/**
 * Pure helpers for the Google Sheets tender register. Kept free of server-only
 * imports so the diff/key logic can be unit-tested directly.
 */

export const SHEET_TAB = "Tender Register";
export const SHEET_HEADER = [
  "Serial No.",
  "organization",
  "Portal ID",
  "Tender Name",
  "Publish Date",
  "Due Date",
  "Last Synced",
] as const;

export type TenderSourceRow = {
  id: string;
  internalId: string;
  organization: string;
  portalId: string;
  title: string;
  publishDate: string;
  dueDate: string;
};

export type SheetRegisterRow = {
  /** 1-based spreadsheet row number. */
  rowNumber: number;
  serial: string;
  organization: string;
  portalId: string;
  title: string;
  publishDate: string;
  dueDate: string;
  lastSynced: string;
};

export type SyncFailure = {
  internalId: string;
  organization: string;
  portalId: string;
  reason: string;
};

export type AppendPlan = {
  source: TenderSourceRow;
  values: string[];
};

export type UpdatePlan = {
  source: TenderSourceRow;
  row: SheetRegisterRow;
  range: string;
  values: string[];
};

export type SyncPlan = {
  header: typeof SHEET_HEADER;
  appends: AppendPlan[];
  updates: UpdatePlan[];
  skipped: number;
  failures: SyncFailure[];
  warnings: string[];
  sheetRowCount: number;
};

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;

/** Normalises one half of the composite key without touching the displayed value. */
export function normalizeKeyPart(value: unknown) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function tenderKey(organization: string, portalId: string) {
  return `${normalizeKeyPart(organization)}::${normalizeKeyPart(portalId)}`;
}

/** ISO `YYYY-MM-DD` to the required `DD-MM-YYYY` display format. */
export function formatSheetDate(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(text);
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
  return text;
}

/** `DD-MM-YYYY HH:mm` in Indian Standard Time, used only for the Last Synced column. */
export function formatIstTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}`;
}

export function headerMatches(values: readonly unknown[] | undefined) {
  if (!values) return false;
  return SHEET_HEADER.every((header, index) => String(values[index] ?? "").trim() === header);
}

export function parseSheetRows(values: readonly (readonly unknown[])[]): SheetRegisterRow[] {
  const rows: SheetRegisterRow[] = [];
  values.forEach((row, index) => {
    // Keep cell text exactly as stored so exported values are compared without
    // rewriting them; whitespace-only rows are still treated as blank.
    const cells = Array.from(row ?? []).map((cell) => String(cell ?? ""));
    if (cells.every((cell) => cell.trim() === "")) return;
    rows.push({
      rowNumber: index + 2,
      serial: cells[0] ?? "",
      organization: cells[1] ?? "",
      portalId: cells[2] ?? "",
      title: cells[3] ?? "",
      publishDate: cells[4] ?? "",
      dueDate: cells[5] ?? "",
      lastSynced: cells[6] ?? "",
    });
  });
  return rows;
}

function nextSerial(rows: readonly SheetRegisterRow[]) {
  return rows.reduce((max, row) => {
    const parsed = Number.parseInt(row.serial, 10);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
}

/**
 * Builds an idempotent plan by comparing the database records with the rows
 * already present in the sheet. Only exported fields (B-F) decide whether a row
 * has changed; Last Synced is written when a row is written, never on its own.
 */
export function buildSyncPlan(
  sources: readonly TenderSourceRow[],
  sheetRows: readonly SheetRegisterRow[],
  lastSynced: string,
): SyncPlan {
  const warnings: string[] = [];
  const failures: SyncFailure[] = [];
  const sheetByKey = new Map<string, SheetRegisterRow>();
  let sheetDuplicateKeys = 0;

  for (const row of sheetRows) {
    const key = tenderKey(row.organization, row.portalId);
    if (sheetByKey.has(key)) {
      sheetDuplicateKeys += 1;
      continue;
    }
    sheetByKey.set(key, row);
  }
  if (sheetDuplicateKeys > 0) {
    warnings.push(
      `${sheetDuplicateKeys} duplicate key row(s) already exist in the spreadsheet. The first row for each key is used; no rows were deleted.`,
    );
  }

  const sourceKeys = new Map<string, string>();
  const appends: AppendPlan[] = [];
  const updates: UpdatePlan[] = [];
  let skipped = 0;
  let serial = nextSerial(sheetRows);

  for (const source of sources) {
    const organization = String(source.organization ?? "").trim();
    const portalId = String(source.portalId ?? "").trim();
    const internalId = String(source.internalId ?? "").trim();

    if (!portalId) {
      failures.push({
        internalId,
        organization,
        portalId,
        reason: "Missing Portal ID in the database record. No identifier was invented.",
      });
      continue;
    }
    if (!organization) {
      failures.push({
        internalId,
        organization,
        portalId,
        reason: "Missing organization name in the database record.",
      });
      continue;
    }

    const key = tenderKey(organization, portalId);
    const existingSource = sourceKeys.get(key);
    if (existingSource) {
      failures.push({
        internalId,
        organization,
        portalId,
        reason: `Duplicate organization + Portal ID in the database (same key as ${existingSource}). The first record was kept; this one was not written.`,
      });
      continue;
    }
    sourceKeys.set(key, internalId || "another record");

    const display = {
      organization: String(source.organization),
      portalId: String(source.portalId),
      title: String(source.title ?? ""),
      publishDate: formatSheetDate(source.publishDate),
      dueDate: formatSheetDate(source.dueDate),
    };

    const existing = sheetByKey.get(key);
    if (!existing) {
      serial += 1;
      appends.push({
        source,
        values: [
          String(serial),
          display.organization,
          display.portalId,
          display.title,
          display.publishDate,
          display.dueDate,
          lastSynced,
        ],
      });
      continue;
    }

    const changed =
      existing.organization !== display.organization ||
      existing.portalId !== display.portalId ||
      existing.title !== display.title ||
      existing.publishDate !== display.publishDate ||
      existing.dueDate !== display.dueDate;

    if (!changed) {
      skipped += 1;
      continue;
    }

    updates.push({
      source,
      row: existing,
      range: `${quoteSheetName(SHEET_TAB)}!B${existing.rowNumber}:G${existing.rowNumber}`,
      values: [
        display.organization,
        display.portalId,
        display.title,
        display.publishDate,
        display.dueDate,
        lastSynced,
      ],
    });
  }

  return {
    header: SHEET_HEADER,
    appends,
    updates,
    skipped,
    failures,
    warnings,
    sheetRowCount: sheetRows.length,
  };
}

export function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}
