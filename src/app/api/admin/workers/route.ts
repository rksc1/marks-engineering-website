import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createWorker } from "@/lib/workers";
import type { PaymentType, WorkerRole } from "@/lib/worker-schema";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, role, pin, dailyWage, paymentType } = await request.json() as {
      name: string;
      phone: string;
      role: WorkerRole;
      pin: string;
      dailyWage: number;
      paymentType: PaymentType;
    };

    const worker = await createWorker({
      name,
      phone,
      role,
      pin,
      dailyWage,
      paymentType,
      totalAdvance: 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.name,
        phone: worker.phone,
        role: worker.role,
        isActive: worker.isActive,
      },
    });
  } catch (error: unknown) {
    console.error("Create worker error:", error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: message.includes("already") ? 409 : 500 });
  }
}
