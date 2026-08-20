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
    if (!data.name?.trim()) return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/organizations", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ name: data.name, details: data.details || null, contact_person: data.contactPerson || null, email: data.email || null, phone: data.phone || null, address: data.address || null }) });
    return NextResponse.json(fromRow((await response.json())[0]), { status: 201 });
  } catch (error) { console.error("Organization create error:", error); return NextResponse.json({ error: "Failed to create organization" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json();
    if (!data._id) return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    const fields: Record<string, unknown> = {};
    if (data.name !== undefined) fields.name = data.name;
    if (data.details !== undefined) fields.details = data.details || null;
    if (data.contactPerson !== undefined) fields.contact_person = data.contactPerson || null;
    if (data.email !== undefined) fields.email = data.email || null;
    if (data.phone !== undefined) fields.phone = data.phone || null;
    if (data.address !== undefined) fields.address = data.address || null;
    if (Object.keys(fields).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    fields.updated_at = new Date().toISOString();
    const response = await supabaseRequest(`/rest/v1/organizations?id=eq.${data._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(fields) });
    const rows = await response.json();
    return NextResponse.json(fromRow(rows[0]));
  } catch (error) { console.error("Organization update error:", error); return NextResponse.json({ error: "Failed to update organization" }, { status: 500 }); }
}
