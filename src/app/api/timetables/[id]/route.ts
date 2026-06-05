import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await prisma.timetable.findUnique({
    where: { id },
    include: {
      department: { select: { name: true, shortCode: true } },
      branch: { select: { name: true, program: true } },
      slots: { orderBy: [{ dayOfWeek: "asc" }, { periodName: "asc" }] },
    },
  });
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
