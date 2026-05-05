import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quoteStatusLabels, quoteStatusValues } from "@/lib/quote-schema";
import { getQuoteRequestByQuoteId } from "@/lib/quotes";

type StatusValue = (typeof quoteStatusValues)[number];

export const metadata: Metadata = {
  title: "Track Quote",
  description: "Track the current status of your MARKS Engineering quotation request."
};

type TrackQuotePageProps = {
  searchParams?: Promise<{ quoteId?: string }>;
};

export default async function TrackQuotePage({ searchParams }: TrackQuotePageProps) {
  const params = await searchParams;
  const quoteId = params?.quoteId?.trim().toUpperCase() || "";
  const quote = quoteId ? await getQuoteRequestByQuoteId(quoteId) : null;

  return (
    <section className="bg-steel py-20">
      <div className="container max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Quote tracking</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-zinc-950">Check your fabrication quote status.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Enter the Quote ID from your confirmation email to see the current status and last update.
        </p>

        <form className="mt-8 grid gap-3 rounded-lg border bg-white p-5 shadow-industrial md:grid-cols-[1fr_auto]">
          <Input name="quoteId" defaultValue={quoteId} placeholder="Example: ME-2026-0001" />
          <Button type="submit">
            <Search className="h-4 w-4" />
            Track
          </Button>
        </form>

        {quoteId && !quote ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            No quote found for <strong>{quoteId}</strong>. Please check the ID or contact MARKS Engineering.
          </div>
        ) : null}

        {quote ? (
          <div className="mt-6 rounded-lg border bg-white p-6 shadow-industrial">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
              <div>
                <p className="font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-zinc-950">{quote.title}</h2>
              </div>
              <span className="h-fit rounded bg-zinc-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{quoteStatusLabels[quote.status as StatusValue]}</span>
            </div>
            <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
              <Detail label="Client" value={quote.name} />
              <Detail label="Category" value={quote.category} />
              <Detail label="Last update" value={quote.updatedAt.toLocaleString("en-IN")} />
              <Detail label="Site location" value={quote.siteLocation || "-"} />
            </div>
            {quote.adminNotes ? (
              <div className="mt-6 rounded border bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notes</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{quote.adminNotes}</p>
              </div>
            ) : null}
            <Button asChild variant="outline" className="mt-6">
              <Link href="/get-quote">Submit another quote</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-zinc-800">{value}</p>
    </div>
  );
}
