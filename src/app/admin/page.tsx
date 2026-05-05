import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BriefcaseBusiness, IndianRupee, Inbox, LogOut, Search } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";
import { quoteStatusLabels, quoteStatusValues } from "@/lib/quote-schema";
import { getQuoteMetrics, getQuoteRequests } from "@/lib/quotes";

type StatusValue = (typeof quoteStatusValues)[number];
type QuoteListItem = {
  id: string;
  quoteId: string;
  name: string;
  email: string;
  company?: string | null;
  title: string;
  category: string;
  description: string;
  status: StatusValue;
  createdAt: Date;
  followUpAt?: Date | null;
  replies: unknown[];
};

export const metadata: Metadata = {
  title: "Admin Dashboard"
};

type AdminPageProps = {
  searchParams?: Promise<{ q?: string; status?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const session = await getAdminSession();
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const status = quoteStatusValues.includes(params?.status as StatusValue) ? (params?.status as StatusValue) : "";

  let dbError = "";
  const [quoteRows, metrics] = await Promise.all([getQuoteRequests({ query, status }), getQuoteMetrics()]).catch((error) => {
    dbError = error instanceof Error ? error.message : "Unable to connect to MongoDB";
    return [
      [],
      {
        totalQuotes: 0,
        newInquiries: 0,
        pendingReplies: 0,
        approvedJobs: 0,
        revenue: 0,
        conversionRate: 0,
        averageProject: 0,
        categoryDemand: [],
        monthly: []
      }
    ] as const;
  });
  const { totalQuotes, newInquiries, pendingReplies, approvedJobs, revenue, conversionRate, averageProject } = metrics;
  const categoryRows = metrics.categoryDemand;
  const followUps = quoteRows.filter((quote) => quote.followUpAt).slice(0, 4);
  const clients = new Map(quoteRows.map((quote) => [quote.email, quote]));
  const monthBuckets = metrics.monthly;

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Quote dashboard</h1>
            <p className="mt-2 text-sm text-zinc-600">Signed in as {session?.name || "Admin"}</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <Button variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <Metric label="Total quotes" value={totalQuotes} icon={<Inbox className="h-5 w-5" />} />
          <Metric label="New inquiries" value={newInquiries} icon={<Search className="h-5 w-5" />} />
          <Metric label="Pending replies" value={pendingReplies} icon={<BriefcaseBusiness className="h-5 w-5" />} />
          <Metric label="Approved jobs" value={approvedJobs} icon={<BarChart3 className="h-5 w-5" />} />
          <Metric label="Revenue tracker" value={formatCurrency(revenue)} icon={<IndianRupee className="h-5 w-5" />} />
        </div>

        {dbError ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
            Could not connect to MongoDB: {dbError}. Check your MONGODB_URI, internet connection, DNS, and MongoDB Atlas network access settings.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Quote management</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/track-quote">Track page</Link>
              </Button>
            </div>
            <form className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Input name="q" defaultValue={query} placeholder="Search by quote ID, client, company, email, or project" />
              <Select name="status" defaultValue={status || "ALL"}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {quoteStatusValues.map((item) => (
                    <SelectItem key={item} value={item}>
                      {quoteStatusLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit">Search</Button>
            </form>
            <div className="mt-5 divide-y">
              {quoteRows.length === 0 ? <p className="py-6 text-sm text-zinc-500">No quote requests match this view.</p> : null}
              {quoteRows.map((quote) => (
                <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="grid gap-4 py-4 transition hover:bg-zinc-50 md:grid-cols-[150px_1fr_140px]">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary">{quote.quoteId}</p>
                    <p className="mt-1 text-xs text-zinc-500">{quote.createdAt.toLocaleDateString("en-IN")}</p>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-zinc-950">{quote.title}</h3>
                    <p className="text-sm text-zinc-600">
                      {quote.name} {quote.company ? `- ${quote.company}` : ""} - {quote.category}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{quote.description}</p>
                  </div>
                  <div className="md:text-right">
                    <span className="rounded bg-zinc-950 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">{quoteStatusLabels[quote.status]}</span>
                    <p className="mt-3 text-xs text-zinc-500">{quote.replies.length} replies</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <Panel title="Analytics">
              <p className="text-sm text-zinc-600">Conversion: <strong>{conversionRate}%</strong></p>
              <p className="mt-1 text-sm text-zinc-600">Average project size: <strong>{formatCurrency(averageProject)}</strong></p>
              <div className="mt-4 grid gap-3">
                {monthBuckets.map((item) => (
                  <Bar key={item.label} label={item.label} value={item.value} max={Math.max(...monthBuckets.map((bucket) => bucket.value), 1)} />
                ))}
              </div>
            </Panel>
            <Panel title="Top services">
              <div className="grid gap-3">
                {categoryRows.slice(0, 5).map((item) => (
                  <Bar key={item.label} label={item.label} value={item.value} max={Math.max(...categoryRows.map((category) => category.value), 1)} />
                ))}
              </div>
            </Panel>
            <Panel title="CRM">
              <p className="text-sm text-zinc-600">{clients.size} customers in this view</p>
              <div className="mt-4 grid gap-3 text-sm">
                {followUps.length === 0 ? <p className="text-zinc-500">No pending follow-up reminders.</p> : null}
                {followUps.map((quote) => (
                  <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="rounded border p-3 hover:bg-zinc-50">
                    <strong>{quote.name}</strong>
                    <span className="block text-zinc-500">Follow up {quote.followUpAt?.toLocaleDateString("en-IN")}</span>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between text-zinc-500">
        <p className="text-sm font-semibold">{label}</p>
        {icon}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-zinc-950">{value}</p>
    </div>
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

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs font-semibold text-zinc-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
