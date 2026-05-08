"use client";

import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice-schema";

interface CustomerInvoicesProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  Generated: "bg-blue-100 text-blue-800",
  Sent: "bg-purple-100 text-purple-800",
  "Partially Paid": "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function CustomerInvoices({
  invoices,
}: CustomerInvoicesProps) {
  const handleDownload = (invoice: Invoice) => {
    if (invoice.fileUrl) {
      window.open(invoice.fileUrl, "_blank");
    }
  };

  const handleView = (id: string) => {
    // Could open a modal or navigate to a detail page
    window.open(`/customer/invoices/${id}`, "_blank");
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-8">My Invoices</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Total Amount</p>
              <p className="text-2xl font-bold">
                ₹{totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{paidAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{pendingAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No invoices yet. Once your order is completed, invoices will appear here.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Invoice</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-right">Paid</th>
                    <th className="px-4 py-2 text-right">Pending</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₹{invoice.total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        ₹{invoice.paidAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600">
                        ₹{(invoice.total - invoice.paidAmount).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[invoice.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
