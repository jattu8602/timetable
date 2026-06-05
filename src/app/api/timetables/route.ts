import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.timetable.findMany({ orderBy: { createdAt: "desc" } });
  const departments = await prisma.department.findMany();
  const branches = await prisma.branch.findMany();
  const slotCounts = await prisma.timeSlot.groupBy({
    by: ["timetableId"],
    _count: { id: true },
  });

  const result = data.map((tt) => {
    const dept = departments.find((d) => d.id === tt.departmentId);
    const branch = branches.find((b) => b.id === tt.branchId);
    const slotCount = slotCounts.find((s) => s.timetableId === tt.id)?._count.id ?? 0;
    return {
      ...tt,
      department: dept ? { name: dept.name, shortCode: dept.shortCode } : null,
      branch: branch ? { name: branch.name, program: branch.program } : null,
      _count: { slots: slotCount },
    };
  });

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.timetable.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
