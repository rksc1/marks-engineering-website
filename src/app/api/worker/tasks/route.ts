import { NextRequest, NextResponse } from "next/server";
import { requireWorkerAuth } from "@/lib/worker-auth";
import { getWorkerTasks, updateTask } from "@/lib/workers";

export async function GET() {
  try {
    const worker = await requireWorkerAuth();

    const tasks = await getWorkerTasks(worker._id!);

    return NextResponse.json({
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        notes: task.notes,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Worker tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const worker = await requireWorkerAuth();
    const { taskId, status, notes } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updates: any = { status };
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const task = await updateTask(taskId, updates);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task._id,
        title: task.title,
        status: task.status,
        notes: task.notes,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error) {
    console.error("Worker task update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}