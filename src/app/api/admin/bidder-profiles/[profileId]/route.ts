import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ profileId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { profileId } = await params;
    const data = await request.json() as Record<string, string | undefined>;
    const name = data.name?.trim();
    if (!name) return NextResponse.json({ error: "Bidder name is required" }, { status: 400 });
    const response = await supabaseRequest(`/rest/v1/bidder_profiles?id=eq.${encodeURIComponent(profileId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ name, contact_person: data.contactPerson?.trim() || null, email: data.email?.trim() || null, phone: data.phone?.trim() || null, address: data.address?.trim() || null, notes: data.notes?.trim() || null, updated_at: new Date().toISOString() }),
    });
    const rows = await response.json();
    if (!rows[0]) return NextResponse.json({ error: "Bidder profile not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("23505") || message.toLowerCase().includes("duplicate key")) return NextResponse.json({ error: "A bidder with this name already exists" }, { status: 409 });
    console.error("Bidder profile update error:", error);
    return NextResponse.json({ error: "Could not update bidder profile" }, { status: 500 });
  }
}
