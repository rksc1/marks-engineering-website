import { NextRequest, NextResponse } from "next/server";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { getWorkerAttendance } from "@/lib/workers";

export async function GET(request: NextRequest) {
  try {
    const worker = await requireWorkerAuth();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    let date: Date | undefined;
    if (dateParam) {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
    }

    const attendance = await getWorkerAttendance(worker._id!, date);

    return NextResponse.json({
      attendance: attendance.map((a) => ({
        id: a._id,
        date: a.date,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("Worker attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}