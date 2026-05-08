"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Invoice } from "@/lib/invoice-schema";

interface InvoiceDetailProps {
  invoice: Invoice;
}

const statusOptions = [
  "Generated",
  "Sent",
  "Partially Paid",
  "Paid",
  "Cancelled",
];

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invoice.status);
  const [paidAmount, setPaidAmount] = useState(invoice.paidAmount.toString());

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/invoices/${invoice._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paidAmount: parseFloat(paidAmount),
        }),
      });

      if (response.ok) {
        alert("Invoice updated successfully");
        router.refresh();
      } else {
        alert("Failed to update invoice");
      }
    } catch (error) {
      alert("Error updating invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (invoice.fileUrl) {
      window.open(invoice.fileUrl, "_blank");
    }
  };

  const statusColors: Record<string, string> = {
    Generated: "bg-blue-100 text-blue-800",
    Sent: "bg-purple-100 text-purple-800",
    "Partially Paid": "bg-yellow-100 text-yellow-800",
    Paid: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
        <div className="flex gap-2">
          {invoice.fileUrl && (
            <Button onClick={handleDownload} variant="outline">
              <Download size={18} className="mr-2" />
              Download
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[invoice.status]
                }`}
              >
                {invoice.status}
              </span>
            </div>
            {invoice.poNumber && (
              <div>
                <p className="text-sm text-gray-600">PO Number</p>
                <p className="font-medium">{invoice.poNumber}</p>
              </div>
            )}
            {invoice.paymentTerms && (
              <div>
                <p className="text-sm text-gray-600">Payment Terms</p>
                <p className="font-medium">{invoice.paymentTerms}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bill To</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-semibold">{invoice.billTo.name}</p>
            {invoice.billTo.company && <p>{invoice.billTo.company}</p>}
            <p className="text-sm text-gray-600">{invoice.billTo.email}</p>
            <p className="text-sm text-gray-600">{invoice.billTo.phone}</p>
            {invoice.billTo.gstin && (
              <p className="text-sm text-gray-600">GSTIN: {invoice.billTo.gstin}</p>
            )}
            {invoice.billTo.address && (
              <p className="text-sm text-gray-600">{invoice.billTo.address}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Sr No</th>
                  <th className="px-3 py-2 text-left">Particulars</th>
                  <th className="px-3 py-2 text-left">HSN</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Taxable Value</th>
                  <th className="px-3 py-2 text-right">CGST</th>
                  <th className="px-3 py-2 text-right">SGST</th>
                  <th className="px-3 py-2 text-right">IGST</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.srNo} className="border-b">
                    <td className="px-3 py-2">{item.srNo}</td>
                    <td className="px-3 py-2">{item.particulars}</td>
                    <td className="px-3 py-2">{item.hsn || "-"}</td>
                    <td className="px-3 py-2 text-right">{item.qty}</td>
                    <td className="px-3 py-2 text-right">
                      ₹{item.rate.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹{item.taxableValue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹{item.cgst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹{item.sgst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹{item.igst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      ₹{item.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-xl font-semibold">
                ₹{invoice.subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CGST</p>
              <p className="text-xl font-semibold">
                ₹{invoice.totalCgst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SGST</p>
              <p className="text-xl font-semibold">
                ₹{invoice.totalSgst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IGST</p>
              <p className="text-xl font-semibold">
                ₹{invoice.totalIgst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-lg text-gray-600">Grand Total</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{invoice.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          {invoice.amountInWords && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Amount in Words</p>
              <p className="italic">{invoice.amountInWords}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as typeof status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleStatusUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
