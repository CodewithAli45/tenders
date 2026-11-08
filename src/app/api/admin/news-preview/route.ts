import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const platformContext = `
GovTender Pro is a tender intelligence and management website for government and PSU construction and infrastructure tenders.
Verified current capabilities:
- Public tender dashboard with search, organization and status filters, sorting, pagination, and read-only tender details.
- Admin management of tender and organization records, with tender PDF attachments.
- Post-bid tender tracking with bidder results, quoted rates, ranks, and notes.
- Optional Google Sheets synchronization for a controlled tender register.
- Browser-based tender document tools for merging, splitting, arranging, and compressing PDFs.
- Tender support services include bid preparation, registration, clarification submission, and price variation.
Do not claim recent releases, uptime, security changes, integrations, or capabilities not listed here. Describe existing capabilities as platform highlights, not as newly launched changes.
`;

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      category: { type: "string" },
      date: { type: "string" },
      tag: { type: "string", enum: ["Feature", "Update", "Announcement"] },
    },
    required: ["title", "summary", "category", "date", "tag"],
  },
};

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "News preview is not configured. Add GEMINI_API_KEY to the server environment and restart the app." }, { status: 503 });
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        model: "gemini-3.8-flash",
        input: `You are the official GovTender Pro platform news curator. Based ONLY on the verified context below, generate exactly 3 concise platform news highlights. Do not invent external news, dates of releases, or unlisted product changes. These are draft content previews, so frame existing capabilities as highlights. Use today's date (${new Date().toISOString().slice(0, 10)}) for each item.\n\nPLATFORM CONTEXT:\n${platformContext}`,
        generation_config: { thinking_level: "low", max_output_tokens: 1200 },
        response_format: { type: "text", mime_type: "application/json", schema },
        store: false,
      }),
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
    const result = await response.json() as {
      status?: string;
      steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
      error?: { message?: string };
    };
    if (!response.ok) {
      console.error("Gemini news preview request failed:", result.error?.message ?? response.statusText);
      return NextResponse.json({ error: "Gemini could not generate the preview. Check the API key and try again." }, { status: 502 });
    }
    const text = result.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content ?? [])
      .find((part) => part.type === "text")?.text;
    if (!text) {
      console.error("Gemini news preview returned no text output. Status:", result.status ?? "unknown");
      return NextResponse.json({ error: "Gemini returned no text. Try generating the preview again." }, { status: 502 });
    }
    const generated = JSON.parse(text) as Omit<PlatformNewsItem, "id">[];
    if (!Array.isArray(generated) || generated.length !== 3 || generated.some((item) =>
      typeof item.title !== "string" || typeof item.summary !== "string" || typeof item.category !== "string" ||
      typeof item.date !== "string" || !["Feature", "Update", "Announcement"].includes(item.tag)
    )) throw new Error("Gemini returned news in an unexpected format.");
    const items: PlatformNewsItem[] = generated.map((item, index) => ({ ...item, id: `preview-${index + 1}` }));
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Gemini took too long to respond. Please try again." }, { status: 504 });
    }
    console.error("News preview generation error:", error);
    return NextResponse.json({ error: "Could not generate a valid news preview. Please try again." }, { status: 502 });
  }
}

interface PlatformNewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  tag: "Feature" | "Update" | "Announcement";
}
