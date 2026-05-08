import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return <AdminShell adminName={session?.name || "Admin"}>{children}</AdminShell>;
}
