import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";
import { fromTenderRow } from "@/lib/tender-mapping";

export async function GET() {
  try {
    const response = await supabaseRequest("/rest/v1/tenders?select=*,attachments(attachment_type,file_url)&order=created_at.desc");
    return NextResponse.json((await response.json()).map(fromTenderRow));
  } catch (error) {
    console.error("Public tender load error:", error);
    return NextResponse.json({ error: "Failed to load tenders" }, { status: 500 });
  }
}
