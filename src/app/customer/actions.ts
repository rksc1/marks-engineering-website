"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@/lib/customer-auth";
import { getQuoteRequestById, addQuoteMessage, updateQuoteRequest } from "@/lib/quotes";
import { storePurchaseOrderUpload } from "@/lib/files";
import {
  sendCustomerFeedbackNotification,
  sendCustomerApprovalNotification,
  sendPurchaseOrderNotification
} from "@/lib/email";
import {
  quoteCustomerFeedbackSchema,
  quoteCustomerDecisionSchema,
  quoteCustomerRejectSchema
} from "@/lib/quote-schema";

async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session) redirect("/customer/login");
  return session;
}

export async function sendCustomerFeedbackAction(formData: FormData) {
  const session = await requireCustomer();
  const parsed = quoteCustomerFeedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid feedback submission");

  const quote = await getQuoteRequestById(parsed.data.quoteRequestId);
  if (!quote) throw new Error("Quote not found");
  if (quote.email.toLowerCase() !== session.email.toLowerCase()) throw new Error("Unauthorized");

  await addQuoteMessage(quote.id, "customer", parsed.data.message);
  const revisionStatus = ["QUOTED", "QUOTED_UPDATED", "REVIEWED", "NEW", "REVISION_REQUESTED"].includes(quote.status)
    ? "REVISION_REQUESTED"
    : quote.status;
  await updateQuoteRequest(quote.id, {
    customerFeedback: parsed.data.message,
    status: revisionStatus
  });

  await sendCustomerFeedbackNotification({
    quoteId: quote.quoteId,
    name: session.name,
    email: session.email,
    message: parsed.data.message
  });

  revalidatePath(`/customer/quotes/${quote.id}`);
  redirect(`/customer/quotes/${quote.id}`);
}

export async function approveQuoteAction(formData: FormData) {
  const session = await requireCustomer();
  const parsed = quoteCustomerDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid approval request");

  const quote = await getQuoteRequestById(parsed.data.quoteRequestId);
  if (!quote) throw new Error("Quote not found");
  if (quote.email.toLowerCase() !== session.email.toLowerCase()) throw new Error("Unauthorized");

  await addQuoteMessage(quote.id, "customer", "Quotation approved by customer.");
  await updateQuoteRequest(quote.id, { status: "APPROVED", approvedAt: new Date() });

  await sendCustomerApprovalNotification({
    quoteId: quote.quoteId,
    name: session.name,
    email: session.email
  });

  revalidatePath(`/customer/quotes/${quote.id}`);
  redirect(`/customer/quotes/${quote.id}`);
}

export async function rejectQuoteAction(formData: FormData) {
  const session = await requireCustomer();
  const parsed = quoteCustomerRejectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid rejection request");

  const quote = await getQuoteRequestById(parsed.data.quoteRequestId);
  if (!quote) throw new Error("Quote not found");
  if (quote.email.toLowerCase() !== session.email.toLowerCase()) throw new Error("Unauthorized");

  const rejectionMessage = parsed.data.reason
    ? `Quotation rejected by customer. Reason: ${parsed.data.reason}`
    : "Quotation rejected by customer.";

  await addQuoteMessage(quote.id, "customer", rejectionMessage);
  await updateQuoteRequest(quote.id, { status: "REJECTED", rejectedAt: new Date() });

  revalidatePath(`/customer/quotes/${quote.id}`);
  redirect(`/customer/quotes/${quote.id}`);
}

export async function uploadPurchaseOrderAction(formData: FormData) {
  const session = await requireCustomer();
  const quoteRequestId = String(formData.get("quoteRequestId") || "").trim();
  const purchaseOrderNumber = String(formData.get("purchaseOrderNumber") || "").trim();
  const file = formData.get("purchaseOrderFile");

  if (!quoteRequestId || !(file instanceof File) || file.size === 0) {
    throw new Error("Missing purchase order file");
  }

  const quote = await getQuoteRequestById(quoteRequestId);
  if (!quote) throw new Error("Quote not found");
  if (quote.email.toLowerCase() !== session.email.toLowerCase()) throw new Error("Unauthorized");

  const storedFile = await storePurchaseOrderUpload(file);
  await addQuoteMessage(quote.id, "customer", `Purchase order uploaded${purchaseOrderNumber ? ` (PO #${purchaseOrderNumber})` : ""}`);
  await updateQuoteRequest(quote.id, {
    status: "PO_RECEIVED",
    purchaseOrderUrl: storedFile.fileUrl,
    purchaseOrderPublicId: storedFile.publicId,
    purchaseOrderNumber: purchaseOrderNumber || null
  });

  await sendPurchaseOrderNotification({
    quoteId: quote.quoteId,
    name: session.name,
    email: session.email,
    purchaseOrderNumber: purchaseOrderNumber || "",
    fileUrl: storedFile.fileUrl
  });

  revalidatePath(`/customer/quotes/${quote.id}`);
  redirect(`/customer/quotes/${quote.id}`);
}
