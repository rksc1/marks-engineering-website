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
  "REVISION_REQUESTED",
  "QUOTED_UPDATED",
  "APPROVED",
  "PO_RECEIVED",
  "IN_PRODUCTION",
  "COMPLETED",
  "REJECTED"
] as const;

export const quoteStatusLabels: Record<(typeof quoteStatusValues)[number], string> = {
  NEW: "Request received",
  REVIEWED: "Under review",
  QUOTED: "Quotation sent",
  REVISION_REQUESTED: "Revision requested",
  QUOTED_UPDATED: "Quoted updated",
  APPROVED: "Approved",
  PO_RECEIVED: "PO received",
  IN_PRODUCTION: "Work started",
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

export const quoteCustomerFeedbackSchema = z.object({
  quoteRequestId: z.string().min(1),
  message: z.string().trim().min(10, "Feedback must be at least 10 characters")
});

export const quoteCustomerDecisionSchema = z.object({
  quoteRequestId: z.string().min(1)
});

export const quoteCustomerRejectSchema = z.object({
  quoteRequestId: z.string().min(1),
  reason: z.string().trim().optional()
});
