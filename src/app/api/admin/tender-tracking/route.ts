import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const stages = ["awaiting_bid_opening", "technical_evaluation", "financial_evaluation", "awarded", "cancelled", "on_hold"] as const;

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest(
      "/rest/v1/tender_tracking?select=*,tender:tenders!tender_tracking_tender_id_fkey(id,internal_id,title,organization,due_date,tender_value),bidders:tender_bidders(*)&order=updated_at.desc"
    );
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Tender tracking load error:", error);
    return NextResponse.json({ error: "Failed to load tender tracking records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const data = await request.json() as { tenderId?: string; stage?: string };
    if (!data.tenderId) return NextResponse.json({ error: "Tender ID is required" }, { status: 400 });
    const stage = data.stage || stages[0];
    if (!stages.includes(stage as typeof stages[number])) return NextResponse.json({ error: "Invalid tracking stage" }, { status: 400 });

    const response = await supabaseRequest("/rest/v1/tender_tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ tender_id: data.tenderId, stage }),
    });
    return NextResponse.json((await response.json())[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("23505") || message.toLowerCase().includes("duplicate key")) {
      return NextResponse.json({ error: "This tender is already in the tracker" }, { status: 409 });
    }
    if (message.includes("23503")) return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    console.error("Tender tracking create error:", error);
    return NextResponse.json({ error: "Failed to add tender to tracker" }, { status: 500 });
  }
}
