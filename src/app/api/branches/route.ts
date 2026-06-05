import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  const departments = await prisma.department.findMany();
  const result = data.map((b) => ({
    ...b,
    department: departments.find((d) => d.id === b.departmentId) ?? null,
  }));
  return NextResponse.json(result);
}
