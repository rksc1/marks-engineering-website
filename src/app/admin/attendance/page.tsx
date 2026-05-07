import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildWorkerMap, getAllAttendance, getAllWorkers } from "@/lib/workers";
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

  const workerMap = buildWorkerMap(workers);

  return <AdminAttendance attendance={attendance} workerMap={workerMap} />;
}