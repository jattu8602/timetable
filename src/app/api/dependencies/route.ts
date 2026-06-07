import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  try {
    if (type === "department") {
      const rooms = await prisma.room.count({ where: { departmentId: id, deletedAt: null } });
      const courses = await prisma.course.count({ where: { departmentId: id, deletedAt: null } });
      const faculty = await prisma.faculty.count({ where: { departmentId: id, deletedAt: null } });
      
      const total = rooms + courses + faculty;
      
      if (total > 0) {
        return NextResponse.json({
          hasDependencies: true,
          message: `This department has ${rooms} active room(s), ${courses} active course(s), and ${faculty} active faculty attached. Deleting it will also hide them from view.`,
        });
      }
    } else if (type === "room") {
      const room = await prisma.room.findUnique({ where: { id } });
      if (room) {
        const slots = await prisma.timeSlot.count({
          where: { subjectDetails: { contains: room.number } }
        });
        
        if (slots > 0) {
          return NextResponse.json({
            hasDependencies: true,
            message: `This room (${room.number}) is currently scheduled for ${slots} class slot(s) in the timetable. Deleting it will remove it from the analytics dashboard.`,
          });
        }
      }
    }

    return NextResponse.json({ hasDependencies: false, message: "" });
  } catch (error: any) {
    console.error("Dependencies API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
