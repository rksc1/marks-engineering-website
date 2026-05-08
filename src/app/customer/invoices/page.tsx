import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { getInvoicesByCustomerId } from "@/lib/invoices";
import CustomerInvoices from "@/components/customer-invoices";

export const metadata: Metadata = {
  title: "My Invoices"
};

export default async function CustomerInvoicesPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/customer/login");
  }

  const invoices = await getInvoicesByCustomerId(session.id);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <CustomerInvoices invoices={invoices} />
      </div>
    </div>
  );
}
