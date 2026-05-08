import { NextRequest, NextResponse } from "next/server";
import { authenticateWorker, createWorkerSession } from "@/lib/worker-auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !pin) {
      return NextResponse.json({ error: "Phone and PIN are required" }, { status: 400 });
    }

    const worker = await authenticateWorker(phone, pin);
    if (!worker) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createWorkerSession(worker);

    return NextResponse.json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.name,
        role: worker.role,
      },
    });
  } catch (error) {
    console.error("Worker login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
