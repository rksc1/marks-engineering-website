import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getInvoiceById } from "@/lib/invoices";
import InvoiceDetail from "@/components/invoice-detail";

export const metadata: Metadata = {
  title: "Admin - Invoice Detail"
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    redirect("/admin/invoices");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <InvoiceDetail invoice={invoice} />
      </div>
    </div>
  );
}
