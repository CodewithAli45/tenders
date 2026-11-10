import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest("/rest/v1/bidder_profiles?select=id,name,contact_person,email,phone,address,notes&order=name.asc");
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Bidder profiles load error:", error);
    return NextResponse.json({ error: "Could not load bidder directory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json() as Record<string, string | undefined>;
    const name = data.name?.trim();
    if (!name) return NextResponse.json({ error: "Bidder name is required" }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/bidder_profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ name, contact_person: data.contactPerson?.trim() || null, email: data.email?.trim() || null, phone: data.phone?.trim() || null, address: data.address?.trim() || null, notes: data.notes?.trim() || null }),
    });
    return NextResponse.json((await response.json())[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("23505") || message.toLowerCase().includes("duplicate key")) return NextResponse.json({ error: "A bidder with this name already exists" }, { status: 409 });
    console.error("Bidder profile create error:", error);
    return NextResponse.json({ error: "Could not save bidder profile" }, { status: 500 });
  }
}
