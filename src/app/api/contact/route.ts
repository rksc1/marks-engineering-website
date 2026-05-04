import { NextResponse } from "next/server";

import { sendInquiryEmail } from "@/lib/email";
import { saveLead } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "");
    const phone = String(formData.get("phone") || "");
    const email = String(formData.get("email") || "");
    const company = String(formData.get("company") || "");
    const message = String(formData.get("message") || "");
    const source = String(formData.get("source") || "website");

    if (!name || !phone || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = await saveLead({
      kind: "contact",
      name,
      phone,
      email,
      company,
      message,
      source
    });

    await sendInquiryEmail({
      subject: `New inquiry from ${name}`,
      fields: { leadId: id, source, name, phone, email, company, message }
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Contact submission failed", error);
    return NextResponse.json({ error: "Contact submission failed" }, { status: 500 });
  }
}
