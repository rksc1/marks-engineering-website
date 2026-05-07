import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { Worker } from "@/lib/worker-schema";
import { buildWorkerMap, calculateWorkerWage, getAllWages, getAllWorkers } from "@/lib/workers";
import AdminPayments from "@/components/admin-payments";

export const metadata: Metadata = {
  title: "Admin - Payments"
};

export default async function AdminPaymentsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [wages, workers] = await Promise.all([
    getAllWages(),
    getAllWorkers(),
  ]);

  const workerMap = buildWorkerMap(workers);

  // Calculate pending wages for active workers
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const activeWorkers = workers.filter(
    (w): w is Worker & { _id: string } => w.isActive && typeof w._id === "string"
  );

  const pendingWages = [];
  for (const worker of activeWorkers) {
    const calculatedWage = await calculateWorkerWage(worker._id, currentMonth, nextMonth);
    if (calculatedWage > 0) {
      pendingWages.push({
        workerId: worker._id,
        workerName: worker.name,
        amount: calculatedWage,
        days: Math.ceil(calculatedWage / 500), // Assuming 500/day
      });
    }
  }

  return (
    <AdminPayments
      wages={wages}
      workers={workers}
      workerMap={workerMap}
      pendingWages={pendingWages}
    />
  );
}