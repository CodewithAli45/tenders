import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) return NextResponse.json({ error: "File URL is required" }, { status: 400 });

    const listResponse = await supabaseRequest(`/rest/v1/attachments?select=id,file_path&file_url=eq.${encodeURIComponent(url)}&limit=1`);
    const attachment = (await listResponse.json())[0];
    if (!attachment) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

    const path = attachment.file_path as string;
    try {
      await supabaseRequest(`/storage/v1/object/tender-attachments/${path.split("/").map(encodeURIComponent).join("/")}`, { method: "DELETE" });
    } catch (error) {
      console.warn("Storage object delete warning (may already be gone):", error);
    }

    await supabaseRequest(`/rest/v1/attachments?id=eq.${encodeURIComponent(attachment.id as string)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attachment delete error:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}