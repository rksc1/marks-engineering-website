import { NextResponse } from "next/server";

import { ADMIN_COOKIE, getAdminSessionValue } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionValue = getAdminSessionValue();

  if (!expectedPassword || !sessionValue) {
    return NextResponse.json({ error: "Admin password is not configured" }, { status: 500 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
