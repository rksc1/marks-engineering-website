import path from "node:path";

import { CLOUDINARY_FOLDERS, uploadToCloudinary } from "@/lib/upload-file";

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".xlsx", ".xls", ".xltm"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.ms-excel.sheet.macroenabled.12",
  "application/octet-stream",
]);

export type StoredFile = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicId: string;
};

export async function storeQuoteUpload(file: File, folder = CLOUDINARY_FOLDERS.quotations): Promise<StoredFile> {
  return storeCloudinaryUpload(file, folder);
}

export async function storePurchaseOrderUpload(file: File): Promise<StoredFile> {
  return storeCloudinaryUpload(file, CLOUDINARY_FOLDERS.purchaseOrders);
}

export async function storeWorkProgressUpload(file: File): Promise<StoredFile> {
  validateImageUpload(file);
  return storeCloudinaryUpload(file, CLOUDINARY_FOLDERS.workProgress);
}

export async function storeWorkerDocumentUpload(file: File): Promise<StoredFile> {
  return storeCloudinaryUpload(file, CLOUDINARY_FOLDERS.workerDocuments);
}

export async function storeMultipleWorkProgressUploads(files: File[]): Promise<StoredFile[]> {
  return Promise.all(files.map((file) => storeWorkProgressUpload(file)));
}

export async function storeCloudinaryUpload(file: File, folder: string): Promise<StoredFile> {
  validateUpload(file);

  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await uploadToCloudinary(bytes, folder, { fileName: file.name });

  return {
    fileUrl: upload.secure_url,
    fileName: file.name,
    fileType: getFileType(file),
    fileSize: file.size,
    publicId: upload.public_id,
  };
}

function validateUpload(file: File) {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File must be 8MB or smaller");
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Only PDF, JPG, PNG, XLSX, XLS, and XLTM uploads are supported");
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported upload type");
  }
}

function validateImageUpload(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(extension)) {
    throw new Error("Work progress uploads must be JPG or PNG images");
  }
}

function getFileType(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (file.type) return file.type;
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (extension === ".xls") return "application/vnd.ms-excel";
  if (extension === ".xltm") return "application/vnd.ms-excel.sheet.macroenabled.12";
  return "application/octet-stream";
}
