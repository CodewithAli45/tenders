import { createSign } from "node:crypto";

export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export function normalizePrivateKey(value: string) {
  let key = value.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

/**
 * Builds the RS256 JWT assertion used for the Google service-account
 * "jwt-bearer" OAuth flow. Kept dependency-free so the token exchange works on
 * any Node runtime without adding the full googleapis package.
 */
export function createServiceAccountAssertion(input: {
  clientEmail: string;
  privateKey: string;
  scope?: string;
  now?: number;
  lifetimeSeconds?: number;
}) {
  const issuedAt = Math.floor((input.now ?? Date.now()) / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: input.clientEmail,
      scope: input.scope ?? SHEETS_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + (input.lifetimeSeconds ?? 3600),
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .sign(normalizePrivateKey(input.privateKey), "base64url");
  return `${signingInput}.${signature}`;
}
