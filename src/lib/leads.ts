import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { MAX_DRAWING_SIZE } from "@/lib/upload";

export { MAX_DRAWING_SIZE };

export type DrawingPayload = {
  name: string;
  type: string;
  size: number;
  data: Buffer;
};

export type LeadDocument = {
  _id?: ObjectId;
  kind: "quote" | "contact";
  createdAt: Date;
  status: "new" | "reviewed";
  name: string;
  phone: string;
  email?: string;
  company?: string;
  projectType?: string;
  materialType?: string;
  quantity?: string;
  siteLocation?: string;
  description?: string;
  message?: string;
  source?: string;
  drawing?: DrawingPayload;
};

export async function saveLead(lead: Omit<LeadDocument, "_id" | "createdAt" | "status">) {
  const db = await getDb();
  const document: LeadDocument = {
    ...lead,
    status: "new",
    createdAt: new Date()
  };
  const result = await db.collection<LeadDocument>("leads").insertOne(document);
  return result.insertedId.toString();
}

export async function getLeads() {
  const db = await getDb();
  const leads = await db.collection<LeadDocument>("leads").find({}).sort({ createdAt: -1 }).limit(100).toArray();

  return leads.map((lead) => ({
    id: lead._id?.toString() || "",
    kind: lead.kind,
    createdAt: lead.createdAt.toISOString(),
    status: lead.status,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    company: lead.company || "",
    projectType: lead.projectType || "",
    materialType: lead.materialType || "",
    quantity: lead.quantity || "",
    siteLocation: lead.siteLocation || "",
    description: lead.description || "",
    message: lead.message || "",
    source: lead.source || "",
    drawing: lead.drawing
      ? {
          name: lead.drawing.name,
          type: lead.drawing.type,
          size: lead.drawing.size
        }
      : null
  }));
}

export async function getDrawing(leadId: string) {
  const db = await getDb();
  const lead = await db.collection<LeadDocument>("leads").findOne({ _id: new ObjectId(leadId), "drawing.data": { $exists: true } });
  return lead?.drawing || null;
}
