import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { quoteStatusLabels } from "@/lib/quote-schema";
import { getQuoteRequests } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "Admin - Quotes"
};

export default async function AdminQuotesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const quotes = await getQuoteRequests().catch(() => []);

  return (
    <section>
      <div className="rounded-lg border bg-white p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Quotes</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950">Quote requests</h2>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-primary">
            Dashboard summary
          </Link>
        </div>

        <div className="mt-5 divide-y">
          {quotes.length === 0 ? <p className="py-6 text-sm text-zinc-500">No quote requests found.</p> : null}
          {quotes.map((quote) => (
            <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="grid gap-4 py-4 transition hover:bg-zinc-50 md:grid-cols-[150px_1fr_150px]">
              <div>
                <p className="font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
                <p className="mt-1 text-xs text-zinc-500">{quote.createdAt.toLocaleDateString("en-IN")}</p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-950">{quote.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {quote.name} - {quote.category}
                </p>
              </div>
              <div className="md:text-right">
                <span className="rounded bg-zinc-950 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">{quoteStatusLabels[quote.status]}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
