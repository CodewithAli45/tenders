import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

const technicalStatuses = ["pending", "qualified", "disqualified", "not_applicable"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ bidderId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { bidderId } = await params;
    const data = await request.json() as { bidderName?: string; technicalStatus?: string; quotedRate?: number | string | null; financialRank?: number | string | null; notes?: string | null };
    const fields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.bidderName !== undefined) {
      if (!data.bidderName.trim()) return NextResponse.json({ error: "Bidder name is required" }, { status: 400 });
      fields.bidder_name = data.bidderName.trim();
    }
    if (data.technicalStatus !== undefined) {
      if (!technicalStatuses.includes(data.technicalStatus as typeof technicalStatuses[number])) return NextResponse.json({ error: "Invalid technical status" }, { status: 400 });
      fields.technical_status = data.technicalStatus;
    }
    if (data.quotedRate !== undefined) {
      const value = data.quotedRate === "" || data.quotedRate === null ? null : Number(data.quotedRate);
      if (value !== null && (!Number.isFinite(value) || value < 0)) return NextResponse.json({ error: "Quoted rate must be zero or greater" }, { status: 400 });
      fields.quoted_rate = value;
    }
    if (data.financialRank !== undefined) {
      const value = data.financialRank === "" || data.financialRank === null ? null : Number(data.financialRank);
      if (value !== null && (!Number.isInteger(value) || value < 1)) return NextResponse.json({ error: "Financial rank must be a positive whole number" }, { status: 400 });
      fields.financial_rank = value;
    }
    if (data.notes !== undefined) fields.notes = data.notes?.trim() || null;
    if (Object.keys(fields).length === 1) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    const response = await supabaseRequest(`/rest/v1/tender_bidders?id=eq.${encodeURIComponent(bidderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(fields),
    });
    const rows = await response.json();
    if (!rows[0]) return NextResponse.json({ error: "Bidder not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Bidder update error:", error);
    return NextResponse.json({ error: "Failed to update bidder" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ bidderId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { bidderId } = await params;
    await supabaseRequest(`/rest/v1/tender_bidders?id=eq.${encodeURIComponent(bidderId)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bidder delete error:", error);
    return NextResponse.json({ error: "Failed to remove bidder" }, { status: 500 });
  }
}
