import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllAttendance, getAllWorkers } from "@/lib/workers";
import AdminAttendance from "@/components/admin-attendance";

export const metadata: Metadata = {
  title: "Admin - Attendance"
};

export default async function AdminAttendancePage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [attendance, workers] = await Promise.all([
    getAllAttendance(),
    getAllWorkers(),
  ]);

  return (
    <AdminAttendance
      attendance={attendance.map((record) => ({
        ...record,
        date: record.date.toISOString(),
        checkIn: record.checkIn?.toISOString(),
        checkOut: record.checkOut?.toISOString(),
        approvedAt: record.approvedAt?.toISOString(),
      }))}
      workers={workers.map((worker) => ({
        ...worker,
        createdAt: worker.createdAt.toISOString(),
      }))}
    />
  );
}
