import { NextResponse } from "next/server";

import { sendInquiryEmail } from "@/lib/email";
import { MAX_DRAWING_SIZE, saveLead } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const drawing = formData.get("drawing");
    let drawingPayload;
    const drawingInfo =
      drawing instanceof File && drawing.size > 0
        ? `${drawing.name} (${Math.round(drawing.size / 1024)} KB, ${drawing.type || "unknown type"})`
        : "No drawing uploaded";

    if (drawing instanceof File && drawing.size > 0) {
      if (drawing.size > MAX_DRAWING_SIZE) {
        return NextResponse.json({ error: "Drawing must be 8MB or smaller" }, { status: 413 });
      }

      drawingPayload = {
        name: drawing.name,
        type: drawing.type || "application/octet-stream",
        size: drawing.size,
        data: Buffer.from(await drawing.arrayBuffer())
      };
    }

    const fields = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      projectType: String(formData.get("projectType") || ""),
      description: String(formData.get("description") || ""),
      materialType: String(formData.get("materialType") || ""),
      quantity: String(formData.get("quantity") || ""),
      siteLocation: String(formData.get("siteLocation") || ""),
      drawing: drawingInfo
    };

    if (
      !fields.name ||
      !fields.phone ||
      !fields.email ||
      !fields.projectType ||
      !fields.description ||
      !fields.materialType ||
      !fields.siteLocation
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = await saveLead({
      kind: "quote",
      name: fields.name,
      phone: fields.phone,
      email: fields.email,
      company: fields.company,
      projectType: fields.projectType,
      description: fields.description,
      materialType: fields.materialType,
      quantity: fields.quantity,
      siteLocation: fields.siteLocation,
      drawing: drawingPayload
    });

    await sendInquiryEmail({
      subject: `Quote request: ${fields.projectType} from ${fields.name}`,
      fields: { leadId: id, ...fields }
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Quote submission failed", error);
    return NextResponse.json({ error: "Quote submission failed" }, { status: 500 });
  }
}
