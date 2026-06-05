import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.timetable.findMany({
    where: { deletedAt: null },
    include: { department: true, branch: true, slots: true },
    orderBy: { createdAt: "desc" },
  });

  const result = data.map((tt) => ({
    ...tt,
    department: tt.department ? { name: tt.department.name, shortCode: tt.department.shortCode } : null,
    branch: tt.branch ? { name: tt.branch.name, program: tt.branch.program } : null,
    _count: { slots: tt.slots.length },
  }));

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.timetable.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.timetable.update({
    where: { id },
    data: { deletedAt: null },
  });
  return NextResponse.json(data);
}
