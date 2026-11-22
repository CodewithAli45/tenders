import "server-only";
import { cache } from "react";
import { fromTenderRow } from "@/lib/tender-mapping";
import { supabaseRequest } from "@/lib/supabase-server";

export async function fetchPublicTenders() {
  const response = await supabaseRequest(
    "/rest/v1/tenders?select=*,attachments(attachment_type,file_url)&order=created_at.desc",
  );
  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(fromTenderRow) : [];
}

export const getPublicTenders = cache(fetchPublicTenders);

async function fetchPublicTenderById(id: string) {
  const response = await supabaseRequest(
    `/rest/v1/tenders?id=eq.${encodeURIComponent(id)}&select=*,attachments(attachment_type,file_url)`,
  );
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? fromTenderRow(rows[0]) : null;
}

export const getPublicTenderById = cache(fetchPublicTenderById);
