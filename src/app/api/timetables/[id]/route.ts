import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await prisma.timetable.findUnique({
    where: { id, deletedAt: null },
    include: {
      department: true,
      branch: true,
      slots: { orderBy: [{ dayOfWeek: "asc" }, { periodName: "asc" }] },
    },
  });
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Fetch courses scoped to this branch and semester
  const courses = await prisma.course.findMany({
    where: {
      branchId: data.branchId,
      semester: data.semesterName,
      deletedAt: null,
    },
    include: {
      faculty: {
        include: {
          faculty: true,
        },
      },
    },
  });

  const formattedCourses = courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    credits: c.credits,
    type: c.type,
    courseType: c.courseType,
    teacher: c.faculty.map((f) => f.faculty.name).join(" & ") || "TBA",
  }));

  return NextResponse.json({
    ...data,
    department: data.department ? { name: data.department.name, shortCode: data.department.shortCode } : null,
    branch: data.branch ? { name: data.branch.name, program: data.branch.program } : null,
    slots: data.slots,
    courses: formattedCourses,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["DRAFT", "PUBLISHED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.timetable.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
