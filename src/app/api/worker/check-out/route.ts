import { NextResponse } from "next/server";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { checkOut } from "@/lib/workers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST() {
  try {
    const worker = await requireWorkerAuth();

    const attendance = await checkOut(worker._id!);

    if (!attendance) {
      return NextResponse.json({ error: "No active check-in found" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      attendance: {
        id: attendance._id,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: attendance.status,
      },
    });
  } catch (error: unknown) {
    console.error("Worker check-out error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
