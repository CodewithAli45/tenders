import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

export async function GET(_request: Request, { params }: { params: Promise<{ bidderId: string }> }) {
  try {
    const { bidderId } = await params;
    const response = await supabaseRequest(`/rest/v1/bidder_profiles?id=eq.${encodeURIComponent(bidderId)}&select=id,name,contact_person,email,phone,address,notes`);
    const profile = (await response.json())[0];
    if (!profile) return NextResponse.json({ error: "Bidder not found" }, { status: 404 });
    return NextResponse.json(profile, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error("Public bidder profile load error:", error);
    return NextResponse.json({ error: "Could not load bidder profile" }, { status: 500 });
  }
}
