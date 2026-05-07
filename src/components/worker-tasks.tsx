"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Worker, Task } from "@/lib/worker-schema";

interface WorkerTasksProps {
  worker: Worker;
  tasks: Task[];
}

export default function WorkerTasks({ worker, tasks }: WorkerTasksProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleStatusUpdate = async (taskId: string, status: string) => {
    setUpdating(taskId);
    try {
      const response = await fetch("/api/worker/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          status,
          notes: notes[taskId] || "",
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-blue-600";
      case "Pending":
        return "text-zinc-600";
      default:
        return "text-zinc-600";
    }
  };

  return (
    <section className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/worker/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-zinc-950">My Tasks</h1>
            <p className="text-sm text-zinc-600">Assigned work orders and tasks</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-500">No tasks assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <span className={`text-sm font-normal ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {task.description && (
                    <p className="mb-4 text-sm text-zinc-600">{task.description}</p>
                  )}

                  {/* Notes */}
                  {task.status !== "Completed" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Add Notes
                      </label>
                      <Textarea
                        value={notes[task._id!] || task.notes || ""}
                        onChange={(e) => setNotes({ ...notes, [task._id!]: e.target.value })}
                        placeholder="Add any notes or updates..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {task.status === "Pending" && (
                      <Button
                        onClick={() => handleStatusUpdate(task._id!, "In Progress")}
                        disabled={updating === task._id}
                        className="flex-1 py-6 text-lg"
                        size="lg"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Start Work
                      </Button>
                    )}

                    {task.status === "In Progress" && (
                      <Button
                        onClick={() => handleStatusUpdate(task._id!, "Completed")}
                        disabled={updating === task._id}
                        className="flex-1 py-6 text-lg bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Mark Complete
                      </Button>
                    )}

                    {task.status === "Completed" && (
                      <div className="flex-1 rounded bg-green-50 p-4 text-center text-green-800">
                        <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                        <p className="font-semibold">Task Completed</p>
                        {task.notes && (
                          <p className="text-sm mt-1">{task.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}