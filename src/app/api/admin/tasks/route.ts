import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createTask } from "@/lib/workers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId, title, description } = await request.json() as {
      workerId: string;
      title: string;
      description?: string;
    };

    const task = await createTask({
      workerId,
      title,
      description,
      status: "Pending",
    });

    return NextResponse.json({
      success: true,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        workerId: task.workerId,
        createdAt: task.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
