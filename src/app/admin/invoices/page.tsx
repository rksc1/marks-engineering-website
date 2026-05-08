import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllInvoices } from "@/lib/invoices";
import AdminInvoicesList from "@/components/admin-invoices-list";

export const metadata: Metadata = {
  title: "Admin - Invoices"
};

export default async function AdminInvoicesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const invoices = await getAllInvoices();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <AdminInvoicesList invoices={invoices} />
      </div>
    </div>
  );
}
