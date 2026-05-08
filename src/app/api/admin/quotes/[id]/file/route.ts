import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getQuoteRequestById } from "@/lib/quotes";

type FileRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: FileRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote?.fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (/^https?:\/\//i.test(quote.fileUrl)) {
    return NextResponse.redirect(quote.fileUrl);
  }

  return NextResponse.json({ error: "File is not stored in Cloudinary" }, { status: 410 });
}
