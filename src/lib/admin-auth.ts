import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "govtender_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
type AdminCredential = { password_hash: string; password_salt: string | null };

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase admin credentials are not configured");
  return { url, serviceRoleKey };
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export async function isAdminAuthenticated() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return false;
    const [role, expiresAt, signature] = token.split(".");
    if (role !== "admin" || !expiresAt || !signature || Number(expiresAt) < Date.now() / 1000) return false;
    const expected = sign(`${role}.${expiresAt}`);
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function adminSessionCookie(value: string) {
  return { name: SESSION_COOKIE, value, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: SESSION_DURATION_SECONDS };
}

export function clearAdminSessionCookie() {
  return { ...adminSessionCookie(""), maxAge: 0 };
}

async function getAdminCredential(): Promise<AdminCredential | null> {
  const { url, serviceRoleKey } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/admin_credentials?select=password_hash,password_salt&password_salt=not.is.null&limit=1`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    cache: "no-store",
  });
  if (!response.ok) {
    const details = await response.json().catch(() => null) as { code?: string } | null;
    if (details?.code === "42501") {
      throw new Error("Supabase needs a Secret key in SUPABASE_SERVICE_ROLE_KEY, not a Publishable key.");
    }
    throw new Error("Supabase could not read admin_credentials. Run the admin migration in the Supabase SQL Editor.");
  }
  const credentials = await response.json() as AdminCredential[];
  return credentials[0] ?? null;
}

export async function isAdminConfigured() {
  return (await getAdminCredential()) !== null;
}

export async function verifyAdminPassword(password: string) {
  const credential = await getAdminCredential();
  if (!credential?.password_salt) return false;
  const derivedHash = scryptSync(password, credential.password_salt, 64).toString("base64");
  return timingSafeEqual(Buffer.from(derivedHash), Buffer.from(credential.password_hash));
}

export async function initializeAdminPassword(password: string) {
  const { url, serviceRoleKey } = supabaseConfig();
  const passwordSalt = randomBytes(16).toString("base64");
  const passwordHash = scryptSync(password, passwordSalt, 64).toString("base64");
  const response = await fetch(`${url}/rest/v1/admin_credentials`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ password_hash: passwordHash, password_salt: passwordSalt }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Supabase could not save the admin password. Run the admin migration in the Supabase SQL Editor.");
  return true;
}
