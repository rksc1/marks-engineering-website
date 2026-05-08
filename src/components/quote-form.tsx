"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { materialTypes, quoteCategories } from "@/lib/quote-schema";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

type QuoteFormValues = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title: string;
  category: string;
  description: string;
  materialType: string;
  quantity?: string;
  budgetRange?: string;
  deadline?: string;
  siteLocation?: string;
};

export function QuoteForm() {
  const { register, setValue, formState } = useForm<QuoteFormValues>();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [quoteId, setQuoteId] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const drawingInput = form.elements.namedItem("drawing") as HTMLInputElement | null;
    const drawing = drawingInput?.files?.[0];

    if (drawing && drawing.size > MAX_UPLOAD_SIZE) {
      setStatus("error");
      setMessage("Drawing is above 8MB. Please upload a smaller PDF, JPG, PNG, XLSX, XLS, or XLTM file.");
      return;
    }

    setStatus("loading");
    setProgress(0);
    setMessage("");
    setQuoteId("");

    try {
      const result = await submitWithProgress(new FormData(form), setProgress);
      setStatus("success");
      setQuoteId(result.quoteId);
      form.reset();
      setProgress(100);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed. Please try again or send details on WhatsApp.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border bg-white p-5 shadow-industrial md:p-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-950">Client information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Full Name" htmlFor="name" required>
            <Input id="name" {...register("name")} required placeholder="Your name" />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <Input id="email" {...register("email")} type="email" required placeholder="name@company.com" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" {...register("phone")} placeholder="+91" />
          </Field>
          <Field label="Company Name" htmlFor="company">
            <Input id="company" {...register("company")} placeholder="Company or plant name" />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-950">Project information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Project Title" htmlFor="title" required>
            <Input id="title" {...register("title")} required placeholder="Workshop shed, machine frame, etc." />
          </Field>
          <Field label="Project Category" required>
            <Select name="category" required onValueChange={(value) => setValue("category", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {quoteCategories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-950">Project details</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Description" htmlFor="description" required>
            <Textarea id="description" {...register("description")} required placeholder="Approximate size, use case, load needs, site conditions, or drawing notes." />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Material Type" required>
              <Select name="materialType" required onValueChange={(value) => setValue("materialType", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quantity" htmlFor="quantity">
              <Input id="quantity" {...register("quantity")} placeholder="Tonnage, pieces, or area" />
            </Field>
            <Field label="Budget Range" htmlFor="budgetRange">
              <Input id="budgetRange" {...register("budgetRange")} placeholder="Example: ₹1L - ₹3L" />
            </Field>
            <Field label="Deadline Date" htmlFor="deadline">
              <Input id="deadline" {...register("deadline")} type="date" />
            </Field>
            <Field label="Site Location" htmlFor="siteLocation">
              <Input id="siteLocation" {...register("siteLocation")} placeholder="City / site area" />
            </Field>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="drawing">Drawing Upload</Label>
        <div className="rounded-lg border border-dashed bg-zinc-50 p-4">
          <Input id="drawing" name="drawing" type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.xltm,application/pdf,image/jpeg,image/png" className="bg-white" />
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <UploadCloud className="h-4 w-4" />
            Upload PDF, JPG, PNG, XLSX, XLS, or XLTM. Maximum file size: 8MB.
          </p>
          {status === "loading" ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={status === "loading" || formState.isSubmitting} className="w-full md:w-fit">
        {status === "loading" ? "Submitting..." : "Submit Quote Request"}
      </Button>
      {status === "success" ? (
        <p className="text-sm font-medium text-green-700">
          Quote request received. Your Quote ID is <strong>{quoteId}</strong>.
        </p>
      ) : null}
      {status === "error" ? <p className="text-sm font-medium text-red-700">{message}</p> : null}
    </form>
  );
}

function Field({ label, htmlFor, required, children }: { label: string; htmlFor?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function submitWithProgress(formData: FormData, onProgress: (progress: number) => void) {
  return new Promise<{ quoteId: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/quote");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 90));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || "Quote submission failed"));
        }
      } catch {
        reject(new Error("Quote submission failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while submitting quote"));
    xhr.send(formData);
  });
}
