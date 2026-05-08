"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ListTodo, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Task, Worker } from "@/lib/worker-schema";

interface AdminTasksProps {
  tasks: Task[];
  workers: Worker[];
  workerMap: Map<string, Worker>;
}

export default function AdminTasks({ tasks: initialTasks, workers }: AdminTasksProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    workerId: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ workerId: "", title: "", description: "" });
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create task");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      case "Pending":
        return "text-zinc-600 bg-zinc-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  return (
    <section className="bg-zinc-100 py-10">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-zinc-950">Task Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Assign Task
          </Button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Assign New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="workerId">Worker</Label>
                  <Select value={formData.workerId} onValueChange={(value) => setFormData({ ...formData, workerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.filter(w => w.isActive).map((worker) => (
                        <SelectItem key={worker._id} value={worker._id!}>
                          {worker.name} ({worker.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Assign Task"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="mt-8 grid gap-4">
          {initialTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-500">No tasks assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            initialTasks.map((task) => {
              const worker = workers.find(w => w._id === task.workerId);
              return (
                <Card key={task._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5" />
                        {task.title}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-zinc-400" />
                          <span className="font-semibold">{worker?.name || "Unknown Worker"}</span>
                          <span className="text-sm text-zinc-500">({worker?.role})</span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-zinc-600">{task.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-zinc-500">
                        <p>Created: {task.createdAt.toLocaleDateString()}</p>
                        <p>Updated: {task.updatedAt.toLocaleDateString()}</p>
                        {task.notes && (
                          <p className="mt-2 text-zinc-700">
                            <strong>Notes:</strong> {task.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
