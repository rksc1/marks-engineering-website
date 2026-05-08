import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin - Work Orders"
};

export default async function AdminWorkOrdersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <section>
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Work Orders</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950">Work order tracking</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Approved quotes and production jobs will be organized here. Use the Quotes section to approve requests and move jobs into production.
        </p>
      </div>
    </section>
  );
}
