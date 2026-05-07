import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveAttendance, rejectAttendance } from "@/lib/workers";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { attendanceId, action, adminId } = await request.json();

    if (!attendanceId || !action || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields: attendanceId, action, adminId" },
        { status: 400 }
      );
    }

    let result;
    if (action === "approve") {
      result = await approveAttendance(attendanceId, adminId);
    } else if (action === "reject") {
      result = await rejectAttendance(attendanceId, adminId);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      attendance: result
    });
  } catch (error) {
    console.error("Error processing attendance approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}