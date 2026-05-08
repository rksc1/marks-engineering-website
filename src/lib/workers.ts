import { ObjectId, type Filter } from "mongodb";
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
} from "./worker-schema";

type AttendanceDocument = Omit<Attendance, "_id"> & {
  _id?: ObjectId;
};

// Worker operations
export async function createWorker(data: Omit<Worker, "_id" | "createdAt">): Promise<Worker> {
  const db = await getDb();
  const normalizedPhone = normalizePhone(data.phone);
  const existingWorker = await db.collection("workers").findOne({ phone: normalizedPhone });
  if (existingWorker) {
    throw new Error("This mobile number is already assigned to a worker");
  }

  const existingCustomer = await db.collection("customers").findOne({ phone: normalizedPhone });
  if (existingCustomer) {
    throw new Error("This mobile number is already registered as a customer");
  }

  const validated = validateWorker({ ...data, phone: normalizedPhone });
  const result = await db.collection("workers").insertOne({
    name: validated.name,
    phone: validated.phone,
    role: validated.role,
    pin: validated.pin,
    dailyWage: validated.dailyWage,
    paymentType: validated.paymentType,
    totalAdvance: validated.totalAdvance,
    isActive: validated.isActive,
    createdAt: validated.createdAt,
  });
  return { ...validated, _id: result.insertedId.toString() };
}

export async function getWorkerById(id: string): Promise<Worker | null> {
  const db = await getDb();
  const worker = await db.collection("workers").findOne({ _id: new ObjectId(id) });
  return worker ? validateWorker({ ...worker, _id: worker._id.toString() }) : null;
}

export async function getWorkerByPhone(phone: string): Promise<Worker | null> {
  const db = await getDb();
  const normalizedPhone = normalizePhone(phone);
  const worker = await db.collection("workers").findOne({ phone: normalizedPhone, isActive: true });
  return worker ? validateWorker({ ...worker, _id: worker._id.toString() }) : null;
}

export async function updateWorker(id: string, updates: Partial<Worker>): Promise<Worker | null> {
  const db = await getDb();
  const normalizedUpdates = { ...updates };
  if (updates.phone) {
    const normalizedPhone = normalizePhone(updates.phone);
    const existingWorker = await db.collection("workers").findOne({ phone: normalizedPhone, _id: { $ne: new ObjectId(id) } });
    if (existingWorker) {
      throw new Error("This mobile number is already assigned to another worker");
    }

    const existingCustomer = await db.collection("customers").findOne({ phone: normalizedPhone });
    if (existingCustomer) {
      throw new Error("This mobile number is already registered as a customer");
    }

    normalizedUpdates.phone = normalizedPhone;
  }

  const result = await db.collection("workers").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...normalizedUpdates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) {
    return null;
  }
  return validateWorker({ ...result, _id: result._id.toString() });
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
  const result = await db.collection("attendance").insertOne({
    workerId: validated.workerId,
    date: validated.date,
    checkIn: validated.checkIn,
    checkOut: validated.checkOut,
    status: validated.status,
    isApproved: validated.isApproved,
    approvedBy: validated.approvedBy,
    approvedAt: validated.approvedAt,
  });
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

  if (!result) {
    return null;
  }

  return validateAttendance({ ...result, _id: result._id.toString() });
}

export async function getWorkerAttendance(workerId: string, date?: Date): Promise<Attendance[]> {
  const db = await getDb();
  const query: Filter<AttendanceDocument> = { workerId };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const attendance = await db.collection<AttendanceDocument>("attendance").find(query).toArray();
  return attendance.map((a) => validateAttendance({ ...a, _id: a._id.toString() }));
}

export async function getAllAttendance(date?: Date): Promise<Attendance[]> {
  const db = await getDb();
  const query: Filter<AttendanceDocument> = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const attendance = await db.collection<AttendanceDocument>("attendance").find(query).toArray();
  return attendance.map((a) => validateAttendance({ ...a, _id: a._id.toString() }));
}

