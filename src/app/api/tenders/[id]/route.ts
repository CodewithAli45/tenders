import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const toRow = (data: Record<string, unknown>) => ({ internal_id: data.internalId, title: data.title, organization: data.organization, category: data.category, tender_value: data.tenderValue, tender_no: data.tenderNo, portal_id: data.portalId, emd_amount: data.emdAmount, emd_through: data.emdThrough, publish_date: data.publishDate, due_date: data.dueDate, tender_type: data.tenderType, form_of_contract: data.formOfContract, corrigendum: data.corrigendum, updated_at: new Date().toISOString() });
const fromRow = (row: Record<string, unknown>) => ({ _id: row.id, internalId: row.internal_id, title: row.title, organization: row.organization, category: row.category, tenderValue: Number(row.tender_value), tenderNo: row.tender_no, portalId: row.portal_id, emdAmount: Number(row.emd_amount), emdThrough: row.emd_through, publishDate: row.publish_date, dueDate: row.due_date, tenderType: row.tender_type, formOfContract: row.form_of_contract, corrigendum: row.corrigendum });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { id } = await params;
    const response = await supabaseRequest(`/rest/v1/tenders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(toRow(await request.json())) });
    const rows = await response.json();
    if (!rows[0]) return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    return NextResponse.json(fromRow(rows[0]));
  } catch (error) { console.error("Tender update error:", error); return NextResponse.json({ error: "Failed to update tender" }, { status: 500 }); }
}
