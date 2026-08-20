import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const fields = ["internalId", "title", "organization", "tenderValue", "tenderNo", "portalId", "emdAmount", "publishDate", "dueDate"] as const;
const fromRow = (row: Record<string, unknown>) => ({ _id: row.id, internalId: row.internal_id, title: row.title, organization: row.organization, tenderValue: Number(row.tender_value), tenderNo: row.tender_no, portalId: row.portal_id, emdAmount: Number(row.emd_amount), publishDate: row.publish_date, dueDate: row.due_date, createdAt: row.created_at, tenderDocuments: ((row.attachments as Record<string, unknown>[] | undefined) || []).filter((file) => file.attachment_type === "document").map((file) => file.file_url), corrigendumFiles: ((row.attachments as Record<string, unknown>[] | undefined) || []).filter((file) => file.attachment_type === "corrigendum").map((file) => file.file_url) });
const toRow = (data: Record<string, unknown>) => ({ internal_id: data.internalId, title: data.title, organization: data.organization, tender_value: data.tenderValue, tender_no: data.tenderNo, portal_id: data.portalId, emd_amount: data.emdAmount, publish_date: data.publishDate, due_date: data.dueDate });

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest("/rest/v1/tenders?select=*,attachments(attachment_type,file_url)&order=created_at.desc");
    return NextResponse.json((await response.json()).map(fromRow));
  } catch (error) { console.error("Tender load error:", error); return NextResponse.json({ error: "Failed to load tenders" }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json();
    for (const field of fields) if (data[field] === undefined || data[field] === null || data[field] === "") return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/tenders", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(toRow(data)) });
    return NextResponse.json(fromRow((await response.json())[0]), { status: 201 });
  } catch (error) { console.error("Tender create error:", error); return NextResponse.json({ error: "Failed to create tender" }, { status: 500 }); }
}
