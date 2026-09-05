import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const toRow = (data: Record<string, unknown>) => ({ title: data.title, organization: data.organization, tender_value: data.tenderValue, tender_no: data.tenderNo, portal_id: data.portalId, emd_amount: data.emdAmount, publish_date: data.publishDate, due_date: data.dueDate, scope_of_work: data.scopeOfWork || null, location: data.location || null, contact_person: data.contactPerson || null, contact_phone: data.contactPhone || null, contact_email: data.contactEmail || null, updated_at: new Date().toISOString() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { id } = await params;
    const response = await supabaseRequest(`/rest/v1/tenders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(toRow(await request.json())) });
    const rows = await response.json();
    if (!rows[0]) return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) { console.error("Tender update error:", error); return NextResponse.json({ error: "Failed to update tender" }, { status: 500 }); }
}
