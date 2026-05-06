import { NextResponse } from "next/server";

import { createCustomerSessionValue, CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { upsertCustomer } from "@/lib/quotes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !email || !phone || !password || !confirmPassword) {
    console.warn("Customer signup missing fields", {
      name: Boolean(name),
      email: Boolean(email),
      phone: Boolean(phone),
      password: Boolean(password),
      confirmPassword: Boolean(confirmPassword)
    });
    return NextResponse.redirect(new URL("/customer/signup?error=missing", request.url));
  }

  if (password !== confirmPassword) {
    console.warn("Customer signup password mismatch", { email, phone });
    return NextResponse.redirect(new URL("/customer/signup?error=nomatch", request.url));
  }

  try {
    const customer = await upsertCustomer({ name, email, phone, password });
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(CUSTOMER_COOKIE, createCustomerSessionValue(customer), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    console.error("Customer signup failed", error);
    return NextResponse.redirect(new URL("/customer/signup?error=server", request.url));
  }
}
