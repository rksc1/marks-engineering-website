import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createWage } from "@/lib/workers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId, amount } = await request.json() as { workerId: string; amount: number };

    const wage = await createWage({
      workerId,
      date: new Date(),
      amount,
      type: "daily",
      isPaid: true,
    });

    return NextResponse.json({
      success: true,
      wage: {
        id: wage._id,
        workerId: wage.workerId,
        amount: wage.amount,
        date: wage.date,
        isPaid: wage.isPaid,
      },
    });
  } catch (error: unknown) {
    console.error("Create wage error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
