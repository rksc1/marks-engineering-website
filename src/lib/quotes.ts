import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
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
  adminNotes?: string | null;
  tags: string[];
  followUpAt?: Date | null;
  replies: QuoteReplyDocument[];
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUserDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
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

export async function updateQuoteRequest(id: string, data: Partial<Pick<QuoteRequestDocument, "status" | "adminNotes" | "tags" | "followUpAt">>) {
  const db = await getDb();
  await db.collection<QuoteRequestDocument>("quote_requests").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date()
      }
    }
  );
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
