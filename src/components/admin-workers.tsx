"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Worker, workerRoles } from "@/lib/worker-schema";

interface AdminWorkersProps {
  workers: Worker[];
}

export default function AdminWorkers({ workers: initialWorkers }: AdminWorkersProps) {


  const [workers, setWorkers] = useState(initialWorkers);
  const [showForm, setShowForm] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerSummary, setWorkerSummary] = useState<{
    fullDays: number;
    halfDays: number;
    totalWage: number;
  } | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "" as Worker["role"],
    pin: "",
    dailyWage: "",
    paymentType: "daily" as Worker["paymentType"],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dailyWage: parseFloat(formData.dailyWage),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ name: "", phone: "", role: "" as Worker["role"], pin: "", dailyWage: "", paymentType: "daily" });
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create worker");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerStatus = async (workerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/workers/${workerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setWorkers(workers.map(w =>
          w._id === workerId ? { ...w, isActive: !isActive } : w
        ));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update worker");
      }
    } catch {
      alert("Network error");
    }
  };

  const openAdvanceModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setAdvanceAmount("");
    setAdvanceNote("");
    setShowAdvanceModal(true);
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/advances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorker._id,
          amount: parseFloat(advanceAmount),
          note: advanceNote,
        }),
      });

      if (response.ok) {
        setShowAdvanceModal(false);
        setSelectedWorker(null);
        setAdvanceAmount("");
        setAdvanceNote("");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create advance");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const openSummaryModal = async (worker: Worker) => {
    setSelectedWorker(worker);
    setLoading(true);
    
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await fetch(
        `/api/admin/payout?workerId=${worker._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setWorkerSummary({
          fullDays: data.summary.fullDays,
          halfDays: data.summary.halfDays,
          totalWage: data.summary.totalWage,
        });
        setShowSummaryModal(true);
      } else {
        alert("Failed to load attendance summary");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Worker Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Worker
          </Button>
        </div>

        {/* Add Worker Form */}
        {showForm && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add New Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Worker["role"] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {workerRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pin">PIN (4 digits)</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dailyWage">Daily Wage</Label>
                  <Input
                    id="dailyWage"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select value={formData.paymentType} onValueChange={(value) => setFormData({ ...formData, paymentType: value as Worker["paymentType"] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Worker"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Advance Modal */}
        {showAdvanceModal && selectedWorker && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add Advance for {selectedWorker.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdvanceSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="advanceAmount">Amount</Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="advanceNote">Note (Optional)</Label>
                  <Input
                    id="advanceNote"
                    value={advanceNote}
                    onChange={(e) => setAdvanceNote(e.target.value)}
                    placeholder="Reason for advance"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Advance"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAdvanceModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Summary Modal */}
        {showSummaryModal && selectedWorker && workerSummary && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Attendance Summary - {selectedWorker.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-zinc-600">Full Days</p>
                  <p className="text-2xl font-bold text-green-600">{workerSummary.fullDays}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-zinc-600">Half Days</p>
                  <p className="text-2xl font-bold text-yellow-600">{workerSummary.halfDays}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-zinc-600">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-600">₹{workerSummary.totalWage.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSelectedWorker(null);
                    setWorkerSummary(null);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workers List */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <Card key={worker._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{worker.name}</span>
                  {worker.isActive ? (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Phone:</strong> {worker.phone}</p>
                  <p><strong>Role:</strong> {worker.role.charAt(0).toUpperCase() + worker.role.slice(1)}</p>
                  <p><strong>Daily Wage:</strong> ₹{worker.dailyWage}</p>
                  <p><strong>Payment Type:</strong> {worker.paymentType.charAt(0).toUpperCase() + worker.paymentType.slice(1)}</p>
                  <p><strong>Total Advance:</strong> ₹{worker.totalAdvance}</p>
                  <p><strong>Status:</strong> {worker.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toggleWorkerStatus(worker._id!, worker.isActive)}
                  >
                    {worker.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openAdvanceModal(worker)}
                  >
                    Manage Advances
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openSummaryModal(worker)}
                  >
                    View Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workers.length === 0 && (
          <div className="mt-8 text-center py-12">
            <p className="text-zinc-500">No workers added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
