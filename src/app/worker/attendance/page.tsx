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

  return (
    <WorkerAttendance
      worker={{ ...worker, createdAt: worker.createdAt.toISOString() }}
      attendance={attendance.map((record) => ({
        ...record,
        date: record.date.toISOString(),
        checkIn: record.checkIn?.toISOString(),
        checkOut: record.checkOut?.toISOString(),
        approvedAt: record.approvedAt?.toISOString(),
      }))}
    />
  );
}
