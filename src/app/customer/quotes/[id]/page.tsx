import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, LogOut, Upload, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { approveQuoteAction, rejectQuoteAction, sendCustomerFeedbackAction, uploadPurchaseOrderAction } from "@/app/customer/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerSession } from "@/lib/customer-auth";
import { quoteStatusLabels } from "@/lib/quote-schema";
import { getQuoteRequestById } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "Quote Details"
};

type QuotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerQuoteDetailsPage({ params }: QuotePageProps) {
  const session = await getCustomerSession();
  if (!session) redirect("/customer/login");

  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) redirect("/customer");
  if (quote.email.toLowerCase() !== session.email.toLowerCase()) redirect("/customer");

  const timelineEvents = [
    ...(quote.feedbackHistory || []).map((event) => ({
      type: "message" as const,
      sender: event.sender,
      message: event.message,
      createdAt: event.createdAt
    })),
    ...quote.replies.map((reply) => ({
      type: "reply" as const,
      subject: reply.subject,
      message: reply.message,
      amount: reply.amount,
      timeline: reply.timeline,
      attachmentUrl: reply.attachmentUrl,
      createdAt: reply.sentAt
    }))
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Link href="/customer" className="text-sm font-semibold text-primary">Back to portal</Link>
            <p className="mt-4 font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">{quote.title}</h1>
            <p className="mt-2 text-sm text-zinc-600">{quote.category} · {quote.materialType}</p>
          </div>
          <form action="/api/customer/logout" method="post">
            <Button variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <Panel title="Quote overview">
              <Detail label="Status" value={quoteStatusLabels[quote.status] || quote.status} />
              <Detail label="Last updated" value={quote.updatedAt.toLocaleString("en-IN")} />
              <Detail label="Customer" value={quote.name} />
              <Detail label="Email" value={quote.email} />
              <Detail label="Phone" value={quote.phone || "-"} />
              {quote.approvedAt ? <Detail label="Approved at" value={quote.approvedAt.toLocaleString("en-IN")} /> : null}
              {quote.rejectedAt ? <Detail label="Rejected at" value={quote.rejectedAt.toLocaleString("en-IN")} /> : null}
              {quote.purchaseOrderUrl ? (
                <Detail label="Purchase order" value={quote.purchaseOrderNumber || "Uploaded"} />
              ) : null}
            </Panel>

            <Panel title="Request details">
              <Detail label="Project" value={quote.title} />
              <Detail label="Description" value={quote.description} />
              <Detail label="Site" value={quote.siteLocation || "-"} />
              <Detail label="Budget" value={quote.budgetRange || "-"} />
              <Detail label="Deadline" value={quote.deadline ? quote.deadline.toLocaleDateString("en-IN") : "-"} />
            </Panel>

            <Panel title="Actions" id="actions">
              <div className="grid gap-3">
                {(quote.status === "QUOTED" || quote.status === "QUOTED_UPDATED" || quote.status === "REVISION_REQUESTED") ? (
                  <form action={approveQuoteAction} className="grid gap-3">
                    <input type="hidden" name="quoteRequestId" value={quote.id} />
                    <Button type="submit" variant="secondary">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Quotation
                    </Button>
                  </form>
                ) : null}

                {(quote.status === "QUOTED" || quote.status === "QUOTED_UPDATED" || quote.status === "REVISION_REQUESTED") ? (
                  <form action={rejectQuoteAction} className="grid gap-3">
                    <input type="hidden" name="quoteRequestId" value={quote.id} />
                    <Label htmlFor="reason">Reason for rejection (optional)</Label>
                    <Textarea id="reason" name="reason" rows={4} placeholder="Tell us why you cannot approve this quote" />
                    <Button type="submit" variant="outline">
                      <XCircle className="h-4 w-4" />
                      Reject Quote
                    </Button>
                  </form>
                ) : null}

                {quote.status === "APPROVED" || quote.status === "PO_RECEIVED" ? (
                  <form action={uploadPurchaseOrderAction} className="grid gap-3">
                    <input type="hidden" name="quoteRequestId" value={quote.id} />
                    <div className="grid gap-2">
                      <Label htmlFor="purchaseOrderNumber">Purchase order number (optional)</Label>
                      <Input id="purchaseOrderNumber" name="purchaseOrderNumber" placeholder="PO12345" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purchaseOrderFile">Upload purchase order</Label>
                      <Input id="purchaseOrderFile" name="purchaseOrderFile" type="file" accept=".pdf,image/*" required />
                    </div>
                    <Button type="submit" variant="secondary">
                      <Upload className="h-4 w-4" />
                      Upload Purchase Order
                    </Button>
                  </form>
                ) : null}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6">
            <Panel title="Send feedback / request changes" id="feedback">
              <form action={sendCustomerFeedbackAction} className="grid gap-4">
                <input type="hidden" name="quoteRequestId" value={quote.id} />
                <div className="grid gap-2">
                  <Label htmlFor="message">Request Changes / Add Comments</Label>
                  <Textarea id="message" name="message" rows={6} required placeholder="Describe what needs to change or add notes for the team" />
                </div>
                <Button type="submit" className="w-fit">
                  <MessageSquare className="h-4 w-4" />
                  Send Feedback
                </Button>
              </form>
            </Panel>

            <Panel title="Conversation / Updates">
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-zinc-500">No conversation history yet.</p>
              ) : (
                <div className="space-y-4">
                  {timelineEvents.map((event, index) => (
                    <article key={index} className="rounded-lg border bg-zinc-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {event.type === "message" ? (event.sender === "customer" ? "Customer message" : "Admin message") : "Admin quotation reply"}
                          </p>
                          <p className="text-xs text-zinc-500">{event.createdAt.toLocaleString("en-IN")}</p>
                        </div>
                        {event.type === "message" ? (
                          <span className="rounded-full bg-zinc-200 px-2 py-1 text-[11px] uppercase text-zinc-600">{event.sender}</span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-700">{event.message}</p>
                      {event.type === "reply" && event.amount ? <p className="mt-2 text-sm text-zinc-600">Amount: ₹{event.amount}</p> : null}
                      {event.type === "reply" && event.timeline ? <p className="mt-1 text-sm text-zinc-600">Timeline: {event.timeline}</p> : null}
                      {event.type === "reply" && event.attachmentUrl ? (
                        <Link href={event.attachmentUrl} className="mt-2 inline-block text-sm font-semibold text-primary">View attachment</Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            {quote.purchaseOrderUrl ? (
              <Panel title="Uploaded purchase order">
                <p className="text-sm text-zinc-700">PO file is available below.</p>
                <Link href={quote.purchaseOrderUrl} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <FileText className="h-4 w-4" />
                  View Purchase Order
                </Link>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="rounded-lg border bg-white p-5">
      <h2 className="font-display text-xl font-bold text-zinc-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}
