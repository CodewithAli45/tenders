import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const fromRow = (row: Record<string, unknown>) => ({ _id: row.id, name: row.name, details: row.details, contactPerson: row.contact_person, email: row.email, phone: row.phone, address: row.address, createdAt: row.created_at });

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest("/rest/v1/organizations?select=*&order=created_at.desc");
    return NextResponse.json((await response.json()).map(fromRow));
  } catch (error) { console.error("Organization load error:", error); return NextResponse.json({ error: "Failed to load organizations" }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json();
    if (!data.name?.trim() || !data.details?.trim()) return NextResponse.json({ error: "Organization name and details are required" }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/organizations", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ name: data.name, details: data.details, contact_person: data.contactPerson || null, email: data.email || null, phone: data.phone || null, address: data.address || null }) });
    return NextResponse.json(fromRow((await response.json())[0]), { status: 201 });
  } catch (error) { console.error("Organization create error:", error); return NextResponse.json({ error: "Failed to create organization" }, { status: 500 }); }
}
