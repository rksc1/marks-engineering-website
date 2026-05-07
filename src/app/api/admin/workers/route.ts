import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createWorker, updateWorker } from "@/lib/workers";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, role, pin, dailyWage, paymentType } = await request.json();

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
  } catch (error: any) {
    console.error("Create worker error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}