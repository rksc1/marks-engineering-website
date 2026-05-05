import { z } from "zod";

export const quoteCategories = [
  "Shed Fabrication",
  "ACP Structure",
  "Machine Frames",
  "Gates",
  "Railings",
  "Custom Fabrication"
] as const;

export const materialTypes = [
  "MS pipe",
  "Angle",
  "Channel",
  "Sheet",
  "Profile sheet",
  "Stainless steel",
  "Aluminium",
  "Other"
] as const;

export const quoteStatusValues = [
  "NEW",
  "REVIEWED",
  "QUOTED",
  "APPROVED",
  "IN_PRODUCTION",
  "COMPLETED",
  "REJECTED"
] as const;

export const quoteStatusLabels: Record<(typeof quoteStatusValues)[number], string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  QUOTED: "Quoted",
  APPROVED: "Approved",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("A valid email is required"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  title: z.string().trim().min(2, "Project title is required"),
  category: z.enum(quoteCategories, { message: "Select a project category" }),
  description: z.string().trim().min(10, "Add a short project description"),
  materialType: z.enum(materialTypes, { message: "Select a material type" }),
  quantity: z.string().trim().optional(),
  budgetRange: z.string().trim().optional(),
  deadline: z.string().trim().optional(),
  siteLocation: z.string().trim().optional()
});

export const quoteReplySchema = z.object({
  quoteRequestId: z.string().min(1),
  subject: z.string().trim().min(3, "Subject is required"),
  message: z.string().trim().min(10, "Quotation message is required"),
  amount: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  timeline: z.string().trim().optional()
});

export const quoteStatusSchema = z.object({
  quoteRequestId: z.string().min(1),
  status: z.enum(quoteStatusValues),
  adminNotes: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  followUpAt: z.string().trim().optional()
});
