import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession, initializeAdminPassword, isAdminConfigured } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Use a password with at least 8 characters." }, { status: 400 });
    }
    if (await isAdminConfigured()) {
      return NextResponse.json({ error: "An admin password already exists. Please sign in." }, { status: 409 });
    }
    if (!(await initializeAdminPassword(password))) {
      return NextResponse.json({ error: "An admin password was just created. Please sign in." }, { status: 409 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminSessionCookie(createAdminSession()));
    return response;
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json({ error: "Could not create the admin password." }, { status: 503 });
  }
}
