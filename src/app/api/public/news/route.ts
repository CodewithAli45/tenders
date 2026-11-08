import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await supabaseRequest(
      "/rest/v1/platform_news?select=id,title,summary,content,category,published_at&published=eq.true&order=published_at.desc&limit=20",
    );
    const rows = await response.json() as Record<string, unknown>[];
    return NextResponse.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: row.content,
      category: row.category,
      publishedAt: row.published_at,
    })));
  } catch (error) {
    console.error("Public news load error:", error);
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}
