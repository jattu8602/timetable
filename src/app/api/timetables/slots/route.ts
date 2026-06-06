import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, subjectDetails } = body;

  if (!id) {
    return NextResponse.json({ error: "slot id required" }, { status: 400 });
  }

  const data = await prisma.timeSlot.update({
    where: { id },
    data: { subjectDetails },
  });

  return NextResponse.json(data);
}
