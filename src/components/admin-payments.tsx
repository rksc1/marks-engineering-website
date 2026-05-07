"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wage, Worker } from "@/lib/worker-schema";

interface AdminPaymentsProps {
  wages: Wage[];
  workers: Worker[];
  workerMap: Map<string, Worker>;
  pendingWages: Array<{
    workerId: string;
    workerName: string;
    amount: number;
    days: number;
  }>;
}

export default function AdminPayments({ wages, pendingWages }: AdminPaymentsProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handleMarkPaid = async (workerId: string, amount: number) => {
    setProcessing(workerId);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, amount }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to mark as paid");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Payment Management</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWages.length === 0 ? (
                <p className="text-center py-8 text-zinc-500">No pending payments</p>
              ) : (
                <div className="space-y-4">
                  {pendingWages.map((wage) => (
                    <div key={wage.workerId} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-semibold">{wage.workerName}</p>
                        <p className="text-sm text-zinc-600">
                          {wage.days} days • {formatCurrency(wage.amount)}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleMarkPaid(wage.workerId, wage.amount)}
                        disabled={processing === wage.workerId}
                        size="sm"
                      >
                        {processing === wage.workerId ? "Processing..." : "Mark Paid"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wages.length === 0 ? (
                <p className="text-center py-8 text-zinc-500">No payment records</p>
              ) : (
                <div className="space-y-4">
                  {wages.slice(0, 10).map((wage) => (
                    <div key={wage._id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-semibold">
                          {wage.date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {formatCurrency(wage.amount)} • {wage.type}
                        </p>
                      </div>
                      <div className="text-right">
                        {wage.isPaid ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600 mx-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-zinc-950">
                {formatCurrency(wages.filter(w => w.isPaid).reduce((sum, w) => sum + w.amount, 0))}
              </div>
              <p className="text-sm text-zinc-600">Total Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-zinc-950">
                {formatCurrency(pendingWages.reduce((sum, w) => sum + w.amount, 0))}
              </div>
              <p className="text-sm text-zinc-600">Pending Payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-zinc-950">
                {pendingWages.length}
              </div>
              <p className="text-sm text-zinc-600">Workers Due Payment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}