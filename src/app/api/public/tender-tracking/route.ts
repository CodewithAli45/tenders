import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

function todayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function GET() {
  try {
    const response = await supabaseRequest(
      `/rest/v1/tenders?select=id,internal_id,title,organization,due_date,tender_no,tender_value,tracking:tender_tracking(id,stage,updated_at,technical_bid_mode,bidders:tender_bidders(id,bidder_name,technical_status,quoted_rate,financial_rank,profile:bidder_profiles(id,name,contact_person,email,phone,address,notes)))&due_date=lt.${todayISO()}&order=due_date.desc`
    );
    const tenders = await response.json();
    return NextResponse.json(tenders.map((tender: Record<string, unknown>) => {
      const tracking = Array.isArray(tender.tracking) ? tender.tracking[0] : null;
      return {
        id: (tracking as Record<string, unknown> | null)?.id ?? tender.id,
        stage: (tracking as Record<string, unknown> | null)?.stage ?? "not_added",
        updated_at: (tracking as Record<string, unknown> | null)?.updated_at ?? null,
        technical_bid_mode: (tracking as Record<string, unknown> | null)?.technical_bid_mode ?? "summary",
        tender: {
          id: tender.id,
          internal_id: tender.internal_id,
          title: tender.title,
          organization: tender.organization,
          due_date: tender.due_date,
          tender_no: tender.tender_no,
          tender_value: tender.tender_value,
        },
        bidders: (tracking as { bidders?: unknown[] } | null)?.bidders ?? [],
      };
    }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public tender tracking load error:", error);
    return NextResponse.json({ error: "Failed to load tender status results" }, { status: 500 });
  }
}
