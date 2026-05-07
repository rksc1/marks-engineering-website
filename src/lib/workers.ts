import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  Worker,
  Attendance,
  Task,
  Wage,
  WorkerAdvance,
  validateWorker,
  validateAttendance,
  validateTask,
  validateWage,
  validateWorkerAdvance,
  WorkerRole,
  AttendanceStatus,
  TaskStatus,
  WageType,
} from "./worker-schema";

// Worker operations
export async function createWorker(data: Omit<Worker, "_id" | "createdAt">): Promise<Worker> {
  const db = await getDb();
  const validated = validateWorker(data);
  const { _id, ...workerToInsert } = validated;
  const result = await db.collection("workers").insertOne(workerToInsert);
  return { ...validated, _id: result.insertedId.toString() };
}

export async function getWorkerById(id: string): Promise<Worker | null> {
  const db = await getDb();
  const worker = await db.collection("workers").findOne({ _id: new ObjectId(id) });
  return worker ? validateWorker({ ...worker, _id: worker._id.toString() }) : null;
}

export async function getWorkerByPhone(phone: string): Promise<Worker | null> {
  const db = await getDb();
  const worker = await db.collection("workers").findOne({ phone, isActive: true });
  return worker ? validateWorker({ ...worker, _id: worker._id.toString() }) : null;
}

export async function updateWorker(id: string, updates: Partial<Worker>): Promise<Worker | null> {
  const db = await getDb();
  const result = await db.collection("workers").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result || !result.value) {
    return null;
  }
  return validateWorker({ ...result.value, _id: result.value._id.toString() });
}

export async function getAllWorkers(): Promise<Worker[]> {
  const db = await getDb();
  const workers = await db.collection("workers").find({}).toArray();
  return workers.map((w) => validateWorker({ ...w, _id: w._id.toString() }));
}

// Attendance operations
export async function checkIn(workerId: string): Promise<Attendance> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.collection("attendance").findOne({
    workerId,
    date: today,
  });

  if (existing) {
    throw new Error("Already checked in today");
  }

  const attendance: Omit<Attendance, "_id"> = {
    workerId,
    date: today,
    checkIn: new Date(),
    status: "Present",
    isApproved: false,
  };

  const validated = validateAttendance(attendance);
  const { _id, ...attendanceToInsert } = validated;
  const result = await db.collection("attendance").insertOne(attendanceToInsert);
  return { ...validated, _id: result.insertedId.toString() };
}

export async function checkOut(workerId: string): Promise<Attendance | null> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First check if there's an attendance record for today with check-in but no check-out
  const existingAttendance = await db.collection("attendance").findOne({
    workerId,
    date: today,
    checkIn: { $exists: true },
    checkOut: { $exists: false }
  });

  if (!existingAttendance) {
    throw new Error("Cannot check out: no check-in found for today or already checked out");
  }

  const result = await db.collection("attendance").findOneAndUpdate(
    { workerId, date: today, checkOut: { $exists: false } },
    { $set: { checkOut: new Date() } },
    { returnDocument: "after" }
  );

  if (!result || !result.value) {
    return null;
  }

  return validateAttendance({ ...result.value, _id: result.value._id.toString() });
}

export async function getWorkerAttendance(workerId: string, date?: Date): Promise<Attendance[]> {
  const db = await getDb();
  const query: any = { workerId };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const attendance = await db.collection("attendance").find(query).toArray();
  return attendance.map((a) => validateAttendance({ ...a, _id: a._id.toString() }));
}

export async function getAllAttendance(date?: Date): Promise<Attendance[]> {
  const db = await getDb();
  const query: any = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const attendance = await db.collection("attendance").find(query).toArray();
  return attendance.map((a) => validateAttendance({ ...a, _id: a._id.toString() }));
}

// Task operations
export async function createTask(data: Omit<Task, "_id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<Task, "status">>): Promise<Task> {
  const db = await getDb();
  const validated = validateTask(data);
  const { _id, ...taskToInsert } = validated;
  const result = await db.collection("tasks").insertOne(taskToInsert);
  return { ...validated, _id: result.insertedId.toString() };
}

export async function getWorkerTasks(workerId: string): Promise<Task[]> {
  const db = await getDb();
  const tasks = await db.collection("tasks").find({ workerId }).toArray();
  return tasks.map((t) => validateTask({ ...t, _id: t._id.toString() }));
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const db = await getDb();
  const result = await db.collection("tasks").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result || !result.value) {
    return null;
  }
  return validateTask({ ...result.value, _id: result.value._id.toString() });
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  const tasks = await db.collection("tasks").find({}).toArray();
  return tasks.map((t) => validateTask({ ...t, _id: t._id.toString() }));
}

