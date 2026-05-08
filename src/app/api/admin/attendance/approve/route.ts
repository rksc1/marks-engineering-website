import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveAttendance, rejectAttendance } from "@/lib/workers";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { attendanceId, action, approvalType, adminId } = await request.json();

    if (!attendanceId || !action || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields: attendanceId, action, adminId" },
        { status: 400 }
      );
    }

    let result;
    if (action === "approve") {
      // approvalType should be "present", "half-day", or "absent"
      const type = (approvalType || "present") as "present" | "half-day" | "absent";
      if (!["present", "half-day", "absent"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid approvalType. Must be 'present', 'half-day', or 'absent'" },
          { status: 400 }
        );
      }
      result = await approveAttendance(attendanceId, adminId, type);
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
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("check-in and check-out") ? 400 : 500 }
    );
  }
}
