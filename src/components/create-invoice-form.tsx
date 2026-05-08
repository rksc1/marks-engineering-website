"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LineItem {
  particulars: string;
  hsn: string;
  qty: number;
  rate: number;
}

export default function CreateInvoiceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    poNumber: "",
    poDate: "",
    paymentTerms: "",
    billTo: {
      name: "",
      email: "",
      phone: "",
      company: "",
      gstin: "",
      address: "",
    },
    shipTo: {
      name: "",
      address: "",
    },
    lineItems: [
      { particulars: "", hsn: "", qty: 1, rate: 0 },
    ] as LineItem[],
  });

  const handleBillToChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      billTo: { ...prev.billTo, [field]: value },
    }));
  };

  const handleLineItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const items = [...prev.lineItems];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, lineItems: items };
    });
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { particulars: "", hsn: "", qty: 1, rate: 0 },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/invoices/${data.invoiceId}`);
      } else {
        alert("Failed to create invoice");
      }
    } catch (error) {
      alert("Error creating invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bill To</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                required
                value={formData.billTo.name}
                onChange={(e) => handleBillToChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={formData.billTo.email}
                onChange={(e) => handleBillToChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                required
                value={formData.billTo.phone}
                onChange={(e) => handleBillToChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={formData.billTo.company}
                onChange={(e) => handleBillToChange("company", e.target.value)}
              />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input
                value={formData.billTo.gstin}
                onChange={(e) => handleBillToChange("gstin", e.target.value)}
              />
            </div>
            <div>
              <Label>Customer ID *</Label>
              <Input
                required
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              value={formData.billTo.address}
              onChange={(e) => handleBillToChange("address", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>PO Number</Label>
              <Input
                value={formData.poNumber}
                onChange={(e) =>
                  setFormData({ ...formData, poNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label>PO Date</Label>
              <Input
                type="date"
                value={formData.poDate}
                onChange={(e) =>
                  setFormData({ ...formData, poDate: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Payment Terms</Label>
            <Input
              value={formData.paymentTerms}
              onChange={(e) =>
                setFormData({ ...formData, paymentTerms: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items</CardTitle>
            <Button
              type="button"
              onClick={addLineItem}
              variant="outline"
              size="sm"
            >
              <Plus size={16} /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Particulars</th>
                  <th className="px-3 py-2 text-left">HSN/SAC</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.lineItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-3 py-2">
                      <Input
                        required
                        value={item.particulars}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "particulars",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.hsn}
                        onChange={(e) =>
                          handleLineItemChange(index, "hsn", e.target.value)
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        required
                        value={item.qty}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "qty",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        required
                        value={item.rate}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "rate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
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

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="px-8"
        >
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
