import { NextResponse } from "next/server";

import { createCustomerSessionValue, CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { findCustomerByEmailAndPassword } from "@/lib/quotes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    console.warn("Customer login missing fields", { email: Boolean(email), password: Boolean(password) });
    return NextResponse.redirect(new URL("/customer/login?error=missing", request.url));
  }

  try {
    const customer = await findCustomerByEmailAndPassword(email, password);
    if (!customer) {
      return NextResponse.redirect(new URL("/customer/login?error=invalid", request.url));
    }

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
    console.error("Customer login failed", error);
    return NextResponse.redirect(new URL("/customer/login?error=server", request.url));
  }
}
