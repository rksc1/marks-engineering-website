import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";
import type { quoteStatusValues } from "@/lib/quote-schema";

export type QuoteStatus = (typeof quoteStatusValues)[number];

export type QuoteReplyDocument = {
  id: string;
  subject: string;
  message: string;
  amount?: number | null;
  timeline?: string | null;
  attachmentUrl?: string | null;
  sentAt: Date;
};

export type QuoteRequestDocument = {
  _id?: ObjectId;
  quoteId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  title: string;
  category: string;
  description: string;
  materialType: string;
  quantity?: string | null;
  budgetRange?: string | null;
  deadline?: Date | null;
  siteLocation?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  status: QuoteStatus;
  customerFeedback?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  purchaseOrderUrl?: string | null;
  purchaseOrderNumber?: string | null;
  feedbackHistory?: Array<{ sender: "customer" | "admin"; message: string; createdAt: Date }>;
  adminNotes?: string | null;
  tags: string[];
  followUpAt?: Date | null;
  replies: QuoteReplyDocument[];
  createdAt: Date;
  updatedAt: Date;
};

export type QuoteMessageDocument = {
  _id?: ObjectId;
  quoteRequestId: string;
  sender: "customer" | "admin";
  message: string;
  createdAt: Date;
};

export type AdminUserDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
};

export type QuoteFilters = {
  query?: string;
  status?: QuoteStatus | "";
};

export async function createQuoteRequest(data: Omit<QuoteRequestDocument, "_id" | "quoteId" | "status" | "tags" | "replies" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  const now = new Date();
  const quoteId = await generateQuoteId();
  const document: QuoteRequestDocument = {
    ...data,
    quoteId,
    status: "NEW",
    customerFeedback: null,
    approvedAt: null,
    rejectedAt: null,
    purchaseOrderUrl: null,
    purchaseOrderNumber: null,
    feedbackHistory: [],
    tags: [],
    replies: [],
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<QuoteRequestDocument>("quote_requests").insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function getQuoteRequests(filters: QuoteFilters = {}) {
  const db = await getDb();
  const query = buildQuoteFilter(filters);
  const quotes = await db.collection<QuoteRequestDocument>("quote_requests").find(query).sort({ createdAt: -1 }).limit(100).toArray();
  return quotes.map(normalizeQuote);
}

export async function getQuoteRequestById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const quote = await db.collection<QuoteRequestDocument>("quote_requests").findOne({ _id: new ObjectId(id) });
  return quote ? normalizeQuote(quote) : null;
}

export async function getQuoteRequestByQuoteId(quoteId: string) {
  const db = await getDb();
  const quote = await db.collection<QuoteRequestDocument>("quote_requests").findOne({ quoteId });
  return quote ? normalizeQuote(quote) : null;
}

export async function getCustomerQuotes(customer: { email: string; phone: string }) {
  const db = await getDb();
  const phone = normalizePhone(customer.phone);
  const quotes = await db
    .collection<QuoteRequestDocument>("quote_requests")
    .find({
      $or: [{ email: customer.email.toLowerCase() }, { phone }, { phone: customer.phone }]
    })
    .sort({ createdAt: -1 })
    .toArray();
  return quotes.map(normalizeQuote);
}

export async function updateQuoteRequest(id: string, data: Partial<QuoteRequestDocument>) {
  const db = await getDb();
  const updates: Partial<QuoteRequestDocument> = {
    ...data,
    updatedAt: new Date()
  };

  if (data.status === "APPROVED") {
    updates.approvedAt = new Date();
  }
  if (data.status === "REJECTED") {
    updates.rejectedAt = new Date();
  }
  if (data.status === "PO_RECEIVED") {
    updates.approvedAt = updates.approvedAt ?? new Date();
  }

  await db.collection<QuoteRequestDocument>("quote_requests").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updates
    }
  );
}

export async function addQuoteMessage(quoteRequestId: string, sender: "customer" | "admin", message: string) {
  const db = await getDb();
  const now = new Date();
  await db.collection<QuoteMessageDocument>("quote_messages").insertOne({
    quoteRequestId,
    sender,
    message,
    createdAt: now
  });

  await db.collection<QuoteRequestDocument>("quote_requests").updateOne(
    { _id: new ObjectId(quoteRequestId) },
    {
      $push: { feedbackHistory: { sender, message, createdAt: now } },
      $set: sender === "customer" ? { customerFeedback: message } : {}
    }
  );
}

export async function getQuoteMessages(quoteRequestId: string) {
  const db = await getDb();
  const messages = await db
    .collection<QuoteMessageDocument>("quote_messages")
    .find({ quoteRequestId })
    .sort({ createdAt: 1 })
    .toArray();
  return messages;
}

export async function addQuoteReply(id: string, reply: Omit<QuoteReplyDocument, "id" | "sentAt">) {
  const db = await getDb();
  const document: QuoteReplyDocument = {
    ...reply,
    id: new ObjectId().toString(),
    sentAt: new Date()
  };

  await db.collection<QuoteRequestDocument>("quote_requests").updateOne(
    { _id: new ObjectId(id) },
    {
      $push: { replies: document },
      $set: { status: "QUOTED", updatedAt: new Date() }
    }
  );

  await addQuoteMessage(id, "admin", `${reply.subject}: ${reply.message}`);

  return document;
}

