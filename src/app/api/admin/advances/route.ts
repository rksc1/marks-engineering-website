import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createWorkerAdvance, getWorkerAdvances, getAllWorkerAdvances } from "@/lib/workers";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId, amount, note } = await request.json();

    if (!workerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields: workerId, amount (must be positive)" },
        { status: 400 }
      );
    }

    const advance = await createWorkerAdvance({
      workerId,
      amount,
      note: note || "",
    });

    return NextResponse.json({
      success: true,
      advance
    });
  } catch (error) {
    console.error("Error creating worker advance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    let advances;
    if (workerId) {
      advances = await getWorkerAdvances(workerId);
    } else {
      advances = await getAllWorkerAdvances();
    }

    return NextResponse.json({
      success: true,
      advances
    });
  } catch (error) {
    console.error("Error fetching worker advances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}