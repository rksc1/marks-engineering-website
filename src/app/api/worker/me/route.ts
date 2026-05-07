import { NextResponse } from "next/server";
import { requireWorkerAuth } from "@/lib/worker-auth";

export async function GET() {
  try {
    const worker = await requireWorkerAuth();

    return NextResponse.json({
      worker: {
        id: worker._id,
        name: worker.name,
        phone: worker.phone,
        role: worker.role,
      },
    });
  } catch (error) {
    console.error("Worker me error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}