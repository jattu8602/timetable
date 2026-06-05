import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await prisma.timetable.findUnique({ where: { id } });
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [department, branch, slots] = await Promise.all([
    prisma.department.findUnique({ where: { id: data.departmentId } }),
    prisma.branch.findUnique({ where: { id: data.branchId } }),
    prisma.timeSlot.findMany({
      where: { timetableId: data.id },
      orderBy: [{ dayOfWeek: "asc" }, { periodName: "asc" }],
    }),
  ]);

  return NextResponse.json({
    ...data,
    department: department ? { name: department.name, shortCode: department.shortCode } : null,
    branch: branch ? { name: branch.name, program: branch.program } : null,
    slots,
  });
}
