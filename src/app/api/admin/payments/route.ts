import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createWage } from "@/lib/workers";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId, amount } = await request.json();

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
  } catch (error: any) {
    console.error("Create wage error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}