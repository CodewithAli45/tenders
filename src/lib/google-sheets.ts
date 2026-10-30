import "server-only";

import {
  GOOGLE_TOKEN_URL,
  createServiceAccountAssertion,
} from "@/lib/google-service-account";
import { SHEET_HEADER, SHEET_TAB, quoteSheetName } from "@/lib/tender-sheet-model";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const RANGE = `${quoteSheetName(SHEET_TAB)}!A1:G`;
const HEADER_RANGE = `${quoteSheetName(SHEET_TAB)}!A1:G1`;

export type GoogleSheetsConfig = {
  configured: boolean;
  missing: string[];
  serviceAccountEmail: string;
  privateKey: string;
  sheetId: string;
  spreadsheetUrl: string;
};

export class GoogleSheetsError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GoogleSheetsError";
    this.status = status;
  }
}

export function spreadsheetUrl(sheetId: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const serviceAccountEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "").trim();
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").trim();
  const sheetId = (process.env.GOOGLE_SHEET_ID ?? "").trim();
  const missing: string[] = [];
  if (!serviceAccountEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
  if (!sheetId) missing.push("GOOGLE_SHEET_ID");

  return {
    configured: missing.length === 0,
    missing,
    serviceAccountEmail,
    privateKey,
    sheetId,
    spreadsheetUrl: sheetId ? spreadsheetUrl(sheetId) : "",
  };
}

export function requireGoogleSheetsConfig(config: GoogleSheetsConfig) {
  if (!config.configured) {
    throw new GoogleSheetsError(
      `Google Sheets sync is not configured. Missing: ${config.missing.join(", ")}.`,
      503,
    );
  }
  return config;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readErrorMessage(response: Response) {
  const text = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } | string; message?: string };
    if (typeof parsed.error === "string") return parsed.error;
    return parsed.error?.message || parsed.message || text;
  } catch {
    return text;
  }
}

async function withRetry(request: () => Promise<Response>, action: string) {
  let lastMessage = "Unknown error";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response: Response;
    try {
      response = await request();
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "Network request failed";
      if (attempt < 3) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      break;
    }

    if (response.ok) return response;

    lastMessage = await readErrorMessage(response);
    if (!RETRYABLE_STATUS.has(response.status) || attempt === 3) {
      throw new GoogleSheetsError(`${action} failed (${response.status}): ${lastMessage}`, response.status);
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
    await sleep(delay);
  }

  throw new GoogleSheetsError(`${action} failed: ${lastMessage}`);
}

let cachedToken: { email: string; token: string; expiresAt: number } | null = null;

async function getAccessToken(config: GoogleSheetsConfig) {
  if (
    cachedToken &&
    cachedToken.email === config.serviceAccountEmail &&
    cachedToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedToken.token;
  }

  const assertion = (() => {
    try {
      return createServiceAccountAssertion({
        clientEmail: config.serviceAccountEmail,
        privateKey: config.privateKey,
      });
    } catch (error) {
      console.error("Google service-account key error:", error);
      throw new GoogleSheetsError(
        "GOOGLE_PRIVATE_KEY could not be read. Paste the complete service-account private key, keeping the BEGIN/END lines and using escaped \\n newlines if the value is stored on one line.",
      );
    }
  })();

  const response = await withRetry(
    () =>
      fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion,
        }).toString(),
        cache: "no-store",
      }),
    "Google authentication",
  );

  const data = (await response.json().catch(() => null)) as
    | { access_token?: string; expires_in?: number }
    | null;

  if (!data?.access_token) {
    throw new GoogleSheetsError("Google authentication succeeded but no access token was returned.");
  }

  cachedToken = {
    email: config.serviceAccountEmail,
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function sheetsRequest(
  config: GoogleSheetsConfig,
  path: string,
  init: RequestInit,
  action: string,
) {
  const token = await getAccessToken(config);
  return withRetry(
    () =>
      fetch(`${SHEETS_API}/${encodeURIComponent(config.sheetId)}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        cache: "no-store",
      }),
    action,
  );
}

export type SpreadsheetTab = { sheetId: number; title: string };

export async function getSpreadsheetTabs(config: GoogleSheetsConfig): Promise<SpreadsheetTab[]> {
  const response = await sheetsRequest(
    config,
    "?fields=sheets.properties(sheetId,title)",
    { method: "GET" },
    "Reading spreadsheet",
  );
  const data = (await response.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  return (data.sheets ?? [])
    .map((sheet) => ({
      sheetId: Number(sheet.properties?.sheetId ?? 0),
      title: String(sheet.properties?.title ?? ""),
    }))
    .filter((sheet) => sheet.title);
}

export async function ensureTenderRegisterTab(config: GoogleSheetsConfig) {
  const tabs = await getSpreadsheetTabs(config);
  if (tabs.some((tab) => tab.title === SHEET_TAB)) return { created: false };

  await sheetsRequest(
    config,
    ":batchUpdate",
    {
      method: "POST",
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SHEET_TAB } } }] }),
    },
    `Creating the "${SHEET_TAB}" sheet`,
  );
  return { created: true };
}

export async function readTenderRegister(config: GoogleSheetsConfig) {
  const response = await sheetsRequest(
    config,
    `/values/${encodeURIComponent(RANGE)}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`,
    { method: "GET" },
    `Reading the "${SHEET_TAB}" sheet`,
  );
  const data = (await response.json()) as { values?: unknown[][] };
  return { values: data.values ?? [] };
}

export async function writeTenderRegisterHeader(config: GoogleSheetsConfig) {
  await sheetsRequest(
    config,
    `/values/${encodeURIComponent(HEADER_RANGE)}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({
        range: HEADER_RANGE,
        majorDimension: "ROWS",
        values: [SHEET_HEADER],
      }),
    },
    "Writing the Tender Register header",
  );
}

export async function appendTenderRegisterRows(config: GoogleSheetsConfig, values: string[][]) {
  const response = await sheetsRequest(
    config,
    `/values/${encodeURIComponent(RANGE)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&includeValuesInResponse=false`,
    { method: "POST", body: JSON.stringify({ values }) },
    "Appending tender rows",
  );
  const data = (await response.json()) as { updates?: { updatedRows?: number } };
  return { updatedRows: data.updates?.updatedRows ?? values.length };
}

export type TenderRangeUpdate = { range: string; values: string[][] };

export async function batchUpdateTenderRegister(
  config: GoogleSheetsConfig,
  updates: TenderRangeUpdate[],
) {
  const response = await sheetsRequest(
    config,
    "/values:batchUpdate",
    {
      method: "POST",
      body: JSON.stringify({ valueInputOption: "RAW", data: updates }),
    },
    "Updating tender rows",
  );
  const data = (await response.json()) as { totalUpdatedRows?: number };
  return { updatedRows: data.totalUpdatedRows ?? updates.length };
}
