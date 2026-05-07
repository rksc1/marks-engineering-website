"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      body: new FormData(event.currentTarget)
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border bg-white p-6 shadow-industrial">
      <div className="grid gap-2">
        <Label htmlFor="password">Admin password</Label>
        <Input id="password" name="password" type="password" required placeholder="Enter admin password" />
      </div>
      <Button type="submit" disabled={status === "loading"}>
        <LockKeyhole className="h-4 w-4" />
        {status === "loading" ? "Checking..." : "Login"}
      </Button>
      {status === "error" ? <p className="text-sm font-medium text-red-700">Invalid password or admin auth is not configured.</p> : null}
    </form>
  );
}
