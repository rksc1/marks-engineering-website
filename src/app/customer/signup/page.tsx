import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Customer Signup"
};

type SignupPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CustomerSignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <section className="bg-steel py-20">
      <div className="container mx-auto max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Customer portal</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-zinc-950">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">Use the same email and mobile number you used for quote requests.</p>

        <form action="/api/customer/signup" method="post" className="mt-8 grid gap-4 rounded-lg border bg-white p-6 shadow-industrial">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="name@company.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" name="phone" required placeholder="+91" />
          </div>
          <Button type="submit">
            <UserPlus className="h-4 w-4" />
            Sign up
          </Button>
          {error ? <p className="text-sm font-medium text-red-700">Could not create account. Please check all fields and try again.</p> : null}
          <p className="text-sm text-zinc-600">
            Already registered? <Link href="/customer/login" className="font-semibold text-primary">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
