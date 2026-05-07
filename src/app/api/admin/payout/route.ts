import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWorkerPayoutSummary } from "@/lib/workers";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!workerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required query parameters: workerId, startDate, endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO date strings." },
        { status: 400 }
      );
    }

    const summary = await getWorkerPayoutSummary(workerId, start, end);

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("Error fetching payout summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}