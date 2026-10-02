import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const technicalStatuses = ["pending", "qualified", "disqualified", "not_applicable"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { trackingId } = await params;
    const data = await request.json() as { bidderName?: string; technicalStatus?: string; quotedRate?: number | string | null; financialRank?: number | string | null; notes?: string };
    const bidderName = data.bidderName?.trim();
    if (!bidderName) return NextResponse.json({ error: "Bidder name is required" }, { status: 400 });
    const technicalStatus = data.technicalStatus || technicalStatuses[0];
    if (!technicalStatuses.includes(technicalStatus as typeof technicalStatuses[number])) return NextResponse.json({ error: "Invalid technical status" }, { status: 400 });
    const quotedRate = data.quotedRate === "" || data.quotedRate == null ? null : Number(data.quotedRate);
    const financialRank = data.financialRank === "" || data.financialRank == null ? null : Number(data.financialRank);
    if (quotedRate !== null && (!Number.isFinite(quotedRate) || quotedRate < 0)) return NextResponse.json({ error: "Quoted rate must be zero or greater" }, { status: 400 });
    if (financialRank !== null && (!Number.isInteger(financialRank) || financialRank < 1)) return NextResponse.json({ error: "Financial rank must be a positive whole number" }, { status: 400 });

    const response = await supabaseRequest("/rest/v1/tender_bidders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ tracking_id: trackingId, bidder_name: bidderName, technical_status: technicalStatus, quoted_rate: quotedRate, financial_rank: financialRank, notes: data.notes?.trim() || null }),
    });
    return NextResponse.json((await response.json())[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("23503")) return NextResponse.json({ error: "Tracking record not found" }, { status: 404 });
    console.error("Bidder create error:", error);
    return NextResponse.json({ error: "Failed to add bidder" }, { status: 500 });
  }
}
