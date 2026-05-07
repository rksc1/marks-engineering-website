"use client";

import { useState } from "react";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Attendance, Worker } from "@/lib/worker-schema";

interface AdminAttendanceProps {
  attendance: Attendance[];
  workerMap: Map<string, Worker>;
}

export default function AdminAttendance({ attendance, workerMap }: AdminAttendanceProps) {
  const [filter, setFilter] = useState({
    workerId: "",
    date: "",
    status: "",
  });

  const filteredAttendance = attendance.filter((record) => {
    const worker = workerMap.get(record.workerId);
    if (!worker) return false;

    if (filter.workerId && record.workerId !== filter.workerId) return false;
    if (filter.status && record.status !== filter.status) return false;
    if (filter.date) {
      const recordDate = record.date.toISOString().split('T')[0];
      if (recordDate !== filter.date) return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "text-green-600 bg-green-50";
      case "Half Day":
        return "text-yellow-600 bg-yellow-50";
      case "Absent":
        return "text-red-600 bg-red-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  const getApprovalColor = (isApproved: boolean | undefined) => {
    if (isApproved === true) return "text-green-600 bg-green-50";
    if (isApproved === false) return "text-red-600 bg-red-50";
    return "text-yellow-600 bg-yellow-50";
  };

  const handleApproval = async (attendanceId: string, action: "approve" | "reject", approvalType?: "present" | "half-day" | "absent") => {
    try {
      const response = await fetch("/api/admin/attendance/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId,
          action,
          approvalType,
          adminId: "admin", // In a real app, get from session
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update attendance");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const workers = Array.from(workerMap.values());

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Attendance Tracking</h1>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-2">Worker</label>
                <Select value={filter.workerId} onValueChange={(value) => setFilter({ ...filter, workerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All workers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All workers</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker._id} value={worker._id!}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={filter.date}
                  onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Records ({filteredAttendance.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Worker</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Check In</th>
                      <th className="pb-3 font-semibold">Check Out</th>
                      <th className="pb-3 font-semibold">Hours</th>
                      <th className="pb-3 font-semibold">Approval</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAttendance.map((record) => {
                      const worker = workerMap.get(record.workerId);
                      const hours = record.checkIn && record.checkOut
                        ? Math.round((record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60) * 10) / 10
                        : null;

                      return (
                        <tr key={record._id} className="py-3">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-zinc-400" />
                              {worker?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="py-3">
                            {record.date.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {record.checkIn ? record.checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </td>
                          <td className="py-3">
                            {record.checkOut ? record.checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </td>
                          <td className="py-3">
                            {hours ? `${hours}h` : "-"}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getApprovalColor(record.isApproved)}`}>
                              {record.isApproved === true ? "Approved" : record.isApproved === false ? "Rejected" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3">
                            {record.isApproved === undefined && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs text-green-600 hover:text-green-700"
                                  onClick={() => handleApproval(record._id!, "approve", "present")}
                                  title="Approve as Full Day"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Full Day
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs text-yellow-600 hover:text-yellow-700"
                                  onClick={() => handleApproval(record._id!, "approve", "half-day")}
                                  title="Approve as Half Day"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Half Day
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                                  onClick={() => handleApproval(record._id!, "reject")}
                                  title="Reject / Mark Absent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}