import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateWorker } from "@/lib/workers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId } = await params;
    const { isActive } = await request.json();

    const worker = await updateWorker(workerId, { isActive });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.name,
        isActive: worker.isActive,
      },
    });
  } catch (error: any) {
    console.error("Update worker error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}