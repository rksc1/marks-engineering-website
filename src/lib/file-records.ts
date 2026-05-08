import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import type { StoredFile } from "@/lib/files";

export type WorkProgressImageDocument = {
  _id?: ObjectId;
  workerId: string;
  taskId?: string | null;
  workOrderId?: string | null;
  workImageUrl: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
};

export type WorkerDocumentDocument = {
  _id?: ObjectId;
  workerId: string;
  documentType?: string | null;
  workerDocumentUrl: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
};

export async function addWorkProgressImages(input: {
  workerId: string;
  taskId?: string | null;
  workOrderId?: string | null;
  files: StoredFile[];
}) {
  if (input.files.length === 0) return [];

  const db = await getDb();
  const createdAt = new Date();
  const documents: WorkProgressImageDocument[] = input.files.map((file) => ({
    workerId: input.workerId,
    taskId: input.taskId || null,
    workOrderId: input.workOrderId || null,
    workImageUrl: file.fileUrl,
    publicId: file.publicId,
    fileName: file.fileName,
    fileType: file.fileType,
    fileSize: file.fileSize,
    createdAt,
  }));

  await db.collection<WorkProgressImageDocument>("work_progress_images").insertMany(documents);
  return documents;
}

export async function addWorkerDocuments(input: {
  workerId: string;
  documentType?: string | null;
  files: StoredFile[];
}) {
  if (input.files.length === 0) return [];

  const db = await getDb();
  const createdAt = new Date();
  const documents: WorkerDocumentDocument[] = input.files.map((file) => ({
    workerId: input.workerId,
    documentType: input.documentType || null,
    workerDocumentUrl: file.fileUrl,
    publicId: file.publicId,
    fileName: file.fileName,
    fileType: file.fileType,
    fileSize: file.fileSize,
    createdAt,
  }));

  await db.collection<WorkerDocumentDocument>("worker_documents").insertMany(documents);
  return documents;
}
