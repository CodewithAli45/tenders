import "server-only";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return { url, key };
}

export function supabaseHeaders(key: string, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("apikey", key);

  // The new opaque sb_secret_* / sb_publishable_* API keys are not JWTs.
  // Sending one as a Bearer token makes Supabase try to validate it as a JWT.
  if (!key.startsWith("sb_") && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${key}`);
  }

  return headers;
}

export async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: supabaseHeaders(key, init.headers),
    cache: "no-store",
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Supabase request failed (${response.status})`);
  }
  return response;
}

export function supabaseUrl() { return config().url; }
