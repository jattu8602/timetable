import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });
  const departments = await prisma.department.findMany();
  const branches = await prisma.branch.findMany();
  const result = data.map((c) => ({
    ...c,
    department: departments.find((d) => d.id === c.departmentId) ?? null,
    branch: branches.find((b) => b.id === c.branchId) ?? null,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name, credits, type, courseType, branchId, semester, departmentId } = body;
  if (!code || !name || credits == null || !type || !branchId || !semester || !departmentId) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }
  const data = await prisma.course.create({
    data: { code, name, credits, type, courseType: courseType ?? type, branchId, semester, departmentId },
  });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, code, name, credits, type, courseType, branchId, semester, departmentId } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.course.update({
    where: { id },
    data: { code, name, credits, type, courseType, branchId, semester, departmentId },
  });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
