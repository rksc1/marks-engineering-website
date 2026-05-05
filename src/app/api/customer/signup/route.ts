import { NextResponse } from "next/server";

import { createCustomerSessionValue, CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { upsertCustomer } from "@/lib/quotes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !phone) {
    return NextResponse.redirect(new URL("/customer/signup?error=missing", request.url));
  }

  try {
    const customer = await upsertCustomer({ name, email, phone });
    const response = NextResponse.redirect(new URL("/customer", request.url));
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
