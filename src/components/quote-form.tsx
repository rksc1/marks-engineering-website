"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { materials, quoteProjectTypes } from "@/lib/data";
import { MAX_DRAWING_SIZE } from "@/lib/upload";

export function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const drawingInput = form.elements.namedItem("drawing") as HTMLInputElement | null;
    const drawing = drawingInput?.files?.[0];

    if (drawing && drawing.size > MAX_DRAWING_SIZE) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const response = await fetch("/api/quote", {
      method: "POST",
      body: new FormData(form)
    });

    setStatus(response.ok ? "success" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border bg-white p-5 shadow-industrial md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="+91" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="name@company.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="Company or plant name" />
        </div>
        <div className="grid gap-2">
          <Label>Project type</Label>
          <Select name="projectType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {quoteProjectTypes.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Project description</Label>
        <Textarea id="description" name="description" required placeholder="Approximate size, use case, load needs, deadline, or site conditions." />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Material type</Label>
          <Select name="materialType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" placeholder="Tonnage, pieces, or area" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="siteLocation">Site location</Label>
          <Input id="siteLocation" name="siteLocation" required placeholder="City / site area" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="drawing">Drawing upload</Label>
        <div className="rounded-lg border border-dashed bg-zinc-50 p-4">
          <Input id="drawing" name="drawing" type="file" accept=".pdf,image/*" className="bg-white" />
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <UploadCloud className="h-4 w-4" />
            Upload PDF, JPG, PNG, or site sketch for faster quotation. Maximum file size: 8MB.
          </p>
        </div>
      </div>
      <Button type="submit" size="lg" disabled={status === "loading"} className="w-full md:w-fit">
        {status === "loading" ? "Submitting..." : "Submit Quote Request"}
      </Button>
      {status === "success" ? <p className="text-sm font-medium text-green-700">Quote request received. MARKS Engineering will review the details and respond.</p> : null}
      {status === "error" ? <p className="text-sm font-medium text-red-700">Submission failed, or the drawing is above 8MB. Please try again or send it on WhatsApp.</p> : null}
    </form>
  );
}
