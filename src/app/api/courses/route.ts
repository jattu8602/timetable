import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.course.findMany({
    where: { deletedAt: null },
    include: { department: true, branch: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.rows) {
    let created = 0;
    const errors: string[] = [];
    for (let i = 0; i < body.rows.length; i++) {
      const r = body.rows[i];
      const code = r.code || r.Code || r.COURSE_CODE || "";
      const branchId = r.branchId || r.BranchId || r.BRANCH_ID || "";
      const semester = r.semester || r.Semester || r.SEMESTER || "";
      if (!code || !branchId) { errors.push(`Row ${i + 1}: missing code or branchId`); continue; }
      try {
        await prisma.course.upsert({
          where: { code_branchId_semester: { code, branchId, semester } },
          update: { name: r.name || r.Name || code, credits: parseFloat(r.credits || "0") || 0 },
          create: { code, name: r.name || r.Name || code, credits: parseFloat(r.credits || "0") || 0, type: (r.type || "lecture").toLowerCase(), courseType: r.courseType || r.type || "", branchId, semester, departmentId: r.departmentId || "" },
        });
        created++;
      } catch (e: any) { errors.push(`Row ${i + 1}: ${e.message}`); }
    }
    return NextResponse.json({ created, errors }, { status: 201 });
  }
  const { code, name, credits, type, courseType, branchId, semester, departmentId, teacher } = body;
  if (!code || !name || credits == null || !type || !branchId || !semester || !departmentId) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }
  const data = await prisma.course.create({
    data: { code, name, credits, type, courseType: courseType ?? type, branchId, semester, departmentId },
  });
  await assignFacultyToCourse(data.id, teacher || "TBA", departmentId);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, code, name, credits, type, courseType, branchId, semester, departmentId, teacher } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.course.update({
    where: { id },
    data: { code, name, credits, type, courseType, branchId, semester, departmentId },
  });
  if (teacher !== undefined) {
    await assignFacultyToCourse(data.id, teacher, departmentId);
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.course.update({
    where: { id },
    data: { deletedAt: null },
  });
  return NextResponse.json(data);
}

async function assignFacultyToCourse(courseId: string, teacherStr: string, departmentId: string) {
  if (!teacherStr || teacherStr === "TBA") {
    await prisma.courseFaculty.deleteMany({ where: { courseId } });
    return;
  }

  // Split teachers by "&", "/", or ","
  const teachers = teacherStr.split(/[&/,]/).map(t => t.trim()).filter(Boolean);

  // Delete existing associations
  await prisma.courseFaculty.deleteMany({ where: { courseId } });

  for (const t of teachers) {
    const emailPart = t.toLowerCase().replace(/[^a-z]/g, ".");
    const email = `${emailPart}@bitmesra.ac.in`;

    // Find or create faculty
    const faculty = await prisma.faculty.upsert({
      where: { email },
      update: { name: t, departmentId },
      create: { name: t, email, departmentId },
    });

    // Link to course
    await prisma.courseFaculty.upsert({
      where: { courseId_facultyId: { courseId, facultyId: faculty.id } },
      update: {},
      create: { courseId, facultyId: faculty.id },
    });
  }
}

