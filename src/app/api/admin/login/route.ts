import { NextResponse } from "next/server";

import { ADMIN_COOKIE, createAdminSessionValue, verifyPassword } from "@/lib/admin-auth";
import { findAdminUser } from "@/lib/quotes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  try {
    if (email && process.env.MONGODB_URI) {
      const admin = await findAdminUser(email);
      if (admin && !verifyPassword(password, admin.password)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      if (admin) {
        return sessionResponse(admin.email, admin.name);
      }
    }
  } catch (error) {
    console.error("Database admin login failed", error);
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || !verifyPassword(password, expectedPassword)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return sessionResponse(email || "admin@marks.local", "MARKS Admin");
}

function sessionResponse(email: string, name: string) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSessionValue({ email, name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
