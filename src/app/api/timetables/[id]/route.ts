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

  return NextResponse.json({
    ...data,
    department: data.department ? { name: data.department.name, shortCode: data.department.shortCode } : null,
    branch: data.branch ? { name: data.branch.name, program: data.branch.program } : null,
    slots: data.slots,
  });
}
