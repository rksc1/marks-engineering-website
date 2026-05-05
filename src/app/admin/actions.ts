"use server";

import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendQuoteReplyEmail } from "@/lib/email";
import { storeQuoteUpload } from "@/lib/files";
import { buildQuotationPdf } from "@/lib/pdf";
import { quoteReplySchema, quoteStatusSchema } from "@/lib/quote-schema";
import { addQuoteReply, getQuoteRequestById, updateQuoteRequest } from "@/lib/quotes";

export async function updateQuoteStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = quoteStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid status update");

  await updateQuoteRequest(parsed.data.quoteRequestId, {
    status: parsed.data.status,
    adminNotes: parsed.data.adminNotes || null,
    tags: parsed.data.tags
      ? parsed.data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    followUpAt: parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/quotes/${parsed.data.quoteRequestId}`);
}

export async function sendQuoteReplyAction(formData: FormData) {
  await requireAdmin();
  const parsed = quoteReplySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid quotation reply");

  const quote = await getQuoteRequestById(parsed.data.quoteRequestId);
  if (!quote) throw new Error("Quote request not found");

  const attachment = formData.get("attachment");
  const storedAttachment = attachment instanceof File && attachment.size > 0 ? await storeQuoteUpload(attachment, "quotations") : null;
  const sendGeneratedPdf = formData.get("sendGeneratedPdf") === "on";
  const generatedPdf = sendGeneratedPdf ? await buildQuotationPdf(quote, parsed.data.amount) : null;

  await sendQuoteReplyEmail({
    to: quote.email,
    name: quote.name,
    quoteId: quote.quoteId,
    subject: parsed.data.subject,
    message: parsed.data.message,
    amount: parsed.data.amount,
    timeline: parsed.data.timeline,
    attachmentPath: storedAttachment ? path.join(process.cwd(), "public", storedAttachment.fileUrl.replace(/^\//, "")) : null,
    attachment: generatedPdf
      ? {
          filename: `${quote.quoteId}-quotation.pdf`,
          content: generatedPdf,
          contentType: "application/pdf"
        }
      : null
  });

  await addQuoteReply(quote.id, {
    subject: parsed.data.subject,
    message: parsed.data.message,
    amount: parsed.data.amount,
    timeline: parsed.data.timeline || null,
    attachmentUrl: storedAttachment?.fileUrl || (sendGeneratedPdf ? `/api/admin/quotes/${quote.id}/quotation.pdf` : null)
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/quotes/${quote.id}`);
  redirect(`/admin/quotes/${quote.id}`);
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