export async function getQuoteMetrics() {
  const db = await getDb();
  const collection = db.collection<QuoteRequestDocument>("quote_requests");
  const [totalQuotes, newInquiries, pendingReplies, approvedJobs, allQuotes] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ status: "NEW" }),
    collection.countDocuments({ status: { $in: ["NEW", "REVIEWED"] }, replies: { $size: 0 } }),
    collection.countDocuments({ status: { $in: ["APPROVED", "IN_PRODUCTION", "COMPLETED"] } }),
    collection.find({}).toArray()
  ]);

  const replies = allQuotes.flatMap((quote) => quote.replies || []);
  const revenue = replies.reduce((sum, reply) => sum + Number(reply.amount || 0), 0);
  const converted = allQuotes.filter((quote) => ["APPROVED", "IN_PRODUCTION", "COMPLETED"].includes(quote.status)).length;
  const conversionRate = totalQuotes ? Math.round((converted / totalQuotes) * 100) : 0;
  const averageProject = replies.length ? Math.round(revenue / replies.length) : 0;
  const categoryDemand = countBy(allQuotes, "category");
  const monthly = countMonthly(allQuotes);

  return {
    totalQuotes,
    newInquiries,
    pendingReplies,
    approvedJobs,
    revenue,
    conversionRate,
    averageProject,
    categoryDemand,
    monthly
  };
}

export async function findAdminUser(email: string) {
  const db = await getDb();
  return db.collection<AdminUserDocument>("admin_users").findOne({ email });
}

export async function upsertCustomer(data: { name: string; email: string; phone: string; password?: string }) {
  const db = await getDb();
  const now = new Date();
  const email = data.email.trim().toLowerCase();
  const phone = normalizePhone(data.phone);

  const setFields: Partial<CustomerDocument> = {
    name: data.name.trim(),
    email,
    phone,
    updatedAt: now,
    lastLoginAt: now
  };

  if (data.password) {
    setFields.password = hashPassword(data.password);
  }

  await db.collection<CustomerDocument>("customers").updateOne(
    { email },
    {
      $set: setFields,
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );

  const customer = await db.collection<CustomerDocument>("customers").findOne({ email });
  if (!customer) throw new Error("Unable to create customer");
  return normalizeCustomer(customer);
}

export async function findCustomerByEmailAndPassword(emailValue: string, password: string) {
  const db = await getDb();
  const email = emailValue.trim().toLowerCase();
  const customer = await db.collection<CustomerDocument>("customers").findOne({ email });
  if (!customer || !customer.password) return null;
  if (!verifyPassword(password, customer.password)) return null;

  await db.collection<CustomerDocument>("customers").updateOne(
    { _id: customer._id },
    { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
  );

  return normalizeCustomer(customer);
}

export async function findCustomerByEmailAndPhone(emailValue: string, phoneValue: string) {
  const db = await getDb();
  const email = emailValue.trim().toLowerCase();
  const phone = normalizePhone(phoneValue);
  const customer = await db.collection<CustomerDocument>("customers").findOne({ email, phone });
  if (!customer) return null;

  await db.collection<CustomerDocument>("customers").updateOne({ _id: customer._id }, { $set: { lastLoginAt: new Date(), updatedAt: new Date() } });
  return normalizeCustomer(customer);
}

async function generateQuoteId() {
  const db = await getDb();
  const year = new Date().getFullYear();
  const count = await db.collection<QuoteRequestDocument>("quote_requests").countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
    }
  });
  return `ME-${year}-${String(count + 1).padStart(4, "0")}`;
}

function normalizeCustomer(customer: CustomerDocument) {
  return {
    ...customer,
    id: customer._id?.toString() || ""
  };
}

export function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function buildQuoteFilter(filters: QuoteFilters) {
  const clauses: Record<string, unknown>[] = [];
  if (filters.status) clauses.push({ status: filters.status });
  if (filters.query) {
    const regex = new RegExp(escapeRegex(filters.query), "i");
    clauses.push({
      $or: [{ quoteId: regex }, { name: regex }, { email: regex }, { company: regex }, { title: regex }]
    });
  }
  return clauses.length ? { $and: clauses } : {};
}

function normalizeQuote(quote: QuoteRequestDocument) {
  return {
    ...quote,
    id: quote._id?.toString() || "",
    replies: (quote.replies || []).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
  };
}

function countBy(quotes: QuoteRequestDocument[], key: "category") {
  const counts = new Map<string, number>();
  quotes.forEach((quote) => counts.set(quote[key], (counts.get(quote[key]) || 0) + 1));
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function countMonthly(quotes: QuoteRequestDocument[]) {
  const buckets = new Map<string, number>();
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    buckets.set(date.toLocaleString("en-IN", { month: "short" }), 0);
  }
  quotes.forEach((quote) => {
    const label = quote.createdAt.toLocaleString("en-IN", { month: "short" });
    if (buckets.has(label)) buckets.set(label, (buckets.get(label) || 0) + 1);
  });
  return Array.from(buckets, ([label, value]) => ({ label, value }));
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
