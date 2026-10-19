import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

// Public reference pages need organization names only. Keep admin contact data private.
export async function GET() {
  try {
    const response = await supabaseRequest("/rest/v1/organizations?select=name&order=name.asc");
    const rows = (await response.json()) as { name?: unknown }[];
    const names = [...new Set(rows.map((row) => typeof row.name === "string" ? row.name.trim() : "").filter(Boolean))];
    return NextResponse.json(names, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } });
  } catch (error) {
    console.error("Public organization list error:", error);
    return NextResponse.json({ error: "Organization list is temporarily unavailable" }, { status: 503 });
  }
}
