import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-auth";
import { quoteStatusLabels } from "@/lib/quote-schema";
import { getCustomerQuotes, type QuoteStatus } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "Customer Portal"
};

const progressSteps: Array<{ status: QuoteStatus; label: string }> = [
  { status: "NEW", label: "Request received" },
  { status: "REVIEWED", label: "Under review" },
  { status: "QUOTED", label: "Quotation sent" },
  { status: "APPROVED", label: "Approved" },
  { status: "IN_PRODUCTION", label: "Work started" },
  { status: "COMPLETED", label: "Completed" }
];

export default async function CustomerPortalPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/customer/login");

  let quotes: Awaited<ReturnType<typeof getCustomerQuotes>> = [];
  let dbError = "";

  try {
    quotes = await getCustomerQuotes(session);
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Unable to load quotes";
  }

  const activeJobs = quotes.filter((quote) => ["APPROVED", "IN_PRODUCTION"].includes(quote.status));

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Customer portal</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Welcome, {session.name}</h1>
            <p className="mt-2 text-sm text-zinc-600">Track quote status and fabrication progress for approved work.</p>
          </div>
          <form action="/api/customer/logout" method="post">
            <Button variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        {dbError ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
            Could not connect to MongoDB: {dbError}.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Metric label="Total quotes" value={quotes.length} />
          <Metric label="Active jobs" value={activeJobs.length} />
          <Metric label="Completed" value={quotes.filter((quote) => quote.status === "COMPLETED").length} />
        </div>

        <div className="mt-8 grid gap-6">
          {quotes.length === 0 && !dbError ? (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-zinc-950">No quotes linked yet</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Submit a quote using the same email or mobile number and it will appear here.</p>
              <Button asChild className="mt-5">
                <Link href="/get-quote">Get Quote</Link>
              </Button>
            </div>
          ) : null}

          {quotes.map((quote) => (
            <article key={quote.id} className="rounded-lg border bg-white p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <p className="font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-zinc-950">{quote.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{quote.category} - {quote.materialType}</p>
                </div>
                <span className="h-fit rounded bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{quoteStatusLabels[quote.status]}</span>
              </div>

              <div className="mt-6">
                <Progress status={quote.status} />
              </div>

              <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
                <Info icon={<Clock className="h-4 w-4" />} label="Last update" value={quote.updatedAt.toLocaleString("en-IN")} />
                <Info icon={<FileText className="h-4 w-4" />} label="Replies" value={`${quote.replies.length}`} />
                <Info label="Site" value={quote.siteLocation || "-"} />
              </div>

              {quote.status === "APPROVED" ? (
                <p className="mt-5 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">Your quote is approved. MARKS Engineering will move this into production once work starts.</p>
              ) : null}
              {quote.status === "IN_PRODUCTION" ? (
                <p className="mt-5 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Work has started. Progress updates will appear here as the admin updates the job status.</p>
              ) : null}
              {quote.status === "QUOTED" || quote.status === "QUOTED_UPDATED" || quote.status === "REVISION_REQUESTED" ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Link href={`/customer/quotes/${quote.id}#feedback`} className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                    Request Changes
                  </Link>
                  <Link href={`/customer/quotes/${quote.id}#actions`} className="rounded-md border border-primary bg-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary/20">
                    Approve
                  </Link>
                  <Link href={`/customer/quotes/${quote.id}#actions`} className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 hover:bg-red-100">
                    Reject
                  </Link>
                </div>
              ) : null}
              {quote.status === "APPROVED" || quote.status === "PO_RECEIVED" ? (
                <div className="mt-5">
                  <Link href={`/customer/quotes/${quote.id}`} className="inline-flex items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20">
                    Upload Purchase Order
                  </Link>
                </div>
              ) : null}
              {quote.adminNotes ? (
                <div className="mt-5 rounded border bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Team notes</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{quote.adminNotes}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}

function Progress({ status }: { status: QuoteStatus }) {
  const currentIndex = status === "REJECTED" ? -1 : progressSteps.findIndex((step) => step.status === status);

  if (status === "REJECTED") {
    return <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">This quote was not approved. Please contact the team for details.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-6">
      {progressSteps.map((step, index) => {
        const complete = index <= currentIndex;
        return (
          <div key={step.status} className="min-w-0">
            <div className={`h-2 rounded-full ${complete ? "bg-primary" : "bg-zinc-200"}`} />
            <p className={`mt-2 text-xs font-semibold ${complete ? "text-zinc-950" : "text-zinc-400"}`}>{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-zinc-800">{value}</p>
    </div>
  );
}
