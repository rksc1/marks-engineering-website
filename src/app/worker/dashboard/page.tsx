import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { getWorkerAttendance, getWorkerTasks } from "@/lib/workers";
import WorkerDashboard from "@/components/worker-dashboard";

export const metadata: Metadata = {
  title: "Worker Dashboard"
};

export default async function WorkerDashboardPage() {
  const worker = await requireWorkerAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [attendance, tasks] = await Promise.all([
    getWorkerAttendance(worker._id!, today),
    getWorkerTasks(worker._id!),
  ]);

  const todayAttendance = attendance[0];
  const pendingTasks = tasks.filter((t) => t.status !== "Completed").slice(0, 3);

  return (
    <WorkerDashboard
      worker={worker}
      todayAttendance={todayAttendance}
      pendingTasks={pendingTasks}
    />
  );
}