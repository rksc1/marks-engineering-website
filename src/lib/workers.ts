import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  Worker,
  Attendance,
  Task,
  Wage,
  validateWorker,
  validateAttendance,
  validateTask,
  validateWage,
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

// Utility functions
export function buildWorkerMap(workers: Worker[]) {
  return new Map(
    workers
      .filter((w): w is Worker & { _id: string } => typeof w._id === "string")
      .map((worker) => [worker._id, worker])
  );
}

export async function calculateWorkerWage(workerId: string, startDate: Date, endDate: Date): Promise<number> {
  const attendance = await getWorkerAttendance(workerId);
  const relevantAttendance = attendance.filter(
    (a) => a.date >= startDate && a.date <= endDate && a.status === "Present"
  );
  // Assuming daily wage of 500 for calculation - this should be configurable
  return relevantAttendance.length * 500;
}