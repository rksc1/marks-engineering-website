import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWorkerFromCookie } from "@/lib/worker-auth";
import WorkerLoginForm from "@/components/worker-login-form";

export const metadata: Metadata = {
  title: "Worker Login"
};

export default async function WorkerLoginPage() {
  const worker = await getWorkerFromCookie();
  if (worker) {
    redirect("/worker/dashboard");
  }

  return (
    <section className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-zinc-950">Worker Login</h1>
            <p className="mt-2 text-sm text-zinc-600">Enter your phone number and PIN</p>
          </div>
          <WorkerLoginForm />
        </div>
      </div>
    </section>
  );
}