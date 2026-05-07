import type { Metadata } from "next";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { getWorkerAttendance } from "@/lib/workers";
import WorkerAttendance from "@/components/worker-attendance";

export const metadata: Metadata = {
  title: "Worker Attendance"
};

export default async function WorkerAttendancePage() {
  const worker = await requireWorkerAuth();
  const attendance = await getWorkerAttendance(worker._id!);

  return <WorkerAttendance worker={worker} attendance={attendance} />;
}