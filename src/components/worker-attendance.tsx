"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Worker, Attendance } from "@/lib/worker-schema";

interface WorkerAttendanceProps {
  worker: Worker;
  attendance: Attendance[];
}

export default function WorkerAttendance({ worker, attendance }: WorkerAttendanceProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/worker/check-in", { method: "POST" });
      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Check-in failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/worker/check-out", { method: "POST" });
      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Check-out failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = attendance.find((a) => a.date.getTime() === today.getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "text-green-600";
      case "Half Day":
        return "text-yellow-600";
      case "Absent":
        return "text-red-600";
      default:
        return "text-zinc-600";
    }
  };

  return (
    <section className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/worker/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-zinc-950">Attendance</h1>
            <p className="text-sm text-zinc-600">Track your work hours</p>
          </div>
        </div>

        {/* Today's Attendance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className={`text-lg font-semibold ${getStatusColor(todayAttendance?.status || "Absent")}`}>
                {todayAttendance?.status || "Not checked in"}
              </p>
              {todayAttendance?.checkIn && (
                <p className="text-sm text-zinc-600">
                  Check-in: {todayAttendance.checkIn.toLocaleTimeString()}
                </p>
              )}
              {todayAttendance?.checkOut && (
                <p className="text-sm text-zinc-600">
                  Check-out: {todayAttendance.checkOut.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {!todayAttendance?.checkIn && (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 py-6 text-lg"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              )}
              {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <Button
                  onClick={handleCheckOut}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Check Out
                </Button>
              )}
              {todayAttendance?.checkIn && todayAttendance?.checkOut && (
                <div className="flex-1 rounded bg-green-50 p-4 text-center text-green-800">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                  <p className="font-semibold">Checked out for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-sm text-zinc-500">No attendance records yet</p>
            ) : (
              <div className="space-y-3">
                {attendance.slice(0, 10).map((record) => (
                  <div key={record._id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-semibold">
                        {record.date.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      {record.checkIn && (
                        <p className="text-sm text-zinc-600">
                          {record.checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {record.checkOut && ` - ${record.checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}