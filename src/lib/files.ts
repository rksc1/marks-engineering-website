import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".dwg"]);
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "application/acad", "image/vnd.dwg", "application/octet-stream"]);

export type StoredFile = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export async function storeQuoteUpload(file: File, folder = "quotes"): Promise<StoredFile> {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File must be 8MB or smaller");
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Only PDF, JPG, PNG, and DWG uploads are supported");
  }

  if (file.type && !allowedMimeTypes.has(file.type) && extension !== ".dwg") {
    throw new Error("Unsupported upload type");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const safeBaseName = path
    .basename(file.name, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const storedName = `${Date.now()}-${randomUUID()}-${safeBaseName || "drawing"}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, storedName), bytes);

  return {
    fileUrl: `/uploads/${folder}/${storedName}`,
    fileName: file.name,
    fileType: file.type || (extension === ".dwg" ? "application/acad" : "application/octet-stream"),
    fileSize: file.size
  };
}
