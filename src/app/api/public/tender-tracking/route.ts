import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Only publish tender, evaluation stage, and bidder result fields. Admin
    // tracking notes and bidder notes stay private.
    const response = await supabaseRequest(
      "/rest/v1/tender_tracking?select=id,stage,updated_at,tender:tenders!tender_tracking_tender_id_fkey(id,internal_id,title,organization,due_date,tender_no,tender_value),bidders:tender_bidders(id,bidder_name,technical_status,quoted_rate,financial_rank)&order=updated_at.desc"
    );
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public tender tracking load error:", error);
    return NextResponse.json({ error: "Failed to load tender status results" }, { status: 500 });
  }
}
