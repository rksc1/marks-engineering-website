"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, XCircle, ListTodo, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Worker, Attendance, Task } from "@/lib/worker-schema";

type AttendanceView = Omit<Attendance, "date" | "checkIn" | "checkOut" | "approvedAt"> & {
  date: Date | string;
  checkIn?: Date | string;
  checkOut?: Date | string;
  approvedAt?: Date | string;
};

type WorkerView = Omit<Worker, "createdAt"> & {
  createdAt: Date | string;
};

type TaskView = Omit<Task, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
};

interface WorkerDashboardProps {
  worker: WorkerView;
  todayAttendance?: AttendanceView;
  pendingTasks: TaskView[];
}

function toDate(value: Date | string | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

export default function WorkerDashboard({ worker, todayAttendance, pendingTasks }: WorkerDashboardProps) {
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
    } catch {
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
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/worker/logout", { method: "POST" });
    router.push("/worker/login");
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-zinc-950">
              Hello, {worker.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-zinc-600 capitalize">{worker.role}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Attendance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className={`text-lg font-semibold ${getStatusColor(todayAttendance?.status || "Absent")}`}>
                {todayAttendance?.status || "Not checked in"}
              </p>
              {todayAttendance?.checkIn && (
                <p className="text-sm text-zinc-600">
                  Check-in: {toDate(todayAttendance.checkIn)?.toLocaleTimeString()}
                </p>
              )}
              {todayAttendance?.checkOut && (
                <p className="text-sm text-zinc-600">
                  Check-out: {toDate(todayAttendance.checkOut)?.toLocaleTimeString()}
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
            </div>
          </CardContent>
        </Card>

        {/* Tasks Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Recent Tasks
              </span>
              <Button variant="outline" size="sm" onClick={() => router.push("/worker/tasks")}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-zinc-500">No pending tasks</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task._id} className="rounded border p-3">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-zinc-600">{task.status}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="py-8 text-lg"
            onClick={() => router.push("/worker/tasks")}
          >
            <ListTodo className="mr-2 h-6 w-6" />
            Tasks
          </Button>
          <Button
            variant="outline"
            className="py-8 text-lg"
            onClick={() => router.push("/worker/attendance")}
          >
            <Clock className="mr-2 h-6 w-6" />
            Attendance
          </Button>
        </div>
      </div>
    </section>
  );
}
