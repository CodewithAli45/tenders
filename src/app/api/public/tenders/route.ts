import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

const fromRow = (row: Record<string, unknown>) => ({
  _id: row.id,
  internalId: row.internal_id,
  title: row.title,
  organization: row.organization,
  tenderValue: Number(row.tender_value),
  tenderNo: row.tender_no,
  portalId: row.portal_id,
  emdAmount: Number(row.emd_amount),
  publishDate: row.publish_date,
  dueDate: row.due_date,
  createdAt: row.created_at,
  scopeOfWork: row.scope_of_work || "",
  location: row.location || "",
  contactPerson: row.contact_person || "",
  contactPhone: row.contact_phone || "",
  contactEmail: row.contact_email || "",
  tenderDocuments: ((row.attachments as Record<string, unknown>[] | undefined) || []).filter((file) => file.attachment_type === "document").map((file) => file.file_url),
  corrigendumFiles: ((row.attachments as Record<string, unknown>[] | undefined) || []).filter((file) => file.attachment_type === "corrigendum").map((file) => file.file_url),
});

export async function GET() {
  try {
    const response = await supabaseRequest("/rest/v1/tenders?select=*,attachments(attachment_type,file_url)&order=created_at.desc");
    return NextResponse.json((await response.json()).map(fromRow));
  } catch (error) {
    console.error("Public tender load error:", error);
    return NextResponse.json({ error: "Failed to load tenders" }, { status: 500 });
  }
}
