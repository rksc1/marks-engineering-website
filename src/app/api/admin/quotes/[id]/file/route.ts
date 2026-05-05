import { readFile } from "node:fs/promises";
import path from "node:path";

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

  const relativePath = quote.fileUrl.replace(/^\//, "");
  if (!relativePath.startsWith("uploads/quotes/")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", relativePath);
  const file = await readFile(filePath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": quote.fileType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(quote.fileName || "drawing")}"`
    }
  });
}
