import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/admin-auth";

export async function GET() {
  try {
    return NextResponse.json({ setupRequired: !(await isAdminConfigured()) });
  } catch (error) {
    console.error("Admin status error:", error);
    const message = error instanceof Error ? error.message : "Admin login is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
