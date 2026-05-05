import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildQuotationPdf } from "@/lib/pdf";
import { getQuoteRequestById } from "@/lib/quotes";

type PdfRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: PdfRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuoteRequestById(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const latestAmount = quote.replies[0]?.amount ? Number(quote.replies[0].amount) : null;
  const buffer = await buildQuotationPdf(quote, latestAmount);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.quoteId}-quotation.pdf"`
    }
  });
}
