import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Mail, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { sendQuoteReplyAction, updateQuoteStatusAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { quoteStatusLabels, quoteStatusValues } from "@/lib/quote-schema";
import { getQuoteRequestById } from "@/lib/quotes";

type QuoteReplyRow = {
  id: string;
  subject: string;
  message: string;
  amount: unknown;
  timeline: string | null;
  attachmentUrl: string | null;
  sentAt: Date;
};

export const metadata: Metadata = {
  title: "Quote Details"
};

type QuotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailsPage({ params }: QuotePageProps) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) notFound();

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-primary">Back to dashboard</Link>
            <p className="mt-4 font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">{quote.title}</h1>
            <p className="mt-2 text-sm text-zinc-600">
              {quote.name} · {quote.email} {quote.company ? `· ${quote.company}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quote.fileUrl ? (
              <Button asChild variant="outline">
                <Link href={`/api/admin/quotes/${quote.id}/file`}>
                  <Download className="h-4 w-4" />
                  Drawing
                </Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href={`/api/admin/quotes/${quote.id}/quotation.pdf`}>
                <FileText className="h-4 w-4" />
                Generate PDF
              </Link>
            </Button>
          </div>
        </div>

        {quote.status === "REVISION_REQUESTED" ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Customer has requested changes for this quote. Review the message in the feedback panel and update the quotation accordingly.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <Panel title="Client details">
              <Detail label="Full name" value={quote.name} />
              <Detail label="Email" value={quote.email} />
              <Detail label="Phone" value={quote.phone || "-"} />
              <Detail label="Company" value={quote.company || "-"} />
              <Detail label="Site location" value={quote.siteLocation || "-"} />
            </Panel>

            <Panel title="Project details">
              <Detail label="Category" value={quote.category} />
              <Detail label="Material" value={quote.materialType} />
              <Detail label="Quantity" value={quote.quantity || "-"} />
              <Detail label="Budget range" value={quote.budgetRange || "-"} />
              <Detail label="Deadline" value={quote.deadline ? quote.deadline.toLocaleDateString("en-IN") : "-"} />
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-semibold text-zinc-500">Description</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{quote.description}</p>
              </div>
            </Panel>

            <Panel title="Status tracking">
              <form action={updateQuoteStatusAction} className="grid gap-4">
                <input type="hidden" name="quoteRequestId" value={quote.id} />
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={quote.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quoteStatusValues.map((item) => (
                        <SelectItem key={item} value={item}>
                          {quoteStatusLabels[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminNotes">Admin notes</Label>
                  <Textarea id="adminNotes" name="adminNotes" defaultValue={quote.adminNotes || ""} placeholder="Internal notes or customer-visible tracking notes" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" name="tags" defaultValue={quote.tags.join(", ")} placeholder="urgent, repeat client" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="followUpAt">Follow-up reminder</Label>
                    <Input id="followUpAt" name="followUpAt" type="date" defaultValue={quote.followUpAt ? quote.followUpAt.toISOString().slice(0, 10) : ""} />
                  </div>
                </div>
                <Button type="submit" className="w-fit">
                  <Save className="h-4 w-4" />
                  Save status
                </Button>
              </form>
            </Panel>
          </div>

          <div className="grid gap-6">
            <Panel title="Reply to client">
              <form action={sendQuoteReplyAction} className="grid gap-4">
                <input type="hidden" name="quoteRequestId" value={quote.id} />
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" required defaultValue={`Quotation for ${quote.title} (${quote.quoteId})`} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Quotation message</Label>
                  <Textarea id="message" name="message" required rows={7} placeholder="Scope, notes, inclusions, exclusions, and next steps" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Estimated price</Label>
                    <Input id="amount" name="amount" type="number" min="0" step="1" placeholder="Amount in INR" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input id="timeline" name="timeline" placeholder="Example: 12-15 working days" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attachment">Attach quotation PDF</Label>
                  <Input id="attachment" name="attachment" type="file" accept=".pdf" />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input name="sendGeneratedPdf" type="checkbox" className="h-4 w-4" />
                  Attach generated PDF quotation
                </label>
                <Button type="submit" className="w-fit">
                  <Mail className="h-4 w-4" />
                  Send email
                </Button>
              </form>
            </Panel>

            {quote.feedbackHistory && quote.feedbackHistory.length > 0 ? (
              <Panel title="Customer feedback">
                <div className="divide-y">
                  {quote.feedbackHistory.map((event, index) => (
                    <article key={index} className="py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-zinc-900">{event.sender === "customer" ? "Customer feedback" : "Admin note"}</p>
                        <span className="rounded-full bg-zinc-200 px-2 py-1 text-[11px] uppercase text-zinc-600">{event.sender}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">{event.message}</p>
                      <p className="mt-1 text-xs text-zinc-500">{event.createdAt.toLocaleString("en-IN")}</p>
                    </article>
                  ))}
                </div>
              </Panel>
            ) : null}

            <Panel title="Sent replies">
              <div className="divide-y">
                {quote.replies.length === 0 ? <p className="text-sm text-zinc-500">No replies sent yet.</p> : null}
                {(quote.replies as QuoteReplyRow[]).map((reply: QuoteReplyRow) => (
                  <article key={reply.id} className="py-4">
                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                      <h3 className="font-semibold text-zinc-950">{reply.subject}</h3>
                      <span className="text-xs text-zinc-500">{reply.sentAt.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{reply.message}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
                      {reply.amount ? <span>Amount: {formatCurrency(Number(reply.amount))}</span> : null}
                      {reply.timeline ? <span>Timeline: {reply.timeline}</span> : null}
                      {reply.attachmentUrl ? <Link className="font-semibold text-primary" href={reply.attachmentUrl}>Attachment</Link> : null}
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
