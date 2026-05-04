"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({ source = "contact" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("loading");
    const formData = new FormData(form);
    formData.set("source", source);

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData
    });

    setStatus(response.ok ? "success" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Your name" required />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+91" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@company.com" required />
        </div>
      </div>
      <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="Company name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Requirement</Label>
        <Textarea id="message" name="message" placeholder="Tell us what needs to be fabricated or installed." required />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-fit">
        <Send className="h-4 w-4" />
        {status === "loading" ? "Sending..." : "Send Inquiry"}
      </Button>
      {status === "success" ? <p className="text-sm font-medium text-green-700">Inquiry sent. The team will contact you shortly.</p> : null}
      {status === "error" ? <p className="text-sm font-medium text-red-700">Something went wrong. Please call or WhatsApp directly.</p> : null}
    </form>
  );
}
