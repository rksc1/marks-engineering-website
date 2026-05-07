import type { Metadata } from "next";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { getWorkerTasks } from "@/lib/workers";
import WorkerTasks from "@/components/worker-tasks";

export const metadata: Metadata = {
  title: "Worker Tasks"
};

export default async function WorkerTasksPage() {
  const worker = await requireWorkerAuth();
  const tasks = await getWorkerTasks(worker._id!);

  return <WorkerTasks worker={worker} tasks={tasks} />;
}