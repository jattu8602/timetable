import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.timetable.findMany({
    include: {
      department: { select: { name: true, shortCode: true } },
      branch: { select: { name: true, program: true } },
      _count: { select: { slots: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
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
