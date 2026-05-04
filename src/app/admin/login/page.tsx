import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <section className="min-h-[70vh] bg-steel py-20">
      <div className="container mx-auto max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">MARKS Admin</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-zinc-950">Lead inbox login</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">Protected access for quote requests, contact messages, and drawing downloads.</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </section>
  );
}