// Task operations
export async function createTask(data: Omit<Task, "_id" | "createdAt" | "updatedAt" | "status"> & Partial<Pick<Task, "status">>): Promise<Task> {
  const db = await getDb();
  const validated = validateTask(data);
  const result = await db.collection("tasks").insertOne({
    workOrderId: validated.workOrderId,
    workerId: validated.workerId,
    title: validated.title,
    description: validated.description,
    status: validated.status,
    notes: validated.notes,
    createdAt: validated.createdAt,
    updatedAt: validated.updatedAt,
  });
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
  if (!result) {
    return null;
  }
  return validateTask({ ...result, _id: result._id.toString() });
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
  const result = await db.collection("wages").insertOne({
    workerId: validated.workerId,
    date: validated.date,
    amount: validated.amount,
    type: validated.type,
    isPaid: validated.isPaid,
  });
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
  if (!result) {
    return null;
  }
  return validateWage({ ...result, _id: result._id.toString() });
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
  const result = await db.collection("workerAdvances").insertOne({
    workerId: validated.workerId,
    amount: validated.amount,
    note: validated.note,
    createdAt: validated.createdAt,
  });
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
export async function approveAttendance(attendanceId: string, adminId: string, approvalType: "present" | "half-day" | "absent" = "present"): Promise<Attendance | null> {
  const db = await getDb();
  const attendance = await db.collection("attendance").findOne({ _id: new ObjectId(attendanceId) });
  if (!attendance) {
    return null;
  }

  if (approvalType !== "absent" && (!attendance.checkIn || !attendance.checkOut)) {
    throw new Error("Attendance can be approved for payment only after worker check-in and check-out are completed");
  }

  const statusMap = {
    "present": "Present",
    "half-day": "Half Day",
    "absent": "Absent"
  };
  
  const result = await db.collection("attendance").findOneAndUpdate(
    { _id: new ObjectId(attendanceId) },
    {
      $set: {
        status: statusMap[approvalType],
        isApproved: approvalType !== "absent",
        approvedBy: adminId,
        approvedAt: new Date()
      }
    },
    { returnDocument: "after" }
  );
  if (!result) {
    return null;
  }
  return validateAttendance({ ...result, _id: result._id.toString() });
}

export async function rejectAttendance(attendanceId: string, adminId: string): Promise<Attendance | null> {
  const db = await getDb();
  const result = await db.collection("attendance").findOneAndUpdate(
    { _id: new ObjectId(attendanceId) },
    {
      $set: {
        status: "Absent",
        isApproved: false,
        approvedBy: adminId,
        approvedAt: new Date()
      }
    },
    { returnDocument: "after" }
  );
  if (!result) {
    return null;
  }
  return validateAttendance({ ...result, _id: result._id.toString() });
}

export async function getApprovedAttendanceCount(workerId: string, startDate?: Date, endDate?: Date): Promise<number> {
  const db = await getDb();
  const query: Filter<AttendanceDocument> = {
    workerId,
    status: "Present",
    isApproved: true,
    checkIn: { $exists: true },
    checkOut: { $exists: true }
  };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  const count = await db.collection<AttendanceDocument>("attendance").countDocuments(query);
  return count;
}

export async function getHalfDayAttendanceCount(workerId: string, startDate?: Date, endDate?: Date): Promise<number> {
  const db = await getDb();
  const query: Filter<AttendanceDocument> = {
    workerId,
    status: "Half Day",
    isApproved: true,
    checkIn: { $exists: true },
    checkOut: { $exists: true }
  };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  const count = await db.collection<AttendanceDocument>("attendance").countDocuments(query);
  return count;
}

export async function getAttendanceSummary(workerId: string, startDate?: Date, endDate?: Date): Promise<{
  fullDays: number;
  halfDays: number;
  absentDays: number;
}> {
  const db = await getDb();
  const query: Filter<AttendanceDocument> = { workerId };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  const payableQuery = { ...query, isApproved: true, checkIn: { $exists: true }, checkOut: { $exists: true } };
  const fullDays = await db.collection<AttendanceDocument>("attendance").countDocuments({ ...payableQuery, status: "Present" });
  const halfDays = await db.collection<AttendanceDocument>("attendance").countDocuments({ ...payableQuery, status: "Half Day" });
  const absentDays = await db.collection<AttendanceDocument>("attendance").countDocuments({ ...query, status: "Absent" });
  
  return { fullDays, halfDays, absentDays };
}

// Payout summary
export async function getWorkerPayoutSummary(workerId: string, startDate: Date, endDate: Date): Promise<{
  totalWage: number;
  totalAdvance: number;
  netPayable: number;
  fullDays: number;
  halfDays: number;
}> {
  const worker = await getWorkerById(workerId);
  if (!worker) {
    throw new Error("Worker not found");
  }

  const fullDays = await getApprovedAttendanceCount(workerId, startDate, endDate);
  const halfDays = await getHalfDayAttendanceCount(workerId, startDate, endDate);
  const totalWage = (fullDays * worker.dailyWage) + (halfDays * worker.dailyWage * 0.5);
  const totalAdvance = await getTotalWorkerAdvance(workerId);
  const netPayable = totalWage - totalAdvance;

  return {
    totalWage,
    totalAdvance,
    netPayable,
    fullDays,
    halfDays
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

  const fullDays = await getApprovedAttendanceCount(workerId, startDate, endDate);
  const halfDays = await getHalfDayAttendanceCount(workerId, startDate, endDate);
  
  // Full day = 100% wage, Half day = 50% wage
  return (fullDays * worker.dailyWage) + (halfDays * worker.dailyWage * 0.5);
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}
