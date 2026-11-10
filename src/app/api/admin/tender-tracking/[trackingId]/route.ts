import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const stages = ["awaiting_bid_opening", "technical_evaluation", "financial_evaluation", "awarded", "cancelled", "on_hold"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { trackingId } = await params;
    const data = await request.json() as { stage?: string; technicalBidMode?: string; notes?: string | null };
    const fields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.stage !== undefined) {
      if (!stages.includes(data.stage as typeof stages[number])) return NextResponse.json({ error: "Invalid tracking stage" }, { status: 400 });
      fields.stage = data.stage;
    }
    if (data.notes !== undefined) fields.notes = data.notes?.trim() || null;
    if (data.technicalBidMode !== undefined) {
      if (!["summary", "detailed"].includes(data.technicalBidMode)) return NextResponse.json({ error: "Invalid technical bid display mode" }, { status: 400 });
      fields.technical_bid_mode = data.technicalBidMode;
    }
    if (Object.keys(fields).length === 1) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    const response = await supabaseRequest(`/rest/v1/tender_tracking?id=eq.${encodeURIComponent(trackingId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(fields),
    });
    const rows = await response.json();
    if (!rows[0]) return NextResponse.json({ error: "Tracking record not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Tender tracking update error:", error);
    const rawMessage = error instanceof Error ? error.message : "";
    try {
      const details = JSON.parse(rawMessage) as { message?: string; details?: string };
      return NextResponse.json({ error: details.message || details.details || "Failed to update tracking record" }, { status: 500 });
    } catch {
      return NextResponse.json({ error: rawMessage || "Failed to update tracking record" }, { status: 500 });
    }
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { trackingId } = await params;
    await supabaseRequest(`/rest/v1/tender_tracking?id=eq.${encodeURIComponent(trackingId)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tender tracking delete error:", error);
    return NextResponse.json({ error: "Failed to remove tender from tracker" }, { status: 500 });
  }
}
