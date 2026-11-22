import { NextResponse } from "next/server";
import { fetchPublicTenders } from "@/lib/public-tenders";

export async function GET() {
  try {
    return NextResponse.json(await fetchPublicTenders());
  } catch (error) {
    console.error("Public tender load error:", error);
    return NextResponse.json({ error: "Failed to load tenders" }, { status: 500 });
  }
}
