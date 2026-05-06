import { NextResponse } from "next/server";

import { getCustomerSession } from "@/lib/customer-auth";

export async function GET(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ name: session.name, email: session.email });
}
