import { z } from "zod";

export const invoiceStatuses = [
  "Generated",
  "Sent",
  "Partially Paid",
  "Paid",
  "Cancelled"
] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const InvoiceLineItemSchema = z.object({
  srNo: z.number(),
  particulars: z.string().min(1, "Particulars required"),
  hsn: z.string().optional(), // HSN/SAC code
  qty: z.number().positive("Quantity must be positive"),
  rate: z.number().positive("Rate must be positive"),
  taxableValue: z.number().default(0), // qty * rate
  cgstRate: z.number().default(9),
  cgst: z.number().default(0),
  sgstRate: z.number().default(9),
  sgst: z.number().default(0),
  igstRate: z.number().default(0),
  igst: z.number().default(0),
  amount: z.number().default(0), // taxableValue + taxes
});

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

export const InvoiceSchema = z.object({
  _id: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number required"),
  customerId: z.string().min(1, "Customer ID required"),
  quoteRequestId: z.string().optional(), // Link to original quote
  poNumber: z.string().optional(),
  poDate: z.date().optional(),
  invoiceDate: z.date().default(() => new Date()),
  paymentTerms: z.string().optional(),
  
  // Customer details
  billTo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    company: z.string().optional(),
    gstin: z.string().optional(),
    address: z.string().optional(),
  }),
  
  // Delivery details
  shipTo: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
  }).optional(),

  // Line items
  lineItems: z.array(InvoiceLineItemSchema).min(1, "At least one item required"),

  // Totals
  subtotal: z.number().default(0), // Sum of taxableValue
  totalCgst: z.number().default(0),
  totalSgst: z.number().default(0),
  totalIgst: z.number().default(0),
  total: z.number().default(0), // subtotal + all taxes
  amountInWords: z.string().optional(),

  // Status and payment
  status: z.enum(invoiceStatuses).default("Generated"),
  paidAmount: z.number().default(0),
  balanceAmount: z.number().default(0),
  paymentNotes: z.string().optional(),

  // File storage
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),

  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceLineItem_ = InvoiceLineItem;
