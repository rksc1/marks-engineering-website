import { NextRequest, NextResponse } from "next/server";

import { addWorkProgressImages } from "@/lib/file-records";
import { storeMultipleWorkProgressUploads } from "@/lib/files";
import { requireWorkerAuth } from "@/lib/worker-auth";

export async function POST(request: NextRequest) {
  try {
    const worker = await requireWorkerAuth();
    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((file): file is File => file instanceof File && file.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "No progress images provided" }, { status: 400 });
    }

    const storedFiles = await storeMultipleWorkProgressUploads(files);
    const records = await addWorkProgressImages({
      workerId: worker._id!,
      taskId: String(formData.get("taskId") || "").trim() || null,
      workOrderId: String(formData.get("workOrderId") || "").trim() || null,
      files: storedFiles,
    });

    return NextResponse.json({
      success: true,
      images: records.map((record) => ({
        id: record._id?.toString(),
        workImageUrl: record.workImageUrl,
        publicId: record.publicId,
      })),
    });
  } catch (error) {
    console.error("Work progress image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
