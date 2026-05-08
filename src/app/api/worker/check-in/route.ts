import { NextResponse } from "next/server";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { checkIn } from "@/lib/workers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST() {
  try {
    const worker = await requireWorkerAuth();

    const attendance = await checkIn(worker._id!);

    return NextResponse.json({
      success: true,
      attendance: {
        id: attendance._id,
        date: attendance.date,
        checkIn: attendance.checkIn,
        status: attendance.status,
      },
    });
  } catch (error: unknown) {
    console.error("Worker check-in error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
