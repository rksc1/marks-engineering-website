import { NextResponse } from "next/server";

import { CUSTOMER_COOKIE } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/customer/login", request.url));
  response.cookies.delete(CUSTOMER_COOKIE);
  return response;
}
