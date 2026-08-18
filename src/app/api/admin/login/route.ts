import { NextResponse } from "next/server";
import { adminSessionCookie, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (typeof password !== "string" || !password.trim()) {
      return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminSessionCookie(createAdminSession()));
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Admin login is not configured. Check the server environment." }, { status: 503 });
  }
}
