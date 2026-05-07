import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllWorkers } from "@/lib/workers";
import AdminWorkers from "@/components/admin-workers";

export const metadata: Metadata = {
  title: "Admin - Workers"
};

export default async function AdminWorkersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const workers = await getAllWorkers();

  return <AdminWorkers workers={workers} />;
}