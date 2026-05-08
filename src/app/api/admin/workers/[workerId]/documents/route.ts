import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addWorkerDocuments } from "@/lib/file-records";
import { storeWorkerDocumentUpload } from "@/lib/files";
import { getWorkerById } from "@/lib/workers";

type WorkerDocumentRouteProps = {
  params: Promise<{ workerId: string }>;
};

export async function POST(request: NextRequest, { params }: WorkerDocumentRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workerId } = await params;
    const worker = await getWorkerById(workerId);

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData
      .getAll("documents")
      .filter((file): file is File => file instanceof File && file.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "No worker documents provided" }, { status: 400 });
    }

    const storedFiles = await Promise.all(files.map((file) => storeWorkerDocumentUpload(file)));
    const records = await addWorkerDocuments({
      workerId,
      documentType: String(formData.get("documentType") || "").trim() || null,
      files: storedFiles,
    });

    return NextResponse.json({
      success: true,
      documents: records.map((record) => ({
        id: record._id?.toString(),
        workerDocumentUrl: record.workerDocumentUrl,
        publicId: record.publicId,
      })),
    });
  } catch (error) {
    console.error("Worker document upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
