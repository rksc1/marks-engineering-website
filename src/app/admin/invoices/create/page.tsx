import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import CreateInvoiceForm from "@/components/create-invoice-form";

export const metadata: Metadata = {
  title: "Admin - Create Invoice"
};

export default async function CreateInvoicePage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Invoice</h1>
        <CreateInvoiceForm />
      </div>
    </div>
  );
}
