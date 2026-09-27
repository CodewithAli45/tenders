import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";
import { fromTenderRow } from "@/lib/tender-mapping";

const fields = ["internalId", "title", "organization", "tenderValue", "tenderNo", "portalId", "emdAmount", "publishDate", "dueDate"] as const;
const toRow = (data: Record<string, unknown>) => ({ internal_id: data.internalId, title: data.title, organization: data.organization, tender_value: data.tenderValue, tender_no: data.tenderNo, portal_id: data.portalId, emd_amount: data.emdAmount, publish_date: data.publishDate, due_date: data.dueDate, scope_of_work: data.scopeOfWork || null, location: data.location || null, contact_person: data.contactPerson || null, contact_phone: data.contactPhone || null, contact_email: data.contactEmail || null, payment_terms: data.paymentTerms || null, officer_designation: data.officerDesignation || null, eligibility_financial: data.eligibilityFinancial || null, eligibility_technical: data.eligibilityTechnical || null, eligibility_jv: data.eligibilityJV || null, technical_analysis: data.technicalAnalysis || null, boq_summary: data.boqSummary || null });

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest("/rest/v1/tenders?select=*,attachments(attachment_type,file_url)&order=created_at.desc");
    return NextResponse.json((await response.json()).map(fromTenderRow));
  } catch (error) { console.error("Tender load error:", error); return NextResponse.json({ error: "Failed to load tenders" }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json();
    for (const field of fields) if (data[field] === undefined || data[field] === null || data[field] === "") return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/tenders", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(toRow(data)) });
    return NextResponse.json(fromTenderRow((await response.json())[0]), { status: 201 });
  } catch (error) { console.error("Tender create error:", error); return NextResponse.json({ error: "Failed to create tender" }, { status: 500 }); }
}
