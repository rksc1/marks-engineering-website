import { NextResponse } from "next/server";

import { sendQuoteAcknowledgement, sendQuoteAdminNotification } from "@/lib/email";
import { storeQuoteUpload } from "@/lib/files";
import { CLOUDINARY_FOLDERS } from "@/lib/upload-file";
import { quoteRequestSchema } from "@/lib/quote-schema";
import { createQuoteRequest } from "@/lib/quotes";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = quoteRequestSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const upload = formData.get("drawing");
    const storedFile = upload instanceof File && upload.size > 0 ? await storeQuoteUpload(upload, CLOUDINARY_FOLDERS.quotations) : null;
    const deadline = parsed.data.deadline ? new Date(parsed.data.deadline) : null;

    const quote = await createQuoteRequest({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      materialType: parsed.data.materialType,
      quantity: parsed.data.quantity || null,
      budgetRange: parsed.data.budgetRange || null,
      deadline,
      siteLocation: parsed.data.siteLocation || null,
      fileUrl: storedFile?.fileUrl || null,
      fileName: storedFile?.fileName || null,
      fileType: storedFile?.fileType || null,
      fileSize: storedFile?.fileSize || null
    });

    await Promise.all([
      sendQuoteAcknowledgement({
        to: quote.email,
        name: quote.name,
        quoteId: quote.quoteId,
        title: quote.title
      }),
      sendQuoteAdminNotification({
        quoteId: quote.quoteId,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        company: quote.company,
        title: quote.title,
        category: quote.category,
        description: quote.description
      })
    ]);

    return NextResponse.json({ ok: true, quoteId: quote.quoteId });
  } catch (error) {
    console.error("Quote submission failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Quote submission failed" }, { status: 500 });
  }
}
