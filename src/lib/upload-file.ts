import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export const CLOUDINARY_FOLDERS = {
  purchaseOrders: "purchase-orders",
  quotations: "quotations",
  workProgress: "work-progress",
  workerDocuments: "worker-documents",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: CloudinaryFolder | string,
  options: { fileName?: string } = {}
): Promise<CloudinaryUploadResult> {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: options.fileName ? sanitizePublicId(options.fileName) : undefined,
          unique_filename: !options.fileName,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary upload failed"));
          resolve(toUploadResult(result));
        }
      )
      .end(fileBuffer);
  });
}

function assertCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured");
  }
}

function sanitizePublicId(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  const name = lastDot >= 0 ? fileName.slice(0, lastDot) : fileName;
  const extension = lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${Date.now()}-${safeName || "file"}${extension}`;
}

function toUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}
