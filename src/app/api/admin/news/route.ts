import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

type NewsInput = {
  id?: unknown;
  title?: unknown;
  summary?: unknown;
  content?: unknown;
  category?: unknown;
  published?: unknown;
};

type ParsedNews =
  | { value: { title: string; summary: string; content: string; category: string; published: boolean; published_at: string | null; updated_at: string }; error?: never }
  | { value?: never; error: string };

function parseNews(input: NewsInput): ParsedNews {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const summary = typeof input.summary === "string" ? input.summary.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  if (title.length < 3 || title.length > 160) return { value: undefined, error: "Title must be between 3 and 160 characters." };
  if (summary.length < 10 || summary.length > 300) return { value: undefined, error: "Summary must be between 10 and 300 characters." };
  if (content.length < 20 || content.length > 20000) return { value: undefined, error: "Details must be between 20 and 20,000 characters." };
  if (category.length < 2 || category.length > 50) return { value: undefined, error: "Category must be between 2 and 50 characters." };
  if (typeof input.published !== "boolean") return { value: undefined, error: "Choose whether to save this news as a draft or publish it." };
  return {
    value: {
      title,
      summary,
      content,
      category,
      published: input.published,
      published_at: input.published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const response = await supabaseRequest("/rest/v1/platform_news?select=*&order=created_at.desc");
    const rows = await response.json() as Record<string, unknown>[];
    return NextResponse.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: row.content,
      category: row.category,
      published: row.published,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (error) {
    console.error("Admin news load error:", error);
    return NextResponse.json({ error: "Failed to load news. Run the platform news migration in Supabase." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const parsed = parseNews(await request.json() as NewsInput);
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const response = await supabaseRequest("/rest/v1/platform_news", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(parsed.value),
    });
    return NextResponse.json((await response.json())[0], { status: 201 });
  } catch (error) {
    console.error("Admin news create error:", error);
    return NextResponse.json({ error: "Could not save news. Check that the platform news migration has been run." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const input = await request.json() as NewsInput;
    const parsed = parseNews(input);
    const id = typeof input.id === "string" ? input.id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "A valid news record ID is required." }, { status: 400 });
    }
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const existingResponse = await supabaseRequest(
      `/rest/v1/platform_news?select=id,published,published_at&id=eq.${encodeURIComponent(id)}`,
    );
    const existingRows = await existingResponse.json() as { published: boolean; published_at: string | null }[];
    const existing = existingRows[0];
    if (!existing) return NextResponse.json({ error: "News item not found." }, { status: 404 });
    const publishedAt = parsed.value.published
      ? existing.published && existing.published_at
        ? existing.published_at
        : new Date().toISOString()
      : null;
    const response = await supabaseRequest(`/rest/v1/platform_news?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ ...parsed.value, published_at: publishedAt }),
    });
    const rows = await response.json();
    if (!rows.length) return NextResponse.json({ error: "News item not found." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Admin news update error:", error);
    return NextResponse.json({ error: "Could not update news. Check that the platform news migration has been run." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  try {
    const { id } = await request.json() as { id?: unknown };
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "A valid news record ID is required." }, { status: 400 });
    }
    await supabaseRequest(`/rest/v1/platform_news?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin news delete error:", error);
    return NextResponse.json({ error: "Could not delete news." }, { status: 500 });
  }
}
