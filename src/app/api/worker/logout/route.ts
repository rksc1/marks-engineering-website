import { NextResponse } from "next/server";
import { destroyWorkerSession } from "@/lib/worker-auth";

export async function POST() {
  try {
    await destroyWorkerSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Worker logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}