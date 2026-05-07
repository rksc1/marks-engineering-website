import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildWorkerMap, getAllTasks, getAllWorkers } from "@/lib/workers";
import AdminTasks from "@/components/admin-tasks";

export const metadata: Metadata = {
  title: "Admin - Tasks"
};

export default async function AdminTasksPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [tasks, workers] = await Promise.all([
    getAllTasks(),
    getAllWorkers(),
  ]);

  const workerMap = buildWorkerMap(workers);

  return <AdminTasks tasks={tasks} workers={workers} workerMap={workerMap} />;
}