// Wage operations
export async function createWage(data: Omit<Wage, "_id">): Promise<Wage> {
  const db = await getDb();
  const validated = validateWage(data);
  const { _id, ...wageToInsert } = validated;
  const result = await db.collection("wages").insertOne(wageToInsert);
  return { ...validated, _id: result.insertedId.toString() };
}

export async function getWorkerWages(workerId: string): Promise<Wage[]> {
  const db = await getDb();
  const wages = await db.collection("wages").find({ workerId }).toArray();
  return wages.map((w) => validateWage({ ...w, _id: w._id.toString() }));
}

export async function markWagePaid(id: string): Promise<Wage | null> {
  const db = await getDb();
  const result = await db.collection("wages").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isPaid: true } },
    { returnDocument: "after" }
  );
  if (!result || !result.value) {
    return null;
  }
  return validateWage({ ...result.value, _id: result.value._id.toString() });
}

export async function getAllWages(): Promise<Wage[]> {
  const db = await getDb();
  const wages = await db.collection("wages").find({}).toArray();
  return wages.map((w) => validateWage({ ...w, _id: w._id.toString() }));
}

// Worker Advance operations
export async function createWorkerAdvance(data: Omit<WorkerAdvance, "_id" | "createdAt">): Promise<WorkerAdvance> {
  const db = await getDb();
  const validated = validateWorkerAdvance(data);
  const { _id, ...advanceToInsert } = validated;
  const result = await db.collection("workerAdvances").insertOne(advanceToInsert);
  return { ...validated, _id: result.insertedId.toString() };
}

export async function getWorkerAdvances(workerId: string): Promise<WorkerAdvance[]> {
  const db = await getDb();
  const advances = await db.collection("workerAdvances").find({ workerId }).toArray();
  return advances.map((a) => validateWorkerAdvance({ ...a, _id: a._id.toString() }));
}

export async function getAllWorkerAdvances(): Promise<WorkerAdvance[]> {
  const db = await getDb();
  const advances = await db.collection("workerAdvances").find({}).toArray();
  return advances.map((a) => validateWorkerAdvance({ ...a, _id: a._id.toString() }));
}

export async function getTotalWorkerAdvance(workerId: string): Promise<number> {
  const advances = await getWorkerAdvances(workerId);
  return advances.reduce((total, advance) => total + advance.amount, 0);
}

// Attendance approval operations
export async function approveAttendance(attendanceId: string, adminId: string): Promise<Attendance | null> {
  const db = await getDb();
  const result = await db.collection("attendance").findOneAndUpdate(
    { _id: new ObjectId(attendanceId) },
    {
      $set: {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date()
      }
    },
    { returnDocument: "after" }
  );
  if (!result || !result.value) {
    return null;
  }
  return validateAttendance({ ...result.value, _id: result.value._id.toString() });
}

export async function rejectAttendance(attendanceId: string, adminId: string): Promise<Attendance | null> {
  const db = await getDb();
  const result = await db.collection("attendance").findOneAndUpdate(
    { _id: new ObjectId(attendanceId) },
    {
      $set: {
        isApproved: false,
        approvedBy: adminId,
        approvedAt: new Date()
      }
    },
    { returnDocument: "after" }
  );
  if (!result || !result.value) {
    return null;
  }
  return validateAttendance({ ...result.value, _id: result.value._id.toString() });
}

export async function getApprovedAttendanceCount(workerId: string, startDate?: Date, endDate?: Date): Promise<number> {
  const db = await getDb();
  const query: any = { workerId, isApproved: true };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  const count = await db.collection("attendance").countDocuments(query);
  return count;
}

// Payout summary
export async function getWorkerPayoutSummary(workerId: string, startDate: Date, endDate: Date): Promise<{
  totalWage: number;
  totalAdvance: number;
  netPayable: number;
  approvedDays: number;
}> {
  const worker = await getWorkerById(workerId);
  if (!worker) {
    throw new Error("Worker not found");
  }

  const approvedDays = await getApprovedAttendanceCount(workerId, startDate, endDate);
  const totalWage = approvedDays * worker.dailyWage;
  const totalAdvance = await getTotalWorkerAdvance(workerId);
  const netPayable = totalWage - totalAdvance;

  return {
    totalWage,
    totalAdvance,
    netPayable,
    approvedDays
  };
}

// Utility functions
export function buildWorkerMap(workers: Worker[]) {
  return new Map(
    workers
      .filter((w): w is Worker & { _id: string } => typeof w._id === "string")
      .map((worker) => [worker._id, worker])
  );
}

export async function calculateWorkerWage(workerId: string, startDate: Date, endDate: Date): Promise<number> {
  const worker = await getWorkerById(workerId);
  if (!worker) return 0;

  const approvedDays = await getApprovedAttendanceCount(workerId, startDate, endDate);
  return approvedDays * worker.dailyWage;
}