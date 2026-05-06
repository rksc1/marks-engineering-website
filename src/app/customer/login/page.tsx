import type { Metadata } from "next";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Customer Login"
};

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CustomerLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <section className="bg-steel py-20">
      <div className="container mx-auto max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Customer portal</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-zinc-950">Login to track work</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">Enter your registered email and password to view quotes and project progress.</p>

        <form action="/api/customer/login" method="post" className="mt-8 grid gap-4 rounded-lg border bg-white p-6 shadow-industrial">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="name@company.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="Enter password" />
          </div>
          <Button type="submit">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          {error === "invalid" ? (
            <p className="text-sm font-medium text-red-700">Invalid email or password.</p>
          ) : error === "missing" ? (
            <p className="text-sm font-medium text-red-700">Please enter your email and password.</p>
          ) : error === "server" ? (
            <p className="text-sm font-medium text-red-700">Login failed due to a server error. Please try again.</p>
          ) : null}
          <p className="text-sm text-zinc-600">
            New customer? <Link href="/customer/signup" className="font-semibold text-primary">Create account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
