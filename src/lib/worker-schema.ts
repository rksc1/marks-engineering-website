import { z } from "zod";

// Worker roles
export const workerRoles = ["welder", "helper", "supervisor"] as const;
export type WorkerRole = (typeof workerRoles)[number];

// Worker schema
export const WorkerSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  role: z.enum(workerRoles),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export type Worker = z.infer<typeof WorkerSchema>;

// Attendance status
export const attendanceStatuses = ["Present", "Half Day", "Absent"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];

// Attendance schema
export const AttendanceSchema = z.object({
  _id: z.string().optional(),
  workerId: z.string(),
  date: z.date(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  status: z.enum(attendanceStatuses).default("Absent"),
});

export type Attendance = z.infer<typeof AttendanceSchema>;

// Task status
export const taskStatuses = ["Pending", "In Progress", "Completed"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

// Task schema
export const TaskSchema = z.object({
  _id: z.string().optional(),
  workOrderId: z.string().optional(),
  workerId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(taskStatuses).default("Pending"),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Task = z.infer<typeof TaskSchema>;

// Wage type
export const wageTypes = ["daily", "weekly"] as const;
export type WageType = (typeof wageTypes)[number];

// Wage schema
export const WageSchema = z.object({
  _id: z.string().optional(),
  workerId: z.string(),
  date: z.date(),
  amount: z.number().positive(),
  type: z.enum(wageTypes),
  isPaid: z.boolean().default(false),
});

export type Wage = z.infer<typeof WageSchema>;

// Validation helpers
export function validateWorker(data: unknown): Worker {
  return WorkerSchema.parse(data);
}

export function validateAttendance(data: unknown): Attendance {
  return AttendanceSchema.parse(data);
}

export function validateTask(data: unknown): Task {
  return TaskSchema.parse(data);
}

export function validateWage(data: unknown): Wage {
  return WageSchema.parse(data);
}