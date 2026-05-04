import type { Metadata } from "next";
import Link from "next/link";
import { Download, Inbox, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLeads } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Admin Lead Inbox"
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  let leads: Awaited<ReturnType<typeof getLeads>> = [];
  let dbError = "";

  try {
    leads = await getLeads();
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Unable to load leads";
  }

  const quoteCount = leads.filter((lead) => lead.kind === "quote").length;
  const contactCount = leads.filter((lead) => lead.kind === "contact").length;

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Lead inbox</h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <Button variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Total leads", leads.length],
            ["Quote requests", quoteCount],
            ["Contact messages", contactCount]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-white p-5">
              <p className="text-sm font-semibold text-zinc-500">{label}</p>
              <p className="mt-2 font-display text-4xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {dbError ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            Could not load MongoDB leads: {dbError}. Configure `MONGODB_URI` and `MONGODB_DB` in `.env.local`.
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-lg border bg-white">
          <div className="flex items-center gap-3 border-b p-5">
            <Inbox className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Latest quote requests and contact messages</h2>
          </div>
          <div className="divide-y">
            {leads.length === 0 && !dbError ? <p className="p-5 text-sm text-zinc-500">No leads yet.</p> : null}
            {leads.map((lead) => (
              <article key={lead.id} className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_180px]">
                <div>
                  <span className="rounded bg-zinc-950 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">{lead.kind}</span>
                  <p className="mt-3 text-xs text-zinc-500">{new Date(lead.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{lead.name}</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {lead.phone} · {lead.email || "No email"} {lead.company ? `· ${lead.company}` : ""}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
                    {lead.projectType ? <p><strong>Project:</strong> {lead.projectType}</p> : null}
                    {lead.materialType ? <p><strong>Material:</strong> {lead.materialType}</p> : null}
                    {lead.quantity ? <p><strong>Quantity:</strong> {lead.quantity}</p> : null}
                    {lead.siteLocation ? <p><strong>Location:</strong> {lead.siteLocation}</p> : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-600">{lead.description || lead.message}</p>
                </div>
                <div className="flex items-start lg:justify-end">
                  {lead.drawing ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/api/admin/drawings/${lead.id}`}>
                        <Download className="h-4 w-4" />
                        Drawing
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-sm text-zinc-400">No drawing</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
