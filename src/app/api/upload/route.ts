import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest, supabaseUrl } from "@/lib/supabase-server";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tenderId = String(formData.get("tenderId") || "");
    const type = formData.get("type") === "corrigendum" ? "corrigendum" : "document";
    if (!file || !tenderId) return NextResponse.json({ error: "File and tender ID are required" }, { status: 400 });
    const tenderResponse = await supabaseRequest(`/rest/v1/tenders?select=id&internal_id=eq.${encodeURIComponent(tenderId)}&limit=1`);
    const tender = (await tenderResponse.json())[0];
    if (!tender) return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${tender.id}/${Date.now()}-${safeName}`;
    await supabaseRequest(`/storage/v1/object/tender-attachments/${path}`, { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }, body: Buffer.from(await file.arrayBuffer()) });
    const url = `${supabaseUrl()}/storage/v1/object/public/tender-attachments/${path}`;
    await supabaseRequest("/rest/v1/attachments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tender_id: tender.id, file_name: file.name, file_path: path, file_url: url, attachment_type: type }) });
    return NextResponse.json({ url });
  } catch (error) { console.error("Attachment upload error:", error); return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 }); }
}
