"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice-schema";

interface AdminInvoicesListProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  Generated: "bg-blue-100 text-blue-800",
  Sent: "bg-purple-100 text-purple-800",
  "Partially Paid": "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function AdminInvoicesList({
  invoices,
}: AdminInvoicesListProps) {
  const router = useRouter();

  const handleDownload = (invoice: Invoice) => {
    if (invoice.fileUrl) {
      window.open(invoice.fileUrl, "_blank");
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/invoices/${id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => router.push("/admin/invoices/create")}>
          Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No invoices yet
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Invoice</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3">{invoice.billTo.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{invoice.total.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[invoice.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleView(invoice._id!)}
                      className="inline-block text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    {invoice.fileUrl && (
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="inline-block text-green-600 hover:text-green-800"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
