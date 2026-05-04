import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDrawing } from "@/lib/leads";

export async function GET(_request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId } = await params;
    const drawing = await getDrawing(leadId);

    if (!drawing) {
      return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(drawing.data), {
      headers: {
        "Content-Type": drawing.type,
        "Content-Length": String(drawing.size),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(drawing.name)}"`
      }
    });
  } catch (error) {
    console.error("Drawing download failed", error);
    return NextResponse.json({ error: "Drawing download failed" }, { status: 500 });
  }
}